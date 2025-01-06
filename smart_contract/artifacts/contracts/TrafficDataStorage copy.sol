// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TrafficDataStorage {
    event DataStored(address indexed sender, string ipfsHash);

    string public ipfsHash;

    function storeData(string memory _ipfsHash) public {
        ipfsHash = _ipfsHash;
        emit DataStored(msg.sender, _ipfsHash);
    }
    // Example Solidity function
    function getData() public view returns (string memory) {
    return ipfsHash; // Assuming ipfsHash is a state variable holding the IPFS hash
    }

}
