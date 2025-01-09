// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RoadHazardStorage {
    // Structures for vehicle and hazard data
    struct VehicleData {
        uint256 speed; // Vehicle speed
        uint256 position; // Vehicle position
        uint256 timestamp; // Data collection timestamp
    }

    struct Hazard { 
        uint256 position;
        uint256 timestamp;
        string hazardType;
    }

    // Mappings and arrays for data storage
    mapping(address => VehicleData) public vehicleData; // Vehicle data for each vehicle
    Hazard[] public detectedHazards; // Array to store detected hazards

    // IPFS storage for traffic and accident data
    string public trafficIpfsHash;
    string public accidentIpfsHash;

    // Thresholds and trusted node data
    uint256 public constant SPEED_THRESHOLD = 100; // Speed threshold for hazard detection
    uint256 public constant POSITION_RANGE = 500; // Range for positional hazards
    address[] public trustedNodes; // Consortium of trusted nodes

    // Events
    event DataBroadcasted(address indexed vehicle, uint256 speed, uint256 position, uint256 timestamp);
    event DataValidated(address indexed vehicle, uint256 speed, uint256 position, uint256 timestamp);
    event HazardDetected(address indexed vehicle, uint256 position, uint256 timestamp, string hazardType);
    event HazardShared(uint256 position, uint256 timestamp, string hazardType);
    event TrafficDataStored(string ipfsHash);
    event AccidentDataStored(string ipfsHash);

    // Modifier to restrict access to trusted nodes
    modifier onlyTrustedNode() {
        require(isTrustedNode(msg.sender), "Only trusted nodes can call this function");
        _;
    }

    // Constructor to initialize the contract with trusted nodes
    constructor(address[] memory _trustedNodes) {
        trustedNodes = _trustedNodes;
    }

    // Check if an address is a trusted node
    function isTrustedNode(address node) public view returns (bool) {
        for (uint256 i = 0; i < trustedNodes.length; i++) {
            if (trustedNodes[i] == node) {
                return true;
            }
        }
        return false;
    }

    // Store traffic data to IPFS
    function storeTrafficData(string memory _ipfsHash) public {
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        trafficIpfsHash = _ipfsHash;
        emit TrafficDataStored(_ipfsHash);
    }

    // Retrieve traffic data IPFS hash
    function getTrafficData() public view returns (string memory) {
        return trafficIpfsHash;
    }

    // Store accident data to IPFS
    function storeAccidentData(string memory _ipfsHash) public {
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        accidentIpfsHash = _ipfsHash;
        emit AccidentDataStored(_ipfsHash);
    }

    // Retrieve accident data IPFS hash
    function getAccidentData() public view returns (string memory) {
        return accidentIpfsHash;
    }

    // Broadcast vehicle data
    function broadcastData(uint256 speed, uint256 position, uint256 timestamp) public {
        require(speed > 0, "Speed must be greater than zero");
        require(position > 0, "Position must be greater than zero");
        require(timestamp > 0, "Timestamp must be valid");

        vehicleData[msg.sender] = VehicleData(speed, position, timestamp);

        emit DataBroadcasted(msg.sender, speed, position, timestamp);

        // Validate and process the data
        validateData(msg.sender);
    }

    // Validate vehicle data
    function validateData(address vehicle) internal {
        VehicleData memory data = vehicleData[vehicle];

        // Example hash validation (mock validation for illustration)
        bytes32 hash = keccak256(abi.encode(data.speed, data.position, data.timestamp));
        require(hash != bytes32(0), "Data integrity check failed");

        emit DataValidated(vehicle, data.speed, data.position, data.timestamp);

        // Check for hazards
        detectHazard(vehicle);
    }

    // Detect hazards based on vehicle data
    function detectHazard(address vehicle) internal {
        VehicleData memory data = vehicleData[vehicle];

        if (data.speed > SPEED_THRESHOLD) {
            string memory hazardType = "Overspeeding";
            detectedHazards.push(Hazard(data.position, data.timestamp, hazardType));
            emit HazardDetected(vehicle, data.position, data.timestamp, hazardType);
        }

        // Additional hazard checks can be added here
    }

    // Share detected hazards with trusted nodes
    function shareHazards() public onlyTrustedNode {
        for (uint256 i = 0; i < detectedHazards.length; i++) {
            Hazard memory hazard = detectedHazards[i];
            emit HazardShared(hazard.position, hazard.timestamp, hazard.hazardType);
        }
    }

    // Retrieve all detected hazards
    function getAllHazards() public view returns (Hazard[] memory) {
        return detectedHazards;
    }
}
