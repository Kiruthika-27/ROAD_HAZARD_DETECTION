// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyContract {
    string private message;

    event MessageUpdated(string newMessage);

    function setMessage(string calldata newMessage) external {
        message = newMessage;
        emit MessageUpdated(newMessage);
    }

    function getMessage() external view returns (string memory) {
        return message;
    }
}
