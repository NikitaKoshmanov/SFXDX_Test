// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TTT is ERC20, Ownable {
    constructor(address staking) ERC20("TTT", "TTT") {
        transferOwnership(staking);
    }

    function mintReward(address _to, uint256 _amount) external onlyOwner {
        _mint(_to, _amount);
    }
}
