// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract USDTMock is ERC20, Ownable {
    constructor() ERC20("USDTMock", "USDT") {}

    function mintTo(address _to, uint256 _amount) external onlyOwner {
        _mint(_to, _amount);
    }
}
