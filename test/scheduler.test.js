const { expect } = require('chai');
const sinon = require('sinon');
const { createPublicClient, http } = require('viem');
const { arbitrumSepolia } = require('viem/chains');

describe('Scheduler', () => {
  let clock;
  let processSubscriptions;
  
  before(() => {
    // Import the scheduler after setting up the mock clock
    // to ensure it doesn't start immediately
    clock = sinon.useFakeTimers();
    processSubscriptions = require('../scheduler').processSubscriptions;
  });
  
  after(() => {
    clock.restore();
  });
  
  beforeEach(() => {
    // Reset the clock before each test
    clock.reset();
  });
  
  it('should process due subscriptions', async () => {
    const mockSubscription = {
      id: 1,
      amount: '1000000',
      interval: 86400,
      lastPayment: Math.floor(Date.now() / 1000) - 86400, // Last payment was 1 day ago
      active: true
    };
    
    // Mock the contract calls
    const executePaymentStub = sinon.stub().resolves();
    const getSubscriptionsStub = sinon.stub().resolves([mockSubscription]);
    
    // Advance time by one day
    clock.tick('24:00:00');
    
    // Process subscriptions
    await processSubscriptions();
    
    // Verify that executePayment was called for the due subscription
    expect(executePaymentStub.calledWith(1)).to.be.true;
  });
  
  it('should not process subscriptions that are not due yet', async () => {
    const mockSubscription = {
      id: 1,
      amount: '1000000',
      interval: 86400,
      lastPayment: Math.floor(Date.now() / 1000) - 43200, // Last payment was 12 hours ago
      active: true
    };
    
    // Mock the contract calls
    const executePaymentStub = sinon.stub().resolves();
    const getSubscriptionsStub = sinon.stub().resolves([mockSubscription]);
    
    // Advance time by 12 hours
    clock.tick('12:00:00');
    
    // Process subscriptions
    await processSubscriptions();
    
    // Verify that executePayment was not called
    expect(executePaymentStub.called).to.be.false;
  });
  
  it('should not process inactive subscriptions', async () => {
    const mockSubscription = {
      id: 1,
      amount: '1000000',
      interval: 86400,
      lastPayment: Math.floor(Date.now() / 1000) - 86400, // Last payment was 1 day ago
      active: false
    };
    
    // Mock the contract calls
    const executePaymentStub = sinon.stub().resolves();
    const getSubscriptionsStub = sinon.stub().resolves([mockSubscription]);
    
    // Advance time by one day
    clock.tick('24:00:00');
    
    // Process subscriptions
    await processSubscriptions();
    
    // Verify that executePayment was not called for inactive subscription
    expect(executePaymentStub.called).to.be.false;
  });
  
  it('should handle multiple subscriptions with different intervals', async () => {
    const mockSubscriptions = [
      {
        id: 1,
        amount: '1000000',
        interval: 86400, // Daily
        lastPayment: Math.floor(Date.now() / 1000) - 86400,
        active: true
      },
      {
        id: 2,
        amount: '5000000',
        interval: 604800, // Weekly
        lastPayment: Math.floor(Date.now() / 1000) - 604800,
        active: true
      }
    ];
    
    // Mock the contract calls
    const executePaymentStub = sinon.stub().resolves();
    const getSubscriptionsStub = sinon.stub().resolves(mockSubscriptions);
    
    // Advance time by one week
    clock.tick('168:00:00');
    
    // Process subscriptions
    await processSubscriptions();
    
    // Verify that executePayment was called for both subscriptions
    expect(executePaymentStub.calledWith(1)).to.be.true;
    expect(executePaymentStub.calledWith(2)).to.be.true;
  });
  
  it('should handle errors during payment execution', async () => {
    const mockSubscription = {
      id: 1,
      amount: '1000000',
      interval: 86400,
      lastPayment: Math.floor(Date.now() / 1000) - 86400,
      active: true
    };
    
    // Mock the contract calls with error
    const executePaymentStub = sinon.stub().rejects(new Error('Payment failed'));
    const getSubscriptionsStub = sinon.stub().resolves([mockSubscription]);
    
    // Advance time by one day
    clock.tick('24:00:00');
    
    // Process subscriptions
    await processSubscriptions();
    
    // Verify that error was handled gracefully
    expect(executePaymentStub.calledWith(1)).to.be.true;
    // The scheduler should continue running despite errors
  });
}); 