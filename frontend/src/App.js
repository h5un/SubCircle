import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CreateSubscription from './pages/CreateSubscription';
import MySubscriptions from './pages/MySubscriptions';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreateSubscription />} />
            <Route path="/subscriptions" element={<MySubscriptions />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App; 