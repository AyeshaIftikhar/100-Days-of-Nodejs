const { writeFileSync, mkdirSync } = require('fs');
const { resolve } = require('path');
const snarkjs = require('snarkjs');

/**
 * Setup script for generating proving and verification keys
 */
async function main() {
  console.log('Starting circuit setup...');

  // Paths
  const buildDir = resolve(__dirname, '../build');
  const r1csPath = resolve(buildDir, 'password_checker.r1cs');
  const wasmPath = resolve(buildDir, 'password_checker_js/password_checker.wasm');
  const zkeyPath = resolve(buildDir, 'password_checker.zkey');
  const vkeyPath = resolve(buildDir, 'verification_key.json');
  
  try {
    // Ensure build directory exists
    mkdirSync(buildDir, { recursive: true });
    
    // Generate proving key (zkey)
    console.log('Generating zkey...');
    await snarkjs.zKey.newZKey(r1csPath, "pot15_final.ptau", zkeyPath);
    
    // Export verification key
    console.log('Exporting verification key...');
    const vKey = await snarkjs.zKey.exportVerificationKey(zkeyPath);
    
    // Write verification key to file
    writeFileSync(vkeyPath, JSON.stringify(vKey, null, 2));
    
    console.log('Setup completed successfully!');
    console.log(`Verification key saved to: ${vkeyPath}`);
  } catch (error) {
    console.error('Error during setup:', error);
    process.exit(1);
  }
}

main().then(() => {
  process.exit(0);
});
