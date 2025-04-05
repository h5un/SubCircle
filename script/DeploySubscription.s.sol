// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import "../src/Subscription.sol";

contract DeploySubscription is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address usdcAddress = vm.envAddress("USDC_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);

        Subscription subscription = new Subscription(usdcAddress);
        
        console.log("Subscription contract deployed at:", address(subscription));

        vm.stopBroadcast();
    }
} 