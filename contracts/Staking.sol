// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Staking is Ownable {
    uint256 public endTime;
    uint256 public constant DAY = 1 days;
    uint256 public tttPerSec = (1000 * 10**18) / DAY;
    uint256 public usdtSupply;
    IERC20 public token;
    IERC20 public immutable usdt;
    mapping(address => UserInfo) public userInfo;

    uint256 private lastRewardTime;
    uint256 private accTTTPerShare;
    bool private isInitialized = false;

    struct UserInfo {
        uint256 amount;
        uint256 rewardDebt;
    }

    constructor(IERC20 _usdt) {
        usdt = _usdt;
    }

    /**
     @dev Initializes contract with TTT contract. Can be called only by owner once
     @param _token TTT address
     */

    function initialize(IERC20 _token) external onlyOwner {
        require(!isInitialized, "Staking: already has initialized");
        isInitialized = true;
        token = _token;
        endTime = block.timestamp + 30 * DAY;
        lastRewardTime = block.timestamp;
    }

    /**
     @dev Deposit function. Sends reward, if user already has deposited 
     @param _amount amount of usdt user are going to deposit
     */
    function deposit(uint256 _amount) external {
        require(
            isInitialized && block.timestamp <= endTime,
            "Staking: completed or not started"
        );
        address user = msg.sender;
        updatePool();
        usdt.transferFrom(user, address(this), _amount);
        userInfo[user].amount += _amount;
        usdtSupply += _amount;
        sendReward(user);
        userInfo[user].rewardDebt =
            (userInfo[user].amount * accTTTPerShare) /
            1e12;
    }

    /**
     @dev Withdraw function. For withdraw only reward without deposit set 0
     @param _amount amount of usdt user are going to withdraw
     */
    function withdraw(uint256 _amount) external {
        require(isInitialized, "Staking: not started");
        address user = msg.sender;
        UserInfo memory info = userInfo[user];
        require(info.amount >= _amount, "Staking: too much");
        updatePool();
        sendReward(user);
        if (_amount > 0) {
            usdt.transfer(user, _amount);
            userInfo[user].amount -= _amount;
            usdtSupply -= _amount;
        }
        userInfo[user].rewardDebt = (info.amount * accTTTPerShare) / 1e12;
    }

    /**
     @dev Recalculates accTTTPerShare and lastRewardTime params
     */
    function updatePool() public {
        if (block.timestamp <= lastRewardTime) {
            return;
        }
        if (usdtSupply == 0) {
            lastRewardTime = block.timestamp;
            return;
        }
        uint256 multiplier = _getMultiplier(lastRewardTime, block.timestamp);
        uint256 tttReward = multiplier * tttPerSec;
        accTTTPerShare += (tttReward * 1e12) / usdtSupply;
        lastRewardTime = block.timestamp;
    }

    /**
     @dev Called while deposit or withdraw. Sends reward for user
     */
    function sendReward(address _user) private {
        UserInfo memory info = userInfo[_user];
        uint256 pending = (info.amount * accTTTPerShare) /
            1e12 -
            info.rewardDebt;
        if (pending > 0) {
            (bool success, ) = address(token).call(
                abi.encodeWithSignature(
                    "mintReward(address,uint256)",
                    _user,
                    pending
                )
            );
            require(success);
        }
    }

    /**
     @dev Calcalutes time between last update and block.timestamp, or endTime if staking is over
     */
    function _getMultiplier(uint256 _from, uint256 _to)
        private
        view
        returns (uint256)
    {
        return _to < endTime ? _to - _from : endTime - _from;
    }
}
