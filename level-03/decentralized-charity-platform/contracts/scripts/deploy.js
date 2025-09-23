const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying CharityPlatform contract...");
  
  // Get the ContractFactory and Signers here.
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());
  
  // Deploy the contract
  const CharityPlatform = await ethers.getContractFactory("CharityPlatform");
  const charityPlatform = await CharityPlatform.deploy();
  
  await charityPlatform.waitForDeployment();
  
  const contractAddress = await charityPlatform.getAddress();
  console.log("CharityPlatform deployed to:", contractAddress);
  
  // Save the contract address and ABI
  const contractInfo = {
    address: contractAddress,
    network: network.name,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
  };
  
  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  // Save deployment info
  fs.writeFileSync(
    path.join(deploymentsDir, `${network.name}.json`),
    JSON.stringify(contractInfo, null, 2)
  );
  
  // Copy ABI to frontend
  const frontendDir = path.join(__dirname, "../../frontend/src/contracts");
  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir, { recursive: true });
  }
  
  // Copy ABI
  const artifactPath = path.join(__dirname, "../artifacts/contracts/CharityPlatform.sol/CharityPlatform.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  
  fs.writeFileSync(
    path.join(frontendDir, "CharityPlatform.json"),
    JSON.stringify({
      abi: artifact.abi,
      address: contractAddress,
      network: network.name,
    }, null, 2)
  );
  
  console.log("Contract ABI copied to frontend");
  console.log("✅ Deployment complete!");
  
  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
