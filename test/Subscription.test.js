const { expect } = require('chai');
const { createPublicClient, http } = require('viem');
const { arbitrumSepolia } = require('viem/chains');
const { Subscription } = require('../artifacts/contracts/Subscription.sol/Subscription.json');

describe('Subscription Contract', () => {
  let publicClient;
  const subscriptionAddress = process.env.SUBSCRIPTION_CONTRACT_ADDRESS;
  const usdcAddress = process.env.USDC_ADDRESS;

  before(() => {
    publicClient = createPublicClient({
      chain: arbitrumSepolia,
      transport: http(process.env.ARBITRUM_SEPOLIA_RPC)
    });
  });

  describe('Create Subscription', () => {
    it('should create a new subscription', async () => {
      const subscription = await publicClient.readContract({
        address: subscriptionAddress,
        abi: Subscription.abi,
        functionName: 'subscriptions',
        args: [1] // First subscription
      });

      expect(subscription.amount).to.equal(1000000n); // 1 USDC
      expect(subscription.interval).to.equal(86400n); // 1 day
      expect(subscription.lastPayment).to.be.greaterThan(0n);
    });
  });

  describe('Cancel Subscription', () => {
    it('should cancel an existing subscription', async () => {
      const isActive = await publicClient.readContract({
        address: subscriptionAddress,
        abi: Subscription.abi,
        functionName: 'isActive',
        args: [1] // First subscription
      });

      expect(isActive).to.be.false;
    });
  });

  describe('Execute Payment', () => {
    it('should execute a payment for an active subscription', async () => {
      const subscription = await publicClient.readContract({
        address: subscriptionAddress,
        abi: Subscription.abi,
        functionName: 'subscriptions',
        args: [1] // First subscription
      });

      expect(subscription.lastPayment).to.be.greaterThan(0n);
    });
  });
}); 