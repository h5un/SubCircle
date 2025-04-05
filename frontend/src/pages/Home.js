import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        Welcome to Circle Paymaster
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        Create and manage your USDC subscriptions with gasless transactions
      </p>
      <div className="space-x-4">
        <Link
          to="/create"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
        >
          Create Subscription
        </Link>
        <Link
          to="/subscriptions"
          className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700"
        >
          View Subscriptions
        </Link>
      </div>
    </div>
  );
}

export default Home; 