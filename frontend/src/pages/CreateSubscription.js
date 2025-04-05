import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CreateSubscription() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    interval: '86400', // Default to daily
    description: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      console.log('Submitting form data:', formData);
      const response = await fetch('http://localhost:3001/api/subscription/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: String(parseFloat(formData.amount) * 1000000), // Convert to USDC decimals
          interval: parseInt(formData.interval),
          description: formData.description
        }),
      });

      const data = await response.json();
      console.log('Response:', data);

      if (response.ok) {
        navigate('/subscriptions');
      } else {
        setError(data.error || 'Failed to create subscription');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Subscription</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Amount (USDC)</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            step="0.000001"
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Interval</label>
          <select
            name="interval"
            value={formData.interval}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="86400">Daily</option>
            <option value="604800">Weekly</option>
            <option value="2592000">Monthly</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full ${
            loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
          } text-white px-4 py-2 rounded-md transition-colors`}
        >
          {loading ? 'Creating...' : 'Create Subscription'}
        </button>
      </form>
    </div>
  );
}

export default CreateSubscription; 