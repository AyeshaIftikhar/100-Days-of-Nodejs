const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CharityPlatform", function () {
  let CharityPlatform;
  let charityPlatform;
  let owner;
  let charity1;
  let charity2;
  let donor1;
  let donor2;
  let addrs;

  beforeEach(async function () {
    [owner, charity1, charity2, donor1, donor2, ...addrs] = await ethers.getSigners();
    
    CharityPlatform = await ethers.getContractFactory("CharityPlatform");
    charityPlatform = await CharityPlatform.deploy();
    await charityPlatform.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await charityPlatform.owner()).to.equal(owner.address);
    });

    it("Should set the correct platform fee", async function () {
      expect(await charityPlatform.platformFee()).to.equal(250);
    });

    it("Should set the fee recipient to the owner", async function () {
      expect(await charityPlatform.feeRecipient()).to.equal(owner.address);
    });
  });

  describe("Charity Creation", function () {
    it("Should create a charity successfully", async function () {
      const tx = await charityPlatform.connect(charity1).createCharity(
        "Save the Children",
        "Help children in need",
        "Education",
        "https://example.com/image.jpg",
        ethers.parseEther("10"),
        ["doc1", "doc2"]
      );

      await expect(tx)
        .to.emit(charityPlatform, "CharityCreated")
        .withArgs(1, charity1.address, "Save the Children", ethers.parseEther("10"));

      const charity = await charityPlatform.charities(1);
      expect(charity.name).to.equal("Save the Children");
      expect(charity.wallet).to.equal(charity1.address);
      expect(charity.isActive).to.be.true;
      expect(charity.isVerified).to.be.false;
    });

    it("Should fail with empty name", async function () {
      await expect(
        charityPlatform.connect(charity1).createCharity(
          "",
          "Description",
          "Category",
          "image.jpg",
          ethers.parseEther("10"),
          []
        )
      ).to.be.revertedWith("Name cannot be empty");
    });

    it("Should fail with zero target amount", async function () {
      await expect(
        charityPlatform.connect(charity1).createCharity(
          "Test Charity",
          "Description",
          "Category",
          "image.jpg",
          0,
          []
        )
      ).to.be.revertedWith("Target amount must be greater than 0");
    });
  });

  describe("Donations", function () {
    beforeEach(async function () {
      await charityPlatform.connect(charity1).createCharity(
        "Test Charity",
        "Test Description",
        "Test Category",
        "test.jpg",
        ethers.parseEther("10"),
        []
      );
    });

    it("Should allow donations to active charity", async function () {
      const donationAmount = ethers.parseEther("1");
      
      const tx = await charityPlatform.connect(donor1).donate(
        1,
        "Good luck!",
        false,
        { value: donationAmount }
      );

      await expect(tx)
        .to.emit(charityPlatform, "DonationMade")
        .withArgs(1, 1, donor1.address, donationAmount, false);

      const charity = await charityPlatform.charities(1);
      expect(charity.raisedAmount).to.equal(donationAmount);

      const donation = await charityPlatform.donations(1);
      expect(donation.donor).to.equal(donor1.address);
      expect(donation.amount).to.equal(donationAmount);
    });

    it("Should fail with zero donation", async function () {
      await expect(
        charityPlatform.connect(donor1).donate(1, "Test", false, { value: 0 })
      ).to.be.revertedWith("Donation amount must be greater than 0");
    });

    it("Should fail for non-existent charity", async function () {
      await expect(
        charityPlatform.connect(donor1).donate(
          999,
          "Test",
          false,
          { value: ethers.parseEther("1") }
        )
      ).to.be.revertedWith("Charity does not exist");
    });

    it("Should fail for inactive charity", async function () {
      await charityPlatform.connect(charity1).updateCharityStatus(1, false);
      
      await expect(
        charityPlatform.connect(donor1).donate(
          1,
          "Test",
          false,
          { value: ethers.parseEther("1") }
        )
      ).to.be.revertedWith("Charity is not active");
    });
  });

  describe("Fund Withdrawal", function () {
    beforeEach(async function () {
      await charityPlatform.connect(charity1).createCharity(
        "Test Charity",
        "Test Description",
        "Test Category",
        "test.jpg",
        ethers.parseEther("10"),
        []
      );
      
      await charityPlatform.connect(donor1).donate(
        1,
        "Test donation",
        false,
        { value: ethers.parseEther("5") }
      );
    });

    it("Should allow verified charity to withdraw funds", async function () {
      await charityPlatform.connect(owner).verifyCharity(1, true);
      
      const withdrawAmount = ethers.parseEther("2");
      const initialBalance = await ethers.provider.getBalance(charity1.address);
      
      const tx = await charityPlatform.connect(charity1).withdrawFunds(1, withdrawAmount);
      
      const finalBalance = await ethers.provider.getBalance(charity1.address);
      const expectedAmount = withdrawAmount - (withdrawAmount * 250n / 10000n); // After 2.5% fee
      
      // Check balance increase (accounting for gas costs)
      expect(finalBalance > initialBalance).to.be.true;
      
      await expect(tx)
        .to.emit(charityPlatform, "FundsWithdrawn");
    });

    it("Should fail for unverified charity", async function () {
      await expect(
        charityPlatform.connect(charity1).withdrawFunds(1, ethers.parseEther("1"))
      ).to.be.revertedWith("Charity must be verified");
    });

    it("Should fail for non-charity owner", async function () {
      await charityPlatform.connect(owner).verifyCharity(1, true);
      
      await expect(
        charityPlatform.connect(donor1).withdrawFunds(1, ethers.parseEther("1"))
      ).to.be.revertedWith("Not charity owner");
    });

    it("Should fail for insufficient funds", async function () {
      await charityPlatform.connect(owner).verifyCharity(1, true);
      
      await expect(
        charityPlatform.connect(charity1).withdrawFunds(1, ethers.parseEther("10"))
      ).to.be.revertedWith("Insufficient funds");
    });
  });

  describe("Charity Verification", function () {
    beforeEach(async function () {
      await charityPlatform.connect(charity1).createCharity(
        "Test Charity",
        "Test Description",
        "Test Category",
        "test.jpg",
        ethers.parseEther("10"),
        []
      );
    });

    it("Should allow owner to verify charity", async function () {
      const tx = await charityPlatform.connect(owner).verifyCharity(1, true);
      
      await expect(tx)
        .to.emit(charityPlatform, "CharityVerified")
        .withArgs(1, true);
      
      const charity = await charityPlatform.charities(1);
      expect(charity.isVerified).to.be.true;
    });

    it("Should fail for non-owner", async function () {
      await expect(
        charityPlatform.connect(charity1).verifyCharity(1, true)
      ).to.be.revertedWithCustomError(charityPlatform, "OwnableUnauthorizedAccount");
    });
  });

  describe("Platform Fee Management", function () {
    it("Should allow owner to set platform fee", async function () {
      await charityPlatform.connect(owner).setPlatformFee(500); // 5%
      expect(await charityPlatform.platformFee()).to.equal(500);
    });

    it("Should fail to set fee above 10%", async function () {
      await expect(
        charityPlatform.connect(owner).setPlatformFee(1100) // 11%
      ).to.be.revertedWith("Fee cannot exceed 10%");
    });

    it("Should fail for non-owner", async function () {
      await expect(
        charityPlatform.connect(charity1).setPlatformFee(500)
      ).to.be.revertedWithCustomError(charityPlatform, "OwnableUnauthorizedAccount");
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await charityPlatform.connect(charity1).createCharity(
        "Charity 1",
        "Description 1",
        "Category 1",
        "image1.jpg",
        ethers.parseEther("10"),
        []
      );
      
      await charityPlatform.connect(charity2).createCharity(
        "Charity 2",
        "Description 2",
        "Category 2",
        "image2.jpg",
        ethers.parseEther("20"),
        []
      );
    });

    it("Should return all charities", async function () {
      const charities = await charityPlatform.getAllCharities();
      expect(charities.length).to.equal(2);
      expect(charities[0].name).to.equal("Charity 1");
      expect(charities[1].name).to.equal("Charity 2");
    });

    it("Should return active charities only", async function () {
      await charityPlatform.connect(charity1).updateCharityStatus(1, false);
      
      const activeCharities = await charityPlatform.getActiveCharities();
      expect(activeCharities.length).to.equal(1);
      expect(activeCharities[0].name).to.equal("Charity 2");
    });

    it("Should return total charities count", async function () {
      expect(await charityPlatform.getTotalCharities()).to.equal(2);
    });

    it("Should return charity balance", async function () {
      await charityPlatform.connect(donor1).donate(
        1,
        "Test",
        false,
        { value: ethers.parseEther("3") }
      );
      
      const balance = await charityPlatform.getCharityBalance(1);
      expect(balance).to.equal(ethers.parseEther("3"));
    });
  });
});
