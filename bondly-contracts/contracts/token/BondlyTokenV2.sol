// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./BondlyToken.sol";

contract BondlyTokenV2 is BondlyTokenUpgradeable {
    function versionV2() public pure returns (string memory) {
        return "2.0.0";
    }
} 