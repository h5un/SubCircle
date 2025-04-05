// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/interfaces/AutomationCompatibleInterface.sol";

contract Subscription is AutomationCompatibleInterface {
    address public immutable i_owner;
    uint256 public s_lastTimeStamp;
    uint256 public immutable i_interval;

    // Events
    event Ping();

    constructor (uint256 interval) {
        i_owner = msg.sender;
        s_lastTimeStamp = block.timestamp;
        i_interval = interval;
    }

    // Automation functions
    function checkUpkeep(bytes calldata /* checkData */) external view returns (bool upkeepNeeded, bytes memory /* performData */) {
        upkeepNeeded = (block.timestamp >= s_lastTimeStamp + i_interval);
        return (upkeepNeeded, "");
    }

    function performUpkeep(bytes calldata /* performData */) external override {
        if ((block.timestamp - s_lastTimeStamp) < i_interval) {
            revert("Subscription period has not elapsed");
        }
        s_lastTimeStamp = block.timestamp;
        // Perform subscription logic here
        // 
        emit Ping();
    }
}
