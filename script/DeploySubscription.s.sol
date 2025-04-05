// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {Script} from "forge-std/Script.sol";
import {Subscription} from "../src/Subscription.sol";

contract DeploySubscription is Script {
    function run() external returns (Subscription) {
        uint256 interval = 30 days; // Set subscription interval to 30 days
        
        vm.startBroadcast();
        Subscription subscription = new Subscription(interval);
        vm.stopBroadcast();

        return subscription;
    }
}
