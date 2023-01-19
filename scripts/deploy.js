const hre = require("hardhat");

async function main() {

  const USDT = await hre.ethers.getContractFactory("USDTMock");
  const usdt = await USDT.deploy();
  await usdt.deployed();
  // await verify(usdt, []);

  const Staking = await hre.ethers.getContractFactory("Staking");
  const staking = await Staking.deploy(usdt.address);
  await staking.deployed();
  await verify(staking, [usdt.address]);

  const TTT = await hre.ethers.getContractFactory("TTT");
  const ttt = await TTT.deploy(staking.address);
  await ttt.deployed();
  await verify(ttt, [staking.address]);

}

async function verify(contract, arguments) {
  await hre.run("verify:verify", {
    address: contract.address,
    constructorArguments: arguments
  })
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });