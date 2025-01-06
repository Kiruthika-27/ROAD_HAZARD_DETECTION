const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners(); 

    console.log("Deploying contracts with the account:", deployer.address);

    const balance = await deployer.getBalance();
    console.log("Account balance:", ethers.utils.formatEther(balance), "ETH");

    const TrafficDataStorage = await ethers.getContractFactory("TrafficDataStorage");
    const trafficDataStorage = await TrafficDataStorage.deploy();
    await trafficDataStorage.deployed();

    console.log("TrafficDataStorage deployed to:", trafficDataStorage.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
