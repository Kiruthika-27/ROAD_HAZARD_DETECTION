const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DataStorage", function () {
    let DataStorage;
    let dataStorage;

    beforeEach(async function () {
        DataStorage = await ethers.getContractFactory("DataStorage");
        dataStorage = await DataStorage.deploy();
        await dataStorage.deployed();
    });

    it("Should store and retrieve traffic data", async function () {
        const ipfsHash = "QmTYNYdd4SFYgSSyNKTpWAgt5Ur582EepY1VM7vtdjEVFC"; // Example IPFS hash
        await dataStorage.storeTrafficData(ipfsHash);
        expect(await dataStorage.getTrafficData()).to.equal(ipfsHash);
    });

    it("Should revert when storing empty IPFS hash", async function () {
        await expect(dataStorage.storeTrafficData("")).to.be.revertedWith("IPFS hash cannot be empty");
    });

    it("Should store and retrieve accident data", async function () {
        const ipfsHash = "QmR5j2aWzt57kK3ARaGMU6DRk9sAm2nCKZkDABjzHdaUgK"; // Example IPFS hash
        await dataStorage.storeAccidentData(ipfsHash);
        expect(await dataStorage.getAccidentData()).to.equal(ipfsHash);
    });

    it("Should revert when storing empty accident IPFS hash", async function () {
        await expect(dataStorage.storeAccidentData("")).to.be.revertedWith("IPFS hash cannot be empty");
    });
});
