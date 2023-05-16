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
  const ACM = await hre.ethers.getContractFactory("AddressManager");
  const acm = await ACM.deploy(relay,pool,name,symbol);

  await acm.deployed();
 console.log("Address manager -> ",acm.address);

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
