// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Subscription is Ownable {
    struct SubscriptionPlan {
        address subscriber;
        address recipient;
        uint256 amount;
        uint256 frequency; // in seconds
        uint256 lastPayment;
        bool isActive;
    }

    mapping(address => SubscriptionPlan) public subscriptions;
    IERC20 public usdc;

    event SubscriptionCreated(
        address indexed subscriber,
        address indexed recipient,
        uint256 amount,
        uint256 frequency
    );
    event SubscriptionCancelled(address indexed subscriber);
    event PaymentExecuted(
        address indexed subscriber,
        address indexed recipient,
        uint256 amount
    );

    constructor(address _usdc) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
    }

    function createSubscription(
        address recipient,
        uint256 amount,
        uint256 frequency
    ) external {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be greater than 0");
        require(frequency >= 1 days, "Frequency must be at least 1 day");
        require(
            subscriptions[msg.sender].subscriber == address(0),
            "Subscription already exists"
        );

        subscriptions[msg.sender] = SubscriptionPlan({
            subscriber: msg.sender,
            recipient: recipient,
            amount: amount,
            frequency: frequency,
            lastPayment: block.timestamp,
            isActive: true
        });

        emit SubscriptionCreated(msg.sender, recipient, amount, frequency);
    }

    function cancelSubscription() external {
        require(
            subscriptions[msg.sender].subscriber == msg.sender,
            "No active subscription"
        );
        subscriptions[msg.sender].isActive = false;
        emit SubscriptionCancelled(msg.sender);
    }

    function executePayment(address subscriber) external {
        SubscriptionPlan storage plan = subscriptions[subscriber];
        require(plan.isActive, "Subscription is not active");
        require(
            block.timestamp >= plan.lastPayment + plan.frequency,
            "Payment not due yet"
        );

        require(
            usdc.transferFrom(subscriber, plan.recipient, plan.amount),
            "Transfer failed"
        );

        plan.lastPayment = block.timestamp;
        emit PaymentExecuted(subscriber, plan.recipient, plan.amount);
    }

    function getSubscription(
        address subscriber
    ) external view returns (SubscriptionPlan memory) {
        return subscriptions[subscriber];
    }
} 