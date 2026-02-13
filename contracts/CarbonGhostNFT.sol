// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title CarbonGhostNFT - Seasonal Dynamic Soulbound NFT
 * @notice Ghost evolves through seasons based on carbon behavior
 * 
 * HEALTH RANGES & SEASONS:
 * 75-100: Spring (Healthy, blooming, bright green)
 * 50-75:  Summer (Okay, warm, yellow-green)
 * 25-50:  Fall (Concerning, declining, orange/brown)
 * 2-25:   Winter (Critical, dying, dark/gray)
 * 0-1:    Dead (Slashing penalty, black)
 */
contract CarbonGhostNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    
    struct Ghost {
        uint256 health; // 0-100
        string season; // "Spring", "Summer", "Fall", "Winter", "Dead"
        string mood; // Descriptive mood based on season
        uint256 lastUpdate;
        address deviceOwner;
        bytes32 hardwareId;
        bool isSoulbound;
        uint256 totalCleanReadings;
        uint256 totalDirtyReadings;
        uint256 consecutiveClean; // For streak bonuses
        uint256 consecutiveDirty; // For streak penalties
    }
    
    mapping(uint256 => Ghost) public ghosts;
    mapping(address => uint256) public deviceToToken;
    mapping(bytes32 => uint256) public hardwareToToken;
    mapping(bytes32 => bool) public hardwareRegistered;
    
    // Seasonal image URIs
    string public springGhostURI = "ipfs://QmSpringGhost";
    string public summerGhostURI = "ipfs://QmSummerGhost";
    string public fallGhostURI = "ipfs://QmFallGhost";
    string public winterGhostURI = "ipfs://QmWinterGhost";
    string public deadGhostURI = "ipfs://QmDeadGhost";
    
    // Health change rates (per reading)
    uint256 public constant CLEAN_HEAL_RATE = 2; // +2% per clean reading
    uint256 public constant DIRTY_DAMAGE_RATE = 3; // -3% per dirty reading
    uint256 public constant STREAK_BONUS = 1; // +1% bonus per 5 consecutive
    
    event GhostMinted(uint256 indexed tokenId, address indexed owner, bytes32 hardwareId);
    event GhostUpdated(uint256 indexed tokenId, uint256 health, string season, string mood);
    event SeasonChanged(uint256 indexed tokenId, string fromSeason, string toSeason);
    event HardwareTransferred(uint256 indexed tokenId, address from, address to);
    event GhostDied(uint256 indexed tokenId, address owner);
    
    constructor() ERC721("CarbonGhost", "GHOST") Ownable(msg.sender) {}
    
    function mintGhost(address to, address deviceAddress, bytes32 hardwareId) public onlyOwner returns (uint256) {
        require(!hardwareRegistered[hardwareId], "Hardware already has a ghost");
        
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        
        // Start at 50% health (neutral state)
        ghosts[tokenId] = Ghost({
            health: 50,
            season: "Summer", // Start in neutral season
            mood: "Neutral",
            lastUpdate: block.timestamp,
            deviceOwner: to,
            hardwareId: hardwareId,
            isSoulbound: true,
            totalCleanReadings: 0,
            totalDirtyReadings: 0,
            consecutiveClean: 0,
            consecutiveDirty: 0
        });
        
        deviceToToken[deviceAddress] = tokenId;
        hardwareToToken[hardwareId] = tokenId;
        hardwareRegistered[hardwareId] = true;
        
        _setTokenURI(tokenId, summerGhostURI);
        
        emit GhostMinted(tokenId, to, hardwareId);
        return tokenId;
    }
    
    /**
     * @notice Update ghost based on energy reading
     * @param tokenId The ghost token ID
     * @param status "CLEAN" or "DIRTY"
     */
    function updateGhost(uint256 tokenId, string memory status) public onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Ghost does not exist");
        
        Ghost storage ghost = ghosts[tokenId];
        string memory oldSeason = ghost.season;
        uint256 oldHealth = ghost.health;
        
        if (keccak256(bytes(status)) == keccak256(bytes("CLEAN"))) {
            // CLEAN ENERGY - Heal the ghost
            ghost.totalCleanReadings++;
            ghost.consecutiveClean++;
            ghost.consecutiveDirty = 0; // Reset dirty streak
            
            // Calculate healing amount
            uint256 healAmount = CLEAN_HEAL_RATE;
            
            // Streak bonus: +1% for every 5 consecutive clean readings
            if (ghost.consecutiveClean % 5 == 0 && ghost.consecutiveClean > 0) {
                healAmount += STREAK_BONUS;
            }
            
            // Apply healing (cap at 100)
            if (ghost.health + healAmount > 100) {
                ghost.health = 100;
            } else {
                ghost.health += healAmount;
            }
            
        } else if (keccak256(bytes(status)) == keccak256(bytes("DIRTY"))) {
            // DIRTY ENERGY - Damage the ghost
            ghost.totalDirtyReadings++;
            ghost.consecutiveDirty++;
            ghost.consecutiveClean = 0; // Reset clean streak
            
            // Calculate damage amount
            uint256 damageAmount = DIRTY_DAMAGE_RATE;
            
            // Streak penalty: +1% extra damage for every 5 consecutive dirty readings
            if (ghost.consecutiveDirty % 5 == 0 && ghost.consecutiveDirty > 0) {
                damageAmount += STREAK_BONUS;
            }
            
            // Apply damage (floor at 0)
            if (ghost.health < damageAmount) {
                ghost.health = 0;
            } else {
                ghost.health -= damageAmount;
            }
        }
        
        // Update season and mood based on new health
        _updateSeasonAndMood(tokenId);
        
        // Update timestamp
        ghost.lastUpdate = block.timestamp;
        
        // Emit events
        emit GhostUpdated(tokenId, ghost.health, ghost.season, ghost.mood);
        
        if (keccak256(bytes(oldSeason)) != keccak256(bytes(ghost.season))) {
            emit SeasonChanged(tokenId, oldSeason, ghost.season);
        }
        
        if (ghost.health == 0 && oldHealth > 0) {
            emit GhostDied(tokenId, ghost.deviceOwner);
        }
    }
    
    /**
     * @notice Internal function to update season and mood based on health
     * @param tokenId The ghost token ID
     */
    function _updateSeasonAndMood(uint256 tokenId) internal {
        Ghost storage ghost = ghosts[tokenId];
        
        if (ghost.health >= 75 && ghost.health <= 100) {
            // 75-100: SPRING - Healthy, blooming
            ghost.season = "Spring";
            ghost.mood = "Blooming";
            _setTokenURI(tokenId, springGhostURI);
            
        } else if (ghost.health >= 50 && ghost.health < 75) {
            // 50-75: SUMMER - Okay, warm
            ghost.season = "Summer";
            ghost.mood = "Warm";
            _setTokenURI(tokenId, summerGhostURI);
            
        } else if (ghost.health >= 25 && ghost.health < 50) {
            // 25-50: FALL - Concerning, declining
            ghost.season = "Fall";
            ghost.mood = "Declining";
            _setTokenURI(tokenId, fallGhostURI);
            
        } else if (ghost.health >= 2 && ghost.health < 25) {
            // 2-25: WINTER - Critical, dying
            ghost.season = "Winter";
            ghost.mood = "Critical";
            _setTokenURI(tokenId, winterGhostURI);
            
        } else {
            // 0-1: DEAD - Slashing penalty
            ghost.season = "Dead";
            ghost.mood = "Dead";
            _setTokenURI(tokenId, deadGhostURI);
        }
    }
    
    function getGhost(uint256 tokenId) public view returns (Ghost memory) {
        require(_ownerOf(tokenId) != address(0), "Ghost does not exist");
        return ghosts[tokenId];
    }
    
    function getGhostHistory(uint256 tokenId) public view returns (
        uint256 totalClean,
        uint256 totalDirty,
        uint256 health,
        string memory season,
        uint256 cleanStreak,
        uint256 dirtyStreak
    ) {
        require(_ownerOf(tokenId) != address(0), "Ghost does not exist");
        Ghost memory ghost = ghosts[tokenId];
        return (
            ghost.totalCleanReadings,
            ghost.totalDirtyReadings,
            ghost.health,
            ghost.season,
            ghost.consecutiveClean,
            ghost.consecutiveDirty
        );
    }
    
    /**
     * @notice Override transfers to make soulbound
     */
    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        
        if (from == address(0)) {
            return super._update(to, tokenId, auth);
        }
        
        if (ghosts[tokenId].isSoulbound && from != address(0)) {
            revert("Ghost is soulbound to hardware - use transferHardware()");
        }
        
        return super._update(to, tokenId, auth);
    }
    
    /**
     * @notice Transfer ghost when hardware is sold (preserves all history)
     */
    function transferHardware(uint256 tokenId, address newOwner) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(newOwner != address(0), "Invalid new owner");
        
        Ghost storage ghost = ghosts[tokenId];
        address oldOwner = ghost.deviceOwner;
        
        ghost.deviceOwner = newOwner;
        _transfer(oldOwner, newOwner, tokenId);
        
        emit HardwareTransferred(tokenId, oldOwner, newOwner);
    }
    
    /**
     * @notice Generate dynamic on-chain metadata
     */
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Ghost does not exist");
        
        Ghost memory ghost = ghosts[tokenId];
        
        string memory imageUri = _getImageURI(ghost.season);
        string memory seasonEmoji = _getSeasonEmoji(ghost.season);
        
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "Carbon Ghost #',
                        Strings.toString(tokenId),
                        '",',
                        '"description": "Season: ',
                        ghost.season,
                        ' (',
                        ghost.mood,
                        ') | Health: ',
                        Strings.toString(ghost.health),
                        '/100',
                        '",',
                        '"image": "',
                        imageUri,
                        '",',
                        '"attributes": [',
                        '{"trait_type": "Health", "value": ',
                        Strings.toString(ghost.health),
                        '},',
                        '{"trait_type": "Season", "value": "',
                        ghost.season,
                        ' ',
                        seasonEmoji,
                        '"},',
                        '{"trait_type": "Mood", "value": "',
                        ghost.mood,
                        '"},',
                        '{"trait_type": "Total Clean Readings", "value": ',
                        Strings.toString(ghost.totalCleanReadings),
                        '},',
                        '{"trait_type": "Total Dirty Readings", "value": ',
                        Strings.toString(ghost.totalDirtyReadings),
                        '},',
                        '{"trait_type": "Clean Streak", "value": ',
                        Strings.toString(ghost.consecutiveClean),
                        '},',
                        '{"trait_type": "Dirty Streak", "value": ',
                        Strings.toString(ghost.consecutiveDirty),
                        '}',
                        ']}'
                    )
                )
            )
        );
        
        return string(abi.encodePacked("data:application/json;base64,", json));
    }
    
    function _getImageURI(string memory season) internal view returns (string memory) {
        if (keccak256(bytes(season)) == keccak256(bytes("Spring"))) return springGhostURI;
        if (keccak256(bytes(season)) == keccak256(bytes("Summer"))) return summerGhostURI;
        if (keccak256(bytes(season)) == keccak256(bytes("Fall"))) return fallGhostURI;
        if (keccak256(bytes(season)) == keccak256(bytes("Winter"))) return winterGhostURI;
        return deadGhostURI;
    }
    
    function _getSeasonEmoji(string memory season) internal pure returns (string memory) {
        if (keccak256(bytes(season)) == keccak256(bytes("Spring"))) return "\\uD83C\\uDF38"; // 🌸
        if (keccak256(bytes(season)) == keccak256(bytes("Summer"))) return "\\u2600\\uFE0F";  // ☀️
        if (keccak256(bytes(season)) == keccak256(bytes("Fall"))) return "\\uD83C\\uDF42";   // 🍂
        if (keccak256(bytes(season)) == keccak256(bytes("Winter"))) return "\\u2744\\uFE0F";  // ❄️
        return "\\u2620\\uFE0F"; // ☠️
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
