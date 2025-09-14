pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

/**
 * Password checker circuit
 * 
 * Inputs:
 * - password: array of characters (as field elements)
 * - salt: random value for commitment
 * 
 * Output:
 * - commitment: poseidon hash of password and salt
 */
template PasswordChecker(max_password_length) {
    // Public output
    signal output commitment;

    // Private inputs
    signal input password[max_password_length];
    signal input password_length;
    signal input salt;

    // Verify password_length is valid
    signal is_valid_length <== LessThan(252)([password_length, max_password_length + 1]);
    is_valid_length === 1;

    // Hash inputs to create commitment
    component hasher = Poseidon(max_password_length + 1);
    
    // Add password characters to hasher
    for (var i = 0; i < max_password_length; i++) {
        // Only include valid characters based on password_length
        if (i < password_length) {
            hasher.inputs[i] <== password[i];
        } else {
            hasher.inputs[i] <== 0;
        }
    }
    
    // Add salt as the last input
    hasher.inputs[max_password_length] <== salt;
    
    // Set commitment as output
    commitment <== hasher.out;
}

component main {public [commitment]} = PasswordChecker(32);
