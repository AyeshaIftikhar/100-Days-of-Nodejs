import React, { useState } from 'react';
import axios from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { generateCommitment, generateProof } from '@/lib/zkp/zkp';

const API_URL = 'http://localhost:3000/api';

const AuthPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // Generate a random salt (in a real app, this would be from the server)
      const saltResponse = await axios.get(`${API_URL}/auth/salt/${username}`);
      const salt = saltResponse.data.salt || Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // Generate password commitment
      const commitment = await generateCommitment(password, salt);

      // Send registration request to server
      const response = await axios.post(`${API_URL}/auth/register`, {
        username,
        commitment
      });

      setMessage(`Registration successful! Username: ${response.data.username}`);
    } catch (error: any) {
      console.error('Registration error:', error);
      setMessage(`Registration failed: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // Get salt for this user
      const saltResponse = await axios.get(`${API_URL}/auth/salt/${loginUsername}`);
      const salt = saltResponse.data.salt;

      // Generate commitment from password and salt
      const commitment = await generateCommitment(loginPassword, salt);

      // Generate zero-knowledge proof
      const { proof, publicSignals } = await generateProof(
        loginPassword,
        salt,
        commitment
      );

      // Send proof to server for verification
      const response = await axios.post(`${API_URL}/zkp/verify`, {
        username: loginUsername,
        proof,
        publicSignals
      });

      setMessage('Authentication successful!');
      setIsAuthenticated(true);
    } catch (error: any) {
      console.error('Login error:', error);
      setMessage(`Login failed: ${error.response?.data?.error || error.message}`);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Zero-Knowledge Proof Auth</h1>
          <p className="text-muted-foreground">
            Secure authentication without sending your password
          </p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-username">Username</Label>
                <Input
                  id="login-username"
                  placeholder="Enter your username"
                  value={loginUsername}
                  onChange={e => setLoginUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-username">Username</Label>
                <Input
                  id="register-username"
                  placeholder="Choose a username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="Choose a password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Registering...' : 'Register'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {message && (
          <div className={`p-4 rounded-md ${isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}

        <div className="mt-8 p-4 border rounded-md bg-muted/50">
          <h2 className="font-semibold mb-2">How Zero-Knowledge Proofs Work:</h2>
          <ol className="list-decimal pl-5 space-y-1 text-sm">
            <li>Your password never leaves your device</li>
            <li>We create a mathematical commitment to your password</li>
            <li>When logging in, we prove we know the password without revealing it</li>
            <li>The server verifies the proof without seeing your password</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
