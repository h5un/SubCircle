// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import "../src/Subscription.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SubscriptionTest is Test {
    Subscription public subscription;
    address public constant USDC = 0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d;
    address public user = address(1);
    address public merchant = address(2);
    uint256 public constant AMOUNT = 1000000; // 1 USDC
    uint256 public constant INTERVAL = 86400; // 1 day

    function setUp() public {
        subscription = new Subscription(USDC);
        // Fund user with USDC
        deal(USDC, user, 1000000000); // 1000 USDC
        // Approve subscription contract
        vm.prank(user);
        IERC20(USDC).approve(address(subscription), type(uint256).max);
    }

    function testCreateSubscription() public {
        vm.prank(user);
        subscription.createSubscription(merchant, AMOUNT, INTERVAL);
        
        (uint256 amount, uint256 interval, uint256 lastPayment, bool active) = subscription.subscriptions(1);
        assertEq(amount, AMOUNT);
        assertEq(interval, INTERVAL);
        assertTrue(active);
    }

    function testExecutePayment() public {
        // Create subscription
        vm.prank(user);
        subscription.createSubscription(merchant, AMOUNT, INTERVAL);
        
        // Fast forward one interval
        vm.warp(block.timestamp + INTERVAL);
        
        // Execute payment
        subscription.executePayment(1);
        
        // Check merchant balance increased
        assertEq(IERC20(USDC).balanceOf(merchant), AMOUNT);
        
        // Check last payment time updated
        (,, uint256 lastPayment,) = subscription.subscriptions(1);
        assertEq(lastPayment, block.timestamp);
    }

    function testCannotExecutePaymentTooEarly() public {
        // Create subscription
        vm.prank(user);
        subscription.createSubscription(merchant, AMOUNT, INTERVAL);
        
        // Try to execute payment before interval
        vm.warp(block.timestamp + INTERVAL - 1);
        
        vm.expectRevert("Payment not due yet");
        subscription.executePayment(1);
    }

    function testCancelSubscription() public {
        // Create subscription
        vm.prank(user);
        subscription.createSubscription(merchant, AMOUNT, INTERVAL);
        
        // Cancel subscription
        vm.prank(user);
        subscription.cancelSubscription(1);
        
        // Check subscription is inactive
        (,,, bool active) = subscription.subscriptions(1);
        assertFalse(active);
    }

    function testMultiplePaymentCycles() public {
        // Create subscription
        vm.prank(user);
        subscription.createSubscription(merchant, AMOUNT, INTERVAL);
        
        // Test 3 payment cycles
        for(uint i = 1; i <= 3; i++) {
            vm.warp(block.timestamp + INTERVAL);
            subscription.executePayment(1);
            assertEq(IERC20(USDC).balanceOf(merchant), AMOUNT * i);
        }
    }
} 