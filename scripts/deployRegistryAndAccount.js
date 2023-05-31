// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const relay = "";
const pool = "";
const name = "RailGunAave";
const symbol ="RAV"

async function main() {
  const Registry = await hre.ethers.getContractFactory("ERC6551Registry");
  const Account = await hre.ethers.getContractFactory("DefaultERC6551Account");
  const registry = await Registry.deploy(name,symbol);
  const account = await Account.deploy();



  await registry.deployed();
  await account.deployed();
  console.log("Registry",registry.address);
  console.log("Account", account.address);

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
