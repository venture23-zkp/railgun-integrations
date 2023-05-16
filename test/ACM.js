const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const {anyValue} = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const {expect} = require("chai");

describe("Address Contract Manager", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployAddressManager() {

    const name = "Private Aave AM";
    const symbol = "PACM"

    // Contracts are deployed using the first signer/account by default
    const [owner, relayAcc, poolAcc] = await ethers.getSigners();

    const relay = relayAcc.address;
    const pool = poolAcc.address;

    const ACM = await ethers.getContractFactory("AddressContractManager");
    const acm = await ACM.deploy(relay, pool, name, symbol);
    const acmAddress = acm.address;
    console.log(relay, pool)

    return {acm, relayAcc, poolAcc, owner};
  }

  describe("Deployment", function () {
    it("Should return right relay and pool", async function () {
      const {acm, relayAcc, poolAcc, owner} = await loadFixture(
          deployAddressManager);
      expect(await acm.relay()).to.equal(relayAcc.address);
      expect(await acm.aavePool()).to.equal(poolAcc.address);
    });
  });

  describe("Setting up Address Contract", function () {
    it("Should set the address contract for the NFTid", async function () {
      let id = 1;
      const {acm, relayAcc, poolAcc, owner} = await loadFixture(
          deployAddressManager);
      for (let i = 0; i < 5; i++) {
        await expect(acm.connect(owner).setupAC(id)).to.be.revertedWith(
            "Unauthorized access:Only Relay Can Call");
        await expect(acm.connect(poolAcc).setupAC(id)).to.be.revertedWith(
            "Unauthorized access:Only Relay Can Call");
        const passedSetup = await acm.connect(relayAcc).setupAC(id);
        expect(passedSetup).to.emit(acm, "contractCreated");
        expect(await acm.ownerOf(id)).to.equal(relayAcc.address);
        id = id + 1;
      }
      expect(await acm.balanceOf(relayAcc.address)).to.equal(5);

    });
  });
  describe("Deposit Validation Address Manager", function () {
    it("deposit should only be called by relay", async function () {
      let id = 1;
      const {acm, relayAcc, poolAcc, owner} = await loadFixture(
          deployAddressManager);
      const fakeToken = owner.address;
      for (let i = 0; i < 5; i++) {
        await acm.connect(relayAcc).setupAC(id);
        await expect(acm.connect(poolAcc).deposit(id, fakeToken,
            100)).to.be.revertedWith("Unauthorized access:Only Relay Can Call");
        await expect(acm.connect(owner).deposit(id, fakeToken,
            100)).to.be.revertedWith("Unauthorized access:Only Relay Can Call");
        await expect(acm.connect(relayAcc).deposit(id, fakeToken, 100)).to.be.reverted;
        id = id + 1;
      }
      await expect(acm.connect(relayAcc).deposit(500, fakeToken,
          100)).to.be.revertedWith("ERC721: invalid token ID");

    });
  });
  describe("Borrow Validation Address Manager", function () {
    it("borrow should only be called by relay", async function () {
      let id = 1;

      const {acm, relayAcc, poolAcc, owner} = await loadFixture(
          deployAddressManager);
      const fakeToken = owner.address;
      for (let i = 0; i < 5; i++) {
        await acm.connect(relayAcc).setupAC(id);
        await expect(acm.connect(poolAcc).borrow(id, fakeToken,
            100,1)).to.be.revertedWith("Unauthorized access:Only Relay Can Call");
        await expect(acm.connect(owner).borrow(id, fakeToken,
            100,1)).to.be.revertedWith("Unauthorized access:Only Relay Can Call");
        await expect(acm.connect(relayAcc).borrow(id, fakeToken, 100,1)).to.be.reverted;
        id = id + 1;
      }
      await expect(acm.connect(relayAcc).borrow(500, fakeToken,
          100,2)).to.be.revertedWith("ERC721: invalid token ID");
    });
  });
  describe("Repay Validation Address Manager", function () {
    it("repay should only be called by relay", async function () {
      let id = 1;

      const {acm, relayAcc, poolAcc, owner} = await loadFixture(
          deployAddressManager);
      const fakeToken = owner.address;
      for (let i = 0; i < 5; i++) {
        await acm.connect(relayAcc).setupAC(id);
        await expect(acm.connect(poolAcc).repay(id, fakeToken,
            100,1)).to.be.revertedWith("Unauthorized access:Only Relay Can Call");
        await expect(acm.connect(owner).repay(id, fakeToken,
            100,1)).to.be.revertedWith("Unauthorized access:Only Relay Can Call");
        await expect(acm.connect(relayAcc).repay(id, fakeToken, 100,1)).to.be.reverted;
        id = id + 1;
      }
      await expect(acm.connect(relayAcc).repay(500, fakeToken,
          100,2)).to.be.revertedWith("ERC721: invalid token ID");

    });
  });
  describe("Withdraw Validation Address Manager", function () {
    it("withdraw should only be called by relay", async function () {
      let id = 1;
      const {acm, relayAcc, poolAcc, owner} = await loadFixture(
          deployAddressManager);
      const fakeToken = owner.address;
      for (let i = 0; i < 5; i++) {
        await acm.connect(relayAcc).setupAC(id);
        await expect(acm.connect(poolAcc).withdraw(id, fakeToken,
            100)).to.be.revertedWith("Unauthorized access:Only Relay Can Call");
        await expect(acm.connect(owner).withdraw(id, fakeToken,
            100)).to.be.revertedWith("Unauthorized access:Only Relay Can Call");
        await expect(acm.connect(relayAcc).withdraw(id, fakeToken, 100)).to.be.reverted;
        id = id + 1;
      }
      await expect(acm.connect(relayAcc).withdraw(500, fakeToken,
          100)).to.be.revertedWith("ERC721: invalid token ID");

    });
  });
});
