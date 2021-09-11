
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { SafeMath } from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Address } from "@openzeppelin/contracts/utils/Address.sol";
import { Context } from "@openzeppelin/contracts/utils/Context.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// For interacting with our own strategy
interface IStrategy {
    // Want address
    function wantAddress() external view returns (address);
    
    // Total want tokens managed by strategy
    function wantLockedTotal() external view returns (uint256);

    // Sum of all shares of users to wantLockedTotal
    function sharesTotal() external view returns (uint256);

    // Main want token compounding function
    function earn() external;
    
    function harvest() external;

    function set_fee(uint256 _fee) external;
    
    function getHarvestable() external view returns (uint256);
    
    
    function keepFXS() external view returns (uint256);
 

    function keepFXSmax() external view returns (uint256);
}

contract autocompounder is Ownable, ReentrancyGuard {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    // Info of each user.
    struct PoolInfo {
        address strat; // Strategy address that will auto compound want tokens
        uint lastTimeHarvest;
        bool active;
        uint last5MinProfit;
        uint totalProfit;
    }

    PoolInfo[] public poolInfo; // Info of each pool.
    mapping(uint => PoolInfo) private pid;

    event AddPool(address indexed strat);
  
    function poolLength() external view returns (uint256) {
        return poolInfo.length;
    }

    /**
     * @dev Add a new want to the pool. Can only be called by the owner.
     */
    function addAddress(address _address) external onlyOwner nonReentrant{
        uint length = poolInfo.length; 
        pid[length] = PoolInfo(_address, 0, true,0,0);
        poolInfo.push(pid[length]);
   
        
    }

    function harvestAllx2( uint _pid) external onlyOwner nonReentrant {
          IStrategy strategy = IStrategy(pid[_pid].strat);
          uint256 _profit =strategy.getHarvestable();
          uint256 fee =_profit.mul(strategy.keepFXS()).div(strategy.keepFXSmax());
          poolInfo[_pid].last5MinProfit= _profit-fee;
          poolInfo[_pid].totalProfit= poolInfo[_pid].totalProfit +(_profit - fee);
          
          strategy.harvest();
          poolInfo[_pid].lastTimeHarvest=block.timestamp;

    }
    
    
    function setFeeAll(uint _pid ,uint _fee) external onlyOwner nonReentrant{
        
        IStrategy(pid[_pid].strat).set_fee(_fee);
        
    }  
    
    function removeAddress( uint _pid) external onlyOwner nonReentrant {
        poolInfo[_pid].active = false;
        
         
 }
    function getInformation(uint _pid) view external  returns(address,uint256,bool,uint256,uint256){
        return  (poolInfo[_pid].strat,poolInfo[_pid].lastTimeHarvest,poolInfo[_pid].active,poolInfo[_pid].last5MinProfit,poolInfo[_pid].totalProfit);
    }
}
