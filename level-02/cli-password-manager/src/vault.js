import fs from 'fs';
import path from 'path';
import os from 'os';
import { deriveKey, encrypt, decrypt, randomBytes, b64, buildKeyVerifier, verifyKey } from './crypto.js';

const VAULT_DIR = path.join(os.homedir(), '.clivault');
const VAULT_FILE = path.join(VAULT_DIR, 'vault.json');

function ensureDir() {
  if (!fs.existsSync(VAULT_DIR)) fs.mkdirSync(VAULT_DIR, { recursive: true, mode: 0o700 });
}

export function vaultExists() {
  return fs.existsSync(VAULT_FILE);
}

export function readVaultFile() {
  if (!vaultExists()) return null;
  const raw = fs.readFileSync(VAULT_FILE, 'utf8');
  return JSON.parse(raw);
}

export function writeVaultFile(json) {
  ensureDir();
  fs.writeFileSync(VAULT_FILE, JSON.stringify(json, null, 2), { mode: 0o600 });
}

export async function initVault(masterPassword) {
  if (vaultExists()) throw new Error('Vault already exists.');
  const salt = randomBytes(16);
  const kdf = { N: 16384, r: 8, p: 1 };
  const key = await deriveKey(masterPassword, salt, kdf);
  const verifier = await buildKeyVerifier(key);
  const emptyData = { entries: [], updatedAt: new Date().toISOString() };
  const sealed = await encrypt(key, Buffer.from(JSON.stringify(emptyData)));
  writeVaultFile({
    version: 1,
    kdf,
    salt: b64(salt),
    keyVerifier: verifier,
    data: sealed
  });
}

export async function unlockVault(masterPassword) {
  const vault = readVaultFile();
  if (!vault) throw new Error('Vault not initialized. Run `clivault init`.');
  const { kdf, salt, keyVerifier } = vault;
  const key = await deriveKey(masterPassword, Buffer.from(salt, 'base64'), kdf);
  const ok = await verifyKey(key, keyVerifier);
  if (!ok) throw new Error('Invalid master password.');
  const plain = await decrypt(key, vault.data);
  const json = JSON.parse(plain.toString());
  return { key, vaultMeta: vault, data: json };
}

export async function saveVault(unlocked, newData) {
  const { key, vaultMeta } = unlocked;
  const sealed = await encrypt(key, Buffer.from(JSON.stringify(newData)));
  writeVaultFile({
    ...vaultMeta,
    data: sealed
  });
}

export async function changeMasterPassword(oldKey, oldMeta, newPassword) {
  const salt = randomBytes(16);
  const kdf = oldMeta.kdf;
  const newKey = await deriveKey(newPassword, salt, kdf);
  const verifier = await buildKeyVerifier(newKey);
  return { newKey, newSalt: b64(salt), verifier };
}

export function indexOfEntry(data, service, username) {
  return data.entries.findIndex(e =>
    e.service.toLowerCase() === service.toLowerCase() &&
    (username ? e.username.toLowerCase() === username.toLowerCase() : true)
  );
}
