// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "./CarbonGhostNFT.sol";

contract GameLogic {
    CarbonGhostNFT public nftContract;
    
    // Economic parameters
    uint256 public constant DEPOSIT_AMOUNT = 1 ether;
    uint256 public constant CLEAN_REWARD = 0.002 ether;
    uint256 public constant DIRTY_PENALTY = 0.003 ether;
    uint256 public constant DEATH_SLASH = 0.1 ether;
    
    address public constant BURN_ADDRESS = 0x000000000000000000000000000000000000dEaD;
    
    // Financial tracking
    mapping(address => uint256) public deposits;
    mapping(address => uint256) public lifetimeRewards;
    mapping(address => uint256) public lifetimePenalties;
    
    // Block-based integration tracking
    uint256 public constant INTEGRATION_START_BLOCK = 5000;
    uint256 public integrationInterval; // Blocks between calculations (~107/month)
    mapping(address => uint256) public lastIntegrationBlock;
    
    event Deposited(address indexed user, uint256 amount);
    event Rewarded(address indexed user, uint256 amount, uint256 health);
    event Penalized(address indexed user, uint256 amount, uint256 health);
    event DeathSlash(address indexed user, uint256 slashAmount, uint256 remaining);
    event IntegrationCalculated(address indexed device, uint256 blockNumber, uint256 health);
    
    constructor(address _nftContract, uint256 _integrationInterval) {
        nftContract = CarbonGhostNFT(_nftContract);
        integrationInterval = _integrationInterval;
    }
    
    function deposit() public payable {
        require(msg.value >= DEPOSIT_AMOUNT, "Insufficient deposit");
        deposits[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }
    
    /**
     * @notice Process reading and apply economic consequences
     * Called by relay after off-chain computation
     */
    function processReading(
        address device,
        uint256 tokenId,
        string memory gridStatus,
        uint256 newHealth,
        uint256 oldHealth
    ) public {
        require(deposits[device] > 0, "No deposit found");
        
        if (keccak256(bytes(gridStatus)) == keccak256(bytes("CLEAN"))) {
            // CLEAN ENERGY - Reward
            deposits[device] += CLEAN_REWARD;
            lifetimeRewards[device] += CLEAN_REWARD;
            emit Rewarded(device, CLEAN_REWARD, newHealth);
            
        } else if (keccak256(bytes(gridStatus)) == keccak256(bytes("DIRTY"))) {
            // DIRTY ENERGY - Penalize
            
            // Check if ghost just died (health dropped to Dead range: 0-20%)
            bool ghostDied = (oldHealth >= 20 && newHealth < 20);
            
            if (ghostDied) {
                // MAJOR SLASHING
                uint256 slashAmount = DEATH_SLASH;
                
                if (deposits[device] >= slashAmount) {
                    deposits[device] -= slashAmount;
                    payable(BURN_ADDRESS).transfer(slashAmount);
                    lifetimePenalties[device] += slashAmount;
                    emit DeathSlash(device, slashAmount, deposits[device]);
                } else {
                    uint256 remaining = deposits[device];
                    deposits[device] = 0;
                    if (remaining > 0) {
                        payable(BURN_ADDRESS).transfer(remaining);
                    }
                    lifetimePenalties[device] += remaining;
                    emit DeathSlash(device, remaining, 0);
                }
            } else {
                // Normal penalty
                if (deposits[device] >= DIRTY_PENALTY) {
                    deposits[device] -= DIRTY_PENALTY;
                    payable(BURN_ADDRESS).transfer(DIRTY_PENALTY);
                    lifetimePenalties[device] += DIRTY_PENALTY;
                } else {
                    lifetimePenalties[device] += DIRTY_PENALTY;
                }
                emit Penalized(device, DIRTY_PENALTY, newHealth);
            }
        }
        
        // Track integration calculations
        if (block.number >= lastIntegrationBlock[device] + integrationInterval) {
            lastIntegrationBlock[device] = block.number;
            emit IntegrationCalculated(device, block.number, newHealth);
        }
    }
    
    function withdraw() public {
        uint256 amount = deposits[msg.sender];
        require(amount > 0, "No deposit to withdraw");
        
        deposits[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }
    
    function getDeposit(address user) public view returns (uint256) {
        return deposits[user];
    }
    
    function getLifetimeStats(address user) public view returns (
        uint256 totalRewards,
        uint256 totalPenalties,
        int256 netChange
    ) {
        totalRewards = lifetimeRewards[user];
        totalPenalties = lifetimePenalties[user];
        netChange = int256(totalRewards) - int256(totalPenalties);
    }
    
    function shouldCalculateIntegration(address device) public view returns (bool) {
        return block.number >= lastIntegrationBlock[device] + integrationInterval;
    }
    
    receive() external payable {
        deposit();
    }
}