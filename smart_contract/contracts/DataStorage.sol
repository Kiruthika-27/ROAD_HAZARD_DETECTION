// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DataStorage {
    string public trafficIpfsHash;
    string public accidentIpfsHash;

    event TrafficDataStored(string ipfsHash);
    event AccidentDataStored(string ipfsHash);

    function storeTrafficData(string memory _ipfsHash) public {
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        trafficIpfsHash = _ipfsHash;
        emit TrafficDataStored(_ipfsHash);
    }

    function getTrafficData() public view returns (string memory) {
        return trafficIpfsHash;
    }

    function storeAccidentData(string memory _ipfsHash) public {
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        accidentIpfsHash = _ipfsHash;
        emit AccidentDataStored(_ipfsHash);
    }

    function getAccidentData() public view returns (string memory) {
        return accidentIpfsHash;
    }
}
