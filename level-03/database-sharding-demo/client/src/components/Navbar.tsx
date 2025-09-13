import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';

const Navbar: React.FC = () => {
  return (
    <nav className="border-b">
      <div className="container flex h-16 items-center px-4">
        <Link to="/" className="flex items-center">
          <span className="text-xl font-bold">DB Sharding Demo</span>
        </Link>
        
        <div className="ml-auto flex items-center space-x-4">
          <Link to="/">
            <Button variant="ghost">Overview</Button>
          </Link>
          <Link to="/users">
            <Button variant="ghost">Users</Button>
          </Link>
          <Link to="/products">
            <Button variant="ghost">Products</Button>
          </Link>
          <Link to="/transactions">
            <Button variant="ghost">Transactions</Button>
          </Link>
          <Link to="/settings">
            <Button variant="ghost">Settings</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
