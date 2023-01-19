const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, BN, expectRevert, snapshot } = require('@openzeppelin/test-helpers');

describe("Referral", function () {
    let token, usdt, staking;
    const day = new BN(60 * 60 * 24);
    const accounts = waffle.provider.getWallets();
    const deployer = accounts[0];
    const user1 = accounts[1];
    const user2 = accounts[2];
    const user3 = accounts[3];
    beforeEach(async () => {
        const Usdt = await ethers.getContractFactory("USDTMock");
        usdt = await Usdt.connect(deployer).deploy();
        await usdt.deployed();

        const Staking = await ethers.getContractFactory("Staking");
        staking = await Staking.connect(deployer).deploy(usdt.address);
        await staking.deployed();

        const Token = await ethers.getContractFactory("TTT");
        token = await Token.connect(deployer).deploy(staking.address);
        await token.deployed();

        await usdt.connect(deployer).mintTo(user1.address, 1000);
        await usdt.connect(deployer).mintTo(user2.address, 4000);
        await usdt.connect(deployer).mintTo(user3.address, 5000);
    })
    it("Should initializes", async function () {
        expect(await token.owner()).to.be.equal(staking.address);
        expect(await usdt.owner()).to.be.equal(deployer.address);
        expect(await staking.owner()).to.be.equal(deployer.address);
        expect(await staking.usdt()).to.be.equal(usdt.address);

        await expect(staking.connect(user1).initialize(token.address)).to.be.revertedWith("Ownable: caller is not the owner");
        
        await staking.connect(deployer).initialize(token.address);
        expect(await staking.token()).to.be.equal(token.address);
        endTimeTest = (await time.latest()).add(new BN(30 * day));
        endTimeTestStr = endTimeTest.toString();
        expect(await staking.endTime()).to.be.equal(endTimeTestStr);

        await expect(staking.connect(deployer).initialize(token.address)).to.be.revertedWith("Staking: already has initialized");
    })
    it("Should deposits", async function () {
        await expect(staking.connect(user1).deposit(1000)).to.be.revertedWith("Staking: completed or not started");

        await staking.connect(deployer).initialize(token.address);

        await usdt.connect(user1).approve(staking.address, 1000);
        await staking.connect(user1).deposit(1000);
        expect((await staking.userInfo(user1.address)).amount).to.be.equal("1000");

        await usdt.connect(user2).approve(staking.address, 4000);
        await staking.connect(user2).deposit(4000);
        expect((await staking.userInfo(user2.address)).amount).to.be.equal("4000");
    })
    it("Should calculates reward", async function () {
        await staking.connect(deployer).initialize(token.address);

        await time.advanceBlock();

        await usdt.connect(user1).approve(staking.address, 1000);
        await staking.connect(user1).deposit(1000);
        await usdt.connect(user2).approve(staking.address, 4000);
        await staking.connect(user2).deposit(4000);

        await time.increase(day);  // ~1000 на 5000 = 800 для 2-го юзера, 200 для 1-го

        await staking.connect(user1).withdraw(0);
        balance1 = parseInt(await token.balanceOf(user1.address) / 1e18);
        expect(balance1).to.be.equal(200);

        await time.increase(day);
        await staking.connect(user2).withdraw(0); // ~ 1600 за 2 дня
        balance2 = parseInt(await token.balanceOf(user2.address) / 1e18);
        expect(balance2).to.be.equal(1600);

        await usdt.connect(user3).approve(staking.address, 5000);
        await staking.connect(user3).deposit(5000);

        await time.increase(new BN(2 * day));
        // У 1-го 200 за 2ой + 100*2 за два дня = 400

        await staking.connect(user1).withdraw(1000);
        balance1 = parseInt(await token.balanceOf(user1.address) / 1e18);
        expect(balance1).to.be.equal(600); // 200 + 400
    })
    it("Should calculates only for 30 days", async function () {
        await staking.connect(deployer).initialize(token.address);

        await time.advanceBlock();
        await usdt.connect(user1).approve(staking.address, 1000);
        await staking.connect(user1).deposit(1000);
        
        await time.increase(new BN(40 * day));
        await staking.connect(user1).withdraw(1000);
        balance1 = Math.round(await token.balanceOf(user1.address) / 1e18);
        expect(balance1).to.be.equal(30000); 
    })
});