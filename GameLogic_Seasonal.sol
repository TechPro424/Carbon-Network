// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "./CarbonGhostNFT_Seasonal.sol";

contract GameLogic {
    CarbonGhostNFT public nftContract;
    
    uint256 public constant DEPOSIT_AMOUNT = 1 ether; // 1 MATIC
    uint256 public constant CLEAN_REWARD = 0.002 ether; // +0.002 MATIC per clean reading
    uint256 public constant DIRTY_PENALTY = 0.003 ether; // -0.003 MATIC per dirty reading
    uint256 public constant DEATH_SLASH = 0.1 ether; // Major slash when ghost dies (0->1 health)
    
    address public burnAddress = 0x000000000000000000000000000000000000dEaD;
    
    mapping(address => uint256) public deposits;
    mapping(address => uint256) public greenCredits;
    mapping(address => uint256) public lifetimeRewards; // Track total rewards earned
    mapping(address => uint256) public lifetimePenalties; // Track total penalties paid
    
    event Deposited(address indexed user, uint256 amount);
    event Rewarded(address indexed user, uint256 amount, uint256 newHealth);
    event Penalized(address indexed user, uint256 amount, uint256 newHealth);
    event GreenCreditEarned(address indexed user, uint256 credits);
    event DeathSlash(address indexed user, uint256 slashAmount, uint256 remaining);
    
    constructor(address _nftContract) {
        nftContract = CarbonGhostNFT(_nftContract);
    }
    
    function deposit() public payable {
        require(msg.value >= DEPOSIT_AMOUNT, "Insufficient deposit");
        deposits[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }
    
    /**
     * @notice Process energy reading and update ghost + deposits
     * @param device Device address
     * @param tokenId Ghost token ID
     * @param gridStatus "CLEAN" or "DIRTY"
     */
    function processReading(
        address device,
        uint256 tokenId,
        string memory gridStatus
    ) public {
        require(deposits[device] > 0, "No deposit found");
        
        // Get ghost state before update
        (,, uint256 oldHealth, string memory oldSeason,,) = nftContract.getGhostHistory(tokenId);
        
        // Update ghost (this changes health and season)
        nftContract.updateGhost(tokenId, gridStatus);
        
        // Get new ghost state
        (,, uint256 newHealth, string memory newSeason,,) = nftContract.getGhostHistory(tokenId);
        
        if (keccak256(bytes(gridStatus)) == keccak256(bytes("CLEAN"))) {
            // CLEAN ENERGY - Reward
            greenCredits[device] += 1;
            deposits[device] += CLEAN_REWARD;
            lifetimeRewards[device] += CLEAN_REWARD;
            
            emit Rewarded(device, CLEAN_REWARD, newHealth);
            emit GreenCreditEarned(device, 1);
            
        } else if (keccak256(bytes(gridStatus)) == keccak256(bytes("DIRTY"))) {
            // DIRTY ENERGY - Penalize
            uint256 penaltyAmount = DIRTY_PENALTY;
            
            // Check if ghost just died (health went from >0 to 0)
            bool ghostDied = (oldHealth > 0 && newHealth == 0);
            
            if (ghostDied) {
                // MAJOR SLASHING when ghost dies
                penaltyAmount = DEATH_SLASH;
                
                if (deposits[device] >= DEATH_SLASH) {
                    deposits[device] -= DEATH_SLASH;
                    payable(burnAddress).transfer(DEATH_SLASH);
                    emit DeathSlash(device, DEATH_SLASH, deposits[device]);
                } else {
                    // Slash everything they have
                    uint256 remainingDeposit = deposits[device];
                    deposits[device] = 0;
                    payable(burnAddress).transfer(remainingDeposit);
                    emit DeathSlash(device, remainingDeposit, 0);
                }
                
                lifetimePenalties[device] += penaltyAmount;
                
            } else {
                // Normal penalty
                if (deposits[device] >= DIRTY_PENALTY) {
                    deposits[device] -= DIRTY_PENALTY;
                    payable(burnAddress).transfer(DIRTY_PENALTY);
                    lifetimePenalties[device] += DIRTY_PENALTY;
                } else {
                    // Not enough to slash, just record
                    lifetimePenalties[device] += DIRTY_PENALTY;
                }
                
                emit Penalized(device, penaltyAmount, newHealth);
            }
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
    
    function getGreenCredits(address user) public view returns (uint256) {
        return greenCredits[user];
    }
    
    function getLifetimeStats(address user) public view returns (
        uint256 totalRewards,
        uint256 totalPenalties,
        uint256 netChange
    ) {
        totalRewards = lifetimeRewards[user];
        totalPenalties = lifetimePenalties[user];
        
        if (totalRewards > totalPenalties) {
            netChange = totalRewards - totalPenalties; // Positive
        } else {
            netChange = 0; // Negative or break-even
        }
    }
    
    receive() external payable {
        deposit();
    }
}
