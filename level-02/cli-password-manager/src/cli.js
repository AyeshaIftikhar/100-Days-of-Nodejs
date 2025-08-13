import { Command } from 'commander';
import chalk from 'chalk';
import clipboard from 'clipboardy';
import fs from 'fs';
import path from 'path';

import { initVault, unlockVault, saveVault, indexOfEntry, changeMasterPassword } from './vault.js';
import { promptHidden, promptConfirm, promptEntry, promptSearch } from './prompts.js';
import { generatePassword, mask } from './utils.js';

const program = new Command();
program
  .name('clivault')
  .description('Encrypted CLI Password Manager (AES-256-GCM + scrypt)')
  .version('1.0.0');

function ok(msg) { console.log(chalk.green('✔'), msg); }
function info(msg) { console.log(chalk.cyan('ℹ'), msg); }
function warn(msg) { console.log(chalk.yellow('!'), msg); }
function err(msg) { console.error(chalk.red('✖'), msg); }

program
  .command('init')
  .description('Initialize a new vault with a master password')
  .action(async () => {
    try {
      const pw1 = await promptHidden('Set master password');
      const pw2 = await promptHidden('Confirm master password');
      if (pw1 !== pw2) { err('Passwords do not match.'); process.exit(1); }
      await initVault(pw1);
      ok('Vault initialized.');
    } catch (e) { err(e.message); process.exit(1); }
  });

program
  .command('add')
  .description('Add a new password entry')
  .option('-g, --generate <length>', 'Generate a strong password of given length', parseInt)
  .action(async (opts) => {
    try {
      const master = await promptHidden('Master password');
      const unlocked = await unlockVault(master);
      const answers = await promptEntry();
      let pwd = answers.password;
      if (!pwd) {
        const len = Number.isInteger(opts.generate) ? Math.max(8, opts.generate) : 20;
        pwd = generatePassword(len);
        info(`Generated password: ${chalk.gray(mask(pwd, 0))}`);
      }
      const exists = unlocked.data.entries.find(e =>
        e.service.toLowerCase() === answers.service.toLowerCase() &&
        e.username.toLowerCase() === answers.username.toLowerCase()
      );
      if (exists) {
        warn('Entry already exists. Use update instead.');
        process.exit(1);
      }
      unlocked.data.entries.push({
        service: answers.service,
        username: answers.username,
        password: pwd,
        notes: answers.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      unlocked.data.updatedAt = new Date().toISOString();
      await saveVault(unlocked, unlocked.data);
      ok('Entry added.');
    } catch (e) { err(e.message); process.exit(1); }
  });

program
  .command('list')
  .description('List all entries')
  .option('-s, --search <text>', 'Filter by text')
  .action(async (opts) => {
    try {
      const master = await promptHidden('Master password');
      const { data } = await unlockVault(master);
      const items = data.entries
        .filter(e => !opts.search || JSON.stringify(e).toLowerCase().includes(opts.search.toLowerCase()))
        .sort((a, b) => a.service.localeCompare(b.service) || a.username.localeCompare(b.username));
      if (!items.length) {
        info('No entries found.');
        return;
      }
      for (const e of items) {
        console.log(`${chalk.bold(e.service)} ${chalk.gray('•')} ${e.username} ${chalk.gray('•')} ${new Date(e.updatedAt).toLocaleString()}`);
      }
    } catch (e) { err(e.message); process.exit(1); }
  });

program
  .command('get')
  .description('Get a password')
  .argument('<service>', 'Service name')
  .argument('[username]', 'Username (optional)')
  .option('-c, --copy', 'Copy password to clipboard')
  .action(async (service, username, opts) => {
    try {
      const master = await promptHidden('Master password');
      const { data } = await unlockVault(master);
      const entries = data.entries.filter(e => e.service.toLowerCase() === service.toLowerCase());
      if (!entries.length) { warn('No such service.'); process.exit(1); }
      let entry = username
        ? entries.find(e => e.username.toLowerCase() === username.toLowerCase())
        : entries[0];
      if (!entry) { warn('No entry with that username.'); process.exit(1); }
      if (opts.copy) {
        await clipboard.write(entry.password);
        ok('Password copied to clipboard.');
      } else {
        info(`Service: ${entry.service}`);
        info(`Username: ${entry.username}`);
        info(`Password: ${entry.password}`);
        if (entry.notes) info(`Notes: ${entry.notes}`);
      }
    } catch (e) { err(e.message); process.exit(1); }
  });

program
  .command('remove')
  .description('Remove an entry')
  .argument('<service>')
  .argument('[username]')
  .action(async (service, username) => {
    try {
      const master = await promptHidden('Master password');
      const unlocked = await unlockVault(master);
      const idx = indexOfEntry(unlocked.data, service, username);
      if (idx === -1) { warn('Entry not found.'); process.exit(1); }
      const okDel = await promptConfirm('Are you sure you want to delete this entry?');
      if (!okDel) return;
      unlocked.data.entries.splice(idx, 1);
      unlocked.data.updatedAt = new Date().toISOString();
      await saveVault(unlocked, unlocked.data);
      ok('Entry removed.');
    } catch (e) { err(e.message); process.exit(1); }
  });

program
  .command('update')
  .description('Update an existing entry')
  .argument('<service>')
  .argument('[username]')
  .option('-g, --generate <length>', 'Generate a new password', parseInt)
  .action(async (service, username, opts) => {
    try {
      const master = await promptHidden('Master password');
      const unlocked = await unlockVault(master);
      const idx = indexOfEntry(unlocked.data, service, username);
      if (idx === -1) { warn('Entry not found.'); process.exit(1); }
      const existing = unlocked.data.entries[idx];
      const changes = await promptEntry(existing);
      let pwd = changes.password || existing.password;
      if (opts.generate) {
        const len = Math.max(8, parseInt(opts.generate, 10));
        pwd = generatePassword(len);
        info(`Generated password: ${chalk.gray(mask(pwd, 0))}`);
      }
      unlocked.data.entries[idx] = {
        ...existing,
        service: changes.service,
        username: changes.username,
        password: pwd,
        notes: changes.notes || '',
        updatedAt: new Date().toISOString()
      };
      unlocked.data.updatedAt = new Date().toISOString();
      await saveVault(unlocked, unlocked.data);
      ok('Entry updated.');
    } catch (e) { err(e.message); process.exit(1); }
  });

program
  .command('rotate')
  .description('Rotate encryption (re-encrypt vault with fresh IVs)')
  .action(async () => {
    try {
      const master = await promptHidden('Master password');
      const unlocked = await unlockVault(master);
      // Saving re-encrypts with fresh IV due to encrypt()
      await saveVault(unlocked, unlocked.data);
      ok('Vault re-encrypted (rotated).');
    } catch (e) { err(e.message); process.exit(1); }
  });

program
  .command('change-master')
  .description('Change the master password')
  .action(async () => {
    try {
      const oldPw = await promptHidden('Current master password');
      const unlocked = await unlockVault(oldPw);
      const pw1 = await promptHidden('New master password');
      const pw2 = await promptHidden('Confirm new master password');
      if (pw1 !== pw2) { err('Passwords do not match.'); process.exit(1); }

      const { newKey, newSalt, verifier } = await changeMasterPassword(unlocked.key, unlocked.vaultMeta, pw1);
      // Replace meta
      const newMeta = { ...unlocked.vaultMeta, salt: newSalt, keyVerifier: verifier };
      // Re-seal data under new key
      const saved = { key: newKey, vaultMeta: newMeta, data: unlocked.data };
      await saveVault(saved, unlocked.data);
      ok('Master password changed.');
    } catch (e) { err(e.message); process.exit(1); }
  });

program
  .command('export')
  .description('Export decrypted vault to JSON (plaintext!)')
  .option('-o, --out <file>', 'Output file', 'vault-export.json')
  .action(async (opts) => {
    try {
      const master = await promptHidden('Master password');
      const { data } = await unlockVault(master);
      const out = path.resolve(process.cwd(), opts.out);
      fs.writeFileSync(out, JSON.stringify(data, null, 2), { mode: 0o600 });
      warn('Exported in PLAINTEXT. Protect this file or delete it ASAP.');
      ok(`Exported to ${out}`);
    } catch (e) { err(e.message); process.exit(1); }
  });

program
  .command('import')
  .description('Import entries from a PLAINTEXT JSON export (merge)')
  .argument('<file>')
  .action(async (file) => {
    try {
      const master = await promptHidden('Master password');
      const unlocked = await unlockVault(master);
      const raw = fs.readFileSync(path.resolve(process.cwd(), file), 'utf8');
      const incoming = JSON.parse(raw);
      if (!Array.isArray(incoming.entries)) throw new Error('Invalid import format: missing entries[]');

      let added = 0, updated = 0;
      for (const e of incoming.entries) {
        const idx = unlocked.data.entries.findIndex(x =>
          x.service.toLowerCase() === String(e.service).toLowerCase() &&
          x.username.toLowerCase() === String(e.username).toLowerCase()
        );
        if (idx === -1) {
          unlocked.data.entries.push({
            service: String(e.service),
            username: String(e.username),
            password: String(e.password),
            notes: e.notes ? String(e.notes) : '',
            createdAt: e.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          added++;
        } else {
          unlocked.data.entries[idx] = {
            ...unlocked.data.entries[idx],
            password: String(e.password),
            notes: e.notes ? String(e.notes) : unlocked.data.entries[idx].notes,
            updatedAt: new Date().toISOString()
          };
          updated++;
        }
      }
      unlocked.data.updatedAt = new Date().toISOString();
      await saveVault(unlocked, unlocked.data);
      ok(`Import complete. Added ${added}, updated ${updated}.`);
    } catch (e) { err(e.message); process.exit(1); }
  });

program
  .command('search')
  .description('Search service/username/notes')
  .action(async () => {
    try {
      const master = await promptHidden('Master password');
      const { data } = await unlockVault(master);
      const q = await promptSearch();
      const t = q.toLowerCase();
      const matches = data.entries.filter(e =>
        e.service.toLowerCase().includes(t) ||
        e.username.toLowerCase().includes(t) ||
        (e.notes || '').toLowerCase().includes(t)
      );
      if (!matches.length) { info('No matches.'); return; }
      for (const e of matches) {
        console.log(`${chalk.bold(e.service)} ${chalk.gray('•')} ${e.username} ${chalk.gray('•')} ${new Date(e.updatedAt).toLocaleString()}`);
      }
    } catch (e) { err(e.message); process.exit(1); }
  });

program.parseAsync(process.argv);
