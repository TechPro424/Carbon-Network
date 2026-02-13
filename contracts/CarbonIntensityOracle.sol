// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/libraries/FunctionsRequest.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * Production-ready Electricity Maps integration using Chainlink Functions
 * This replaces the simplified oracle with real API calls
 */
contract CarbonIntensityOracle is FunctionsClient, Ownable {
    using FunctionsRequest for FunctionsRequest.Request;

    // Chainlink Functions configuration
    bytes32 public latestRequestId;
    uint256 public carbonIntensity;
    string public currentZone;
    uint64 public subscriptionId;
    uint32 public gasLimit = 300000;
    bytes32 public donID;
    
    // Source code for the Chainlink Function (JavaScript)
    string public source;
    
    // Secrets reference (encrypted API key)
    bytes public encryptedSecretsUrls;
    
    mapping(bytes32 => bool) public validRequests;
    
    event CarbonIntensityRequested(bytes32 indexed requestId, string zone);
    event CarbonIntensityUpdated(uint256 intensity, string zone);
    event RequestFailed(bytes32 indexed requestId, bytes error);
    
    constructor(
        address router,
        uint64 _subscriptionId,
        bytes32 _donID
    ) FunctionsClient(router) Ownable(msg.sender) {
        subscriptionId = _subscriptionId;
        donID = _donID;
    }
    
    /**
     * Set the source code for the Chainlink Function
     * This should be the JavaScript code from electricityMapsSource.js
     */
    function setSource(string memory _source) external onlyOwner {
        source = _source;
    }
    
    /**
     * Set encrypted secrets reference (for API key)
     */
    function setEncryptedSecretsUrls(bytes memory _encryptedSecretsUrls) external onlyOwner {
        encryptedSecretsUrls = _encryptedSecretsUrls;
    }
    
    /**
     * Request carbon intensity for a specific zone
     * Zone examples: "IN-KA" (Karnataka), "US-CA" (California), "DE" (Germany)
     */
    function requestCarbonIntensity(string memory zone) external returns (bytes32) {
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(source);
        
        // Pass zone as argument
        string[] memory args = new string[](1);
        args[0] = zone;
        req.setArgs(args);
        
        // Set encrypted secrets reference if available
        if (encryptedSecretsUrls.length > 0) {
            req.addSecretsReference(encryptedSecretsUrls);
        }
        
        // Send the request
        bytes32 requestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            gasLimit,
            donID
        );
        
        validRequests[requestId] = true;
        latestRequestId = requestId;
        currentZone = zone;
        
        emit CarbonIntensityRequested(requestId, zone);
        return requestId;
    }
    
    /**
     * Callback function - called by Chainlink oracle
     */
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        require(validRequests[requestId], "Invalid request");
        
        if (err.length > 0) {
            emit RequestFailed(requestId, err);
            return;
        }
        
        // Decode response (uint256)
        carbonIntensity = abi.decode(response, (uint256));
        
        emit CarbonIntensityUpdated(carbonIntensity, currentZone);
    }
    
    /**
     * Get current grid status based on carbon intensity
     * Threshold: < 300 gCO2/kWh = CLEAN, >= 300 = DIRTY
     */
    function getGridStatus() public view returns (string memory) {
        if (carbonIntensity < 300) {
            return "CLEAN";
        } else {
            return "DIRTY";
        }
    }
    
    /**
     * HACKATHON/TESTING: Manual override
     * Remove in production or restrict heavily
     */
    function setCarbonIntensity(uint256 _intensity) external onlyOwner {
        carbonIntensity = _intensity;
        emit CarbonIntensityUpdated(_intensity, "MANUAL");
    }
    
    /**
     * Update configuration
     */
    function updateConfig(
        uint64 _subscriptionId,
        uint32 _gasLimit,
        bytes32 _donID
    ) external onlyOwner {
        subscriptionId = _subscriptionId;
        gasLimit = _gasLimit;
        donID = _donID;
    }
}
