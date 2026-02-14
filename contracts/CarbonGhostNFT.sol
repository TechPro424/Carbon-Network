// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CarbonGhostNFT - Power-Weighted Dynamic NFT
 * @notice Ghost appearance based on (α × g × 100) / (g + b)
 */
contract CarbonGhostNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    
    struct Ghost {
        uint256 health;              // 0-100 calculated from credits
        string appearance;           // VeryHealthy/Healthy/Neutral/Bad/Dead
        uint256 lastUpdate;
        address deviceOwner;
        bytes32 hardwareId;
        bool isSoulbound;
        uint256 goodCredits;         // g(t)
        uint256 badCredits;          // b(t)
        uint256 currentAlpha;        // Last calculated alpha (scaled by 1000)
        uint256 currentPowerMW;      // Current power in MW
    }
    
    mapping(uint256 => Ghost) public ghosts;
    mapping(address => uint256) public deviceToToken;
    mapping(bytes32 => uint256) public hardwareToToken;
    mapping(bytes32 => bool) public hardwareRegistered;
    
    // URIs for 5 appearances
    string public veryHealthyURI = "ipfs://QmVeryHealthyGhost";
    string public healthyURI = "ipfs://QmHealthyGhost";
    string public neutralURI = "ipfs://QmNeutralGhost";
    string public badURI = "ipfs://QmBadGhost";
    string public deadURI = "ipfs://QmDeadGhost";
    
    event GhostMinted(uint256 indexed tokenId, address indexed owner, bytes32 hardwareId);
    event GhostUpdated(uint256 indexed tokenId, uint256 health, string appearance, uint256 goodCredits, uint256 badCredits);
    event HardwareTransferred(uint256 indexed tokenId, address from, address to);
    
    constructor() ERC721("CarbonGhost", "GHOST") Ownable(msg.sender) {}
    
    function mintGhost(address to, address deviceAddress, bytes32 hardwareId) public onlyOwner returns (uint256) {
        require(!hardwareRegistered[hardwareId], "Hardware already has a ghost");
        
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        
        ghosts[tokenId] = Ghost({
            health: 50,
            appearance: "Neutral",
            lastUpdate: block.timestamp,
            deviceOwner: to,
            hardwareId: hardwareId,
            isSoulbound: true,
            goodCredits: 0,
            badCredits: 0,
            currentAlpha: 200, // Default 0.2
            currentPowerMW: 0
        });
        
        deviceToToken[deviceAddress] = tokenId;
        hardwareToToken[hardwareId] = tokenId;
        hardwareRegistered[hardwareId] = true;
        
        _setTokenURI(tokenId, neutralURI);
        
        emit GhostMinted(tokenId, to, hardwareId);
        return tokenId;
    }
    
    /**
     * @notice Update ghost with off-chain computed values
     * @param tokenId Ghost token ID
     * @param appearance VeryHealthy/Healthy/Neutral/Bad/Dead
     * @param health Computed health (0-100)
     * @param goodCredits Total good credits
     * @param badCredits Total bad credits
     * @param alpha Current alpha value (scaled by 1000)
     * @param powerMW Current power consumption in MW
     */
    function updateGhost(
        uint256 tokenId,
        string memory appearance,
        uint256 health,
        uint256 goodCredits,
        uint256 badCredits,
        uint256 alpha,
        uint256 powerMW
    ) public onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Ghost does not exist");
        require(health <= 100, "Health must be 0-100");
        
        Ghost storage ghost = ghosts[tokenId];
        
        // Update all values
        ghost.health = health;
        ghost.appearance = appearance;
        ghost.goodCredits = goodCredits;
        ghost.badCredits = badCredits;
        ghost.currentAlpha = alpha;
        ghost.currentPowerMW = powerMW;
        ghost.lastUpdate = block.timestamp;
        
        // Update URI based on appearance
        _updateURI(tokenId, appearance);
        
        emit GhostUpdated(tokenId, health, appearance, goodCredits, badCredits);
    }
    
    function _updateURI(uint256 tokenId, string memory appearance) internal {
        bytes32 appearanceHash = keccak256(bytes(appearance));
        
        if (appearanceHash == keccak256(bytes("VeryHealthy"))) {
            _setTokenURI(tokenId, veryHealthyURI);
        } else if (appearanceHash == keccak256(bytes("Healthy"))) {
            _setTokenURI(tokenId, healthyURI);
        } else if (appearanceHash == keccak256(bytes("Neutral"))) {
            _setTokenURI(tokenId, neutralURI);
        } else if (appearanceHash == keccak256(bytes("Bad"))) {
            _setTokenURI(tokenId, badURI);
        } else {
            _setTokenURI(tokenId, deadURI);
        }
    }
    
    function getGhost(uint256 tokenId) public view returns (Ghost memory) {
        require(_ownerOf(tokenId) != address(0), "Ghost does not exist");
        return ghosts[tokenId];
    }
    
    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        
        if (from == address(0)) {
            return super._update(to, tokenId, auth);
        }
        
        if (ghosts[tokenId].isSoulbound && from != address(0)) {
            revert("Ghost is soulbound to hardware");
        }
        
        return super._update(to, tokenId, auth);
    }
    
    function transferHardware(uint256 tokenId, address newOwner) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(newOwner != address(0), "Invalid new owner");
        
        Ghost storage ghost = ghosts[tokenId];
        address oldOwner = ghost.deviceOwner;
        
        ghost.deviceOwner = newOwner;
        _transfer(oldOwner, newOwner, tokenId);
        
        emit HardwareTransferred(tokenId, oldOwner, newOwner);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}