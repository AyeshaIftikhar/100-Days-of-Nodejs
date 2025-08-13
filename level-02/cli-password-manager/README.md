# CLI Password Manager (Encrypted)

A secure, **offline** CLI password manager built with Node.js.  
- **Encryption:** AES-256-GCM  
- **KDF:** scrypt (N=16384, r=8, p=1)  
- **Storage:** Single encrypted JSON vault in `~/.clivault/vault.json`

> ⚠️ Your vault is encrypted at rest. Your **master password is never stored**. If you forget it, the data is unrecoverable.

## Features

- Initialize vault with a master password
- Add, list, search entries
- Get password (optionally copy to clipboard)
- Update & remove entries
- Rotate encryption (fresh IVs)
- Change master password (re-encrypt)
- Export/import plaintext JSON (for backups/migration)

## Install

```bash
npm install
npm run link
```

## Usage
```bash
clivault init
clivault add
clivault list
clivault list --search github
clivault get github user@example.com --copy
clivault update github user@example.com --generate 24
clivault remove github user@example.com
clivault rotate
clivault change-master
clivault export --out my-backup.json
clivault import my-backup.json
clivault search
```

## Security Notes
- Encryption: AES-256-GCM with random 96-bit IV and auth tag.
- Key derivation: scrypt (N=16384, r=8, p=1) with 128-bit random salt.
- Password verification: encrypts a fixed phrase with the derived key to verify correctness.
- Vault directory ~/.clivault is created with restrictive permissions.