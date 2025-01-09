const { ethers } = require("hardhat");

async function main() {
    // Retrieve the deployer's account
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    // Display the deployer's account balance
    const balance = await deployer.getBalance();
    console.log("Account balance:", ethers.utils.formatEther(balance), "ETH");

    // Specify the fully qualified name of the contract
    const RoadHazardStorage = await ethers.getContractFactory("contracts/RoadHazardStorage.sol:RoadHazardStorage");

    // Define trusted nodes (add addresses as needed)
    const trustedNodes = [deployer.address]; // Add other trusted nodes as appropriate

    // Deploy the RoadHazardStorage contract
    const roadHazardStorage = await RoadHazardStorage.deploy(trustedNodes);
    await roadHazardStorage.deployed();

    console.log("RoadHazardStorage deployed to:", roadHazardStorage.address);
}

// Execute the main function and handle errors
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
