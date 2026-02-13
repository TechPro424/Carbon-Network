// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract CarbonGhostNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    
    struct Ghost {
        uint256 health; // 0-100
        string mood; // "Happy" or "Smoggy"
        uint256 lastUpdate;
        address deviceOwner;
        bytes32 hardwareId; // TPM/CPU unique identifier - BINDS to physical hardware
        bool isSoulbound; // Cannot be transferred arbitrarily
        uint256 totalCleanReadings;
        uint256 totalDirtyReadings;
    }
    
    mapping(uint256 => Ghost) public ghosts;
    mapping(address => uint256) public deviceToToken;
    mapping(bytes32 => uint256) public hardwareToToken; // Tie to physical hardware
    mapping(bytes32 => bool) public hardwareRegistered; // Prevent hardware reuse
    
    string public greenGhostURI = "ipfs://QmGreenGhost";
    string public smoggyGhostURI = "ipfs://QmSmoggyGhost";
    
    event GhostMinted(uint256 indexed tokenId, address indexed owner, bytes32 hardwareId);
    event GhostUpdated(uint256 indexed tokenId, uint256 health, string mood);
    event HardwareTransferred(uint256 indexed tokenId, address from, address to);
    
    constructor() ERC721("CarbonGhost", "GHOST") Ownable(msg.sender) {}
    
    function mintGhost(address to, address deviceAddress, bytes32 hardwareId) public onlyOwner returns (uint256) {
        require(!hardwareRegistered[hardwareId], "Hardware already has a ghost");
        
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        
        ghosts[tokenId] = Ghost({
            health: 50,
            mood: "Happy",
            lastUpdate: block.timestamp,
            deviceOwner: to,
            hardwareId: hardwareId,
            isSoulbound: true,
            totalCleanReadings: 0,
            totalDirtyReadings: 0
        });
        
        deviceToToken[deviceAddress] = tokenId;
        hardwareToToken[hardwareId] = tokenId;
        hardwareRegistered[hardwareId] = true;
        
        _setTokenURI(tokenId, greenGhostURI);
        
        emit GhostMinted(tokenId, to, hardwareId);
        return tokenId;
    }
    
    function updateGhost(uint256 tokenId, string memory status) public onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Ghost does not exist");
        
        Ghost storage ghost = ghosts[tokenId];
        
        if (keccak256(bytes(status)) == keccak256(bytes("CLEAN"))) {
            ghost.health = ghost.health + 10 > 100 ? 100 : ghost.health + 10;
            ghost.mood = "Happy";
            ghost.totalCleanReadings++;
            _setTokenURI(tokenId, greenGhostURI);
        } else if (keccak256(bytes(status)) == keccak256(bytes("DIRTY"))) {
            ghost.health = ghost.health < 10 ? 0 : ghost.health - 10;
            ghost.mood = "Smoggy";
            ghost.totalDirtyReadings++;
            _setTokenURI(tokenId, smoggyGhostURI);
        }
        
        ghost.lastUpdate = block.timestamp;
        emit GhostUpdated(tokenId, ghost.health, ghost.mood);
    }
    
    function getGhost(uint256 tokenId) public view returns (Ghost memory) {
        require(_ownerOf(tokenId) != address(0), "Ghost does not exist");
        return ghosts[tokenId];
    }
    
    /**
     * CRITICAL: Override transfers to prevent gaming the system
     * Ghost can only be transferred when hardware is physically transferred
     */
    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        
        // Allow minting (from == address(0))
        if (from == address(0)) {
            return super._update(to, tokenId, auth);
        }
        
        // Prevent normal transfers if soulbound
        if (ghosts[tokenId].isSoulbound && from != address(0)) {
            revert("Ghost is soulbound to hardware - use transferHardware()");
        }
        
        return super._update(to, tokenId, auth);
    }
    
    /**
     * Transfer ghost when hardware is sold
     * Preserves full history and health
     */
    function transferHardware(uint256 tokenId, address newOwner) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(newOwner != address(0), "Invalid new owner");
        
        Ghost storage ghost = ghosts[tokenId];
        address oldOwner = ghost.deviceOwner;
        
        // Update owner but preserve ALL history
        ghost.deviceOwner = newOwner;
        // Health stays the same - history is immutable!
        
        // Transfer the NFT
        _transfer(oldOwner, newOwner, tokenId);
        
        emit HardwareTransferred(tokenId, oldOwner, newOwner);
    }
    
    /**
     * View full history - transparent and immutable
     */
    function getGhostHistory(uint256 tokenId) public view returns (
        uint256 totalClean,
        uint256 totalDirty,
        uint256 health,
        bytes32 hardwareId
    ) {
        require(_ownerOf(tokenId) != address(0), "Ghost does not exist");
        Ghost memory ghost = ghosts[tokenId];
        return (
            ghost.totalCleanReadings,
            ghost.totalDirtyReadings,
            ghost.health,
            ghost.hardwareId
        );
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Ghost does not exist");
        
        Ghost memory ghost = ghosts[tokenId];
        
        // Generate dynamic metadata on-chain based on current state
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "Carbon Ghost #',
                        Strings.toString(tokenId),
                        '",',
                        '"description": "A soulbound NFT representing real-time carbon footprint of physical hardware. Health: ',
                        Strings.toString(ghost.health),
                        '/100, Mood: ',
                        ghost.mood,
                        '",',
                        '"image": "',
                        ghost.health >= 50 ? greenGhostURI : smoggyGhostURI,
                        '",',
                        '"attributes": [',
                        '{"trait_type": "Health", "value": ',
                        Strings.toString(ghost.health),
                        '},',
                        '{"trait_type": "Mood", "value": "',
                        ghost.mood,
                        '"},',
                        '{"trait_type": "Total Clean Readings", "value": ',
                        Strings.toString(ghost.totalCleanReadings),
                        '},',
                        '{"trait_type": "Total Dirty Readings", "value": ',
                        Strings.toString(ghost.totalDirtyReadings),
                        '},',
                        '{"trait_type": "Soulbound", "value": "',
                        ghost.isSoulbound ? "Yes" : "No",
                        '"},',
                        '{"trait_type": "Hardware ID", "value": "',
                        toHexString(ghost.hardwareId),
                        '"},',
                        '{"trait_type": "Clean Percentage", "value": ',
                        ghost.totalCleanReadings + ghost.totalDirtyReadings > 0 
                            ? Strings.toString((ghost.totalCleanReadings * 100) / (ghost.totalCleanReadings + ghost.totalDirtyReadings))
                            : "0",
                        '}',
                        ']}'
                    )
                )
            )
        );
        
        return string(abi.encodePacked("data:application/json;base64,", json));
    }
    
    function toHexString(bytes32 value) internal pure returns (string memory) {
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(66);
        str[0] = '0';
        str[1] = 'x';
        for (uint256 i = 0; i < 32; i++) {
            str[2 + i * 2] = alphabet[uint8(value[i] >> 4)];
            str[3 + i * 2] = alphabet[uint8(value[i] & 0x0f)];
        }
        return string(str);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
