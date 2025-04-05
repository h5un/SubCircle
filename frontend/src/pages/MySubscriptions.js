import React, { useState, useEffect } from 'react';

function MySubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/subscription/list');
        if (response.ok) {
          const data = await response.json();
          setSubscriptions(data);
        }
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  const handleCancel = async (subscriptionId) => {
    try {
      const response = await fetch('http://localhost:3001/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscriptionId }),
      });

      if (response.ok) {
        setSubscriptions(subscriptions.filter(sub => sub.id !== subscriptionId));
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">My Subscriptions</h2>
      {subscriptions.length === 0 ? (
        <p className="text-gray-600">No subscriptions found.</p>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((subscription) => (
            <div
              key={subscription.id}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {subscription.description || 'Subscription'}
                  </h3>
                  <p className="text-gray-600">
                    Amount: {subscription.amount / 1000000} USDC
                  </p>
                  <p className="text-gray-600">
                    Interval: {subscription.interval / 86400} days
                  </p>
                  <p className="text-gray-600">
                    Last Payment: {new Date(subscription.lastPayment * 1000).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleCancel(subscription.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MySubscriptions; 