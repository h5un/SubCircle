const express = require('express');
const cors = require('cors');
const { createPublicClient, http } = require('viem');
const { createBundlerClient } = require('viem/account-abstraction');
const { arbitrumSepolia } = require('viem/chains');
require('dotenv').config();

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:3000'
}));
app.use(express.json());

// In-memory storage for subscriptions (replace with database in production)
const subscriptions = [];
let nextId = 1;

const publicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(process.env.ARBITRUM_SEPOLIA_RPC)
});

const bundlerClient = createBundlerClient({
  chain: arbitrumSepolia,
  transport: http(process.env.ARBITRUM_SEPOLIA_RPC)
});

app.post('/api/subscription/create', async (req, res) => {
  try {
    console.log('Received subscription request:', req.body);
    const { amount, interval, description } = req.body;
    
    // Create new subscription
    const subscription = {
      id: nextId++,
      amount,
      interval,
      description,
      lastPayment: Math.floor(Date.now() / 1000),
      active: true
    };
    
    subscriptions.push(subscription);
    console.log('Creating subscription with:', subscription);
    
    res.json({ success: true, message: 'Subscription created', subscription });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/subscription/list', async (req, res) => {
  try {
    // Return only active subscriptions
    const activeSubscriptions = subscriptions.filter(sub => sub.active);
    res.json(activeSubscriptions);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/subscription/cancel', async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    const subscription = subscriptions.find(sub => sub.id === subscriptionId);
    
    if (!subscription) {
      return res.status(404).json({ success: false, error: 'Subscription not found' });
    }
    
    subscription.active = false;
    res.json({ success: true, message: 'Subscription cancelled' });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

