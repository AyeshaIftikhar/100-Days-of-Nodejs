import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="w-full max-w-4xl space-y-10 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight">
          Zero-Knowledge Proof Authentication Demo
        </h1>
        
        <p className="text-xl text-muted-foreground">
          A secure way to authenticate without revealing your password
        </p>

        <div className="flex justify-center space-x-4">
          <Button asChild size="lg">
            <Link to="/auth">Try It Now</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/learn">Learn More</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="flex flex-col space-y-2 p-6 border rounded-lg">
            <h2 className="text-xl font-bold">Enhanced Security</h2>
            <p className="text-muted-foreground">
              Your password never leaves your device, making it immune to server breaches.
            </p>
          </div>
          <div className="flex flex-col space-y-2 p-6 border rounded-lg">
            <h2 className="text-xl font-bold">Zero-Knowledge</h2>
            <p className="text-muted-foreground">
              Prove you know your password without revealing any information about it.
            </p>
          </div>
          <div className="flex flex-col space-y-2 p-6 border rounded-lg">
            <h2 className="text-xl font-bold">Modern Cryptography</h2>
            <p className="text-muted-foreground">
              Built on cutting-edge cryptographic protocols and zero-knowledge proofs.
            </p>
          </div>
        </div>

        <div className="mt-16 p-6 border rounded-lg bg-muted/50">
          <h2 className="text-2xl font-bold mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold mb-2">Traditional Authentication</h3>
              <ul className="text-left list-disc pl-5 space-y-1">
                <li>Password sent to server (risk of interception)</li>
                <li>Server stores password hash (risk of breach)</li>
                <li>Vulnerable to phishing attacks</li>
                <li>Password exposed in transit</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-2">ZKP Authentication</h3>
              <ul className="text-left list-disc pl-5 space-y-1">
                <li>Password never leaves your device</li>
                <li>Server only stores verification data, not password hashes</li>
                <li>Resistant to phishing (no password to steal)</li>
                <li>No sensitive data in transit</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
