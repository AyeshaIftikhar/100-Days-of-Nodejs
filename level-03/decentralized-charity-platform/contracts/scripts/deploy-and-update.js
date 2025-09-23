const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  // Deploy the CharityPlatform contract
  const CharityPlatform = await hre.ethers.getContractFactory("CharityPlatform");
  console.log("Deploying CharityPlatform...");
  
  const charityPlatform = await CharityPlatform.deploy();
  await charityPlatform.waitForDeployment();
  
  const contractAddress = await charityPlatform.getAddress();
  console.log("CharityPlatform deployed to:", contractAddress);
  
  // Update the frontend config with the new contract address
  const configPath = path.join(__dirname, '../../frontend/src/config/contracts.ts');
  
  try {
    let configContent = fs.readFileSync(configPath, 'utf8');
    
    // Update localhost contract address
    configContent = configContent.replace(
      /contractAddress: '0x[a-fA-F0-9]{40}'/,
      `contractAddress: '${contractAddress}'`
    );
    
    fs.writeFileSync(configPath, configContent);
    console.log("Frontend config updated with new contract address");
  } catch (error) {
    console.warn("Could not update frontend config:", error.message);
  }
  
  // Create deployment info file
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployedAt: new Date().toISOString(),
    deployer: (await hre.ethers.getSigners())[0].address,
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };
  
  const deploymentPath = path.join(__dirname, '../deployments', `${hre.network.name}.json`);
  fs.mkdirSync(path.dirname(deploymentPath), { recursive: true });
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("Deployment info saved to:", deploymentPath);
  console.log("Contract deployed successfully!");
  console.log("You can now interact with the contract at:", contractAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
