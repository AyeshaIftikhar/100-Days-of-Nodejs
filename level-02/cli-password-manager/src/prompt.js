import inquirer from 'inquirer';

export async function promptHidden(message) {
  const { val } = await inquirer.prompt([
    { type: 'password', name: 'val', message, mask: '•', validate: v => v ? true : 'Required' }
  ]);
  return val;
}

export async function promptConfirm(message, def = false) {
  const { ok } = await inquirer.prompt([{ type: 'confirm', name: 'ok', message, default: def }]);
  return ok;
}

export async function promptEntry(defaults = {}) {
  const answers = await inquirer.prompt([
    { type: 'input', name: 'service', message: 'Service', default: defaults.service, validate: v => v ? true : 'Required' },
    { type: 'input', name: 'username', message: 'Username', default: defaults.username, validate: v => v ? true : 'Required' },
    { type: 'password', name: 'password', message: 'Password (leave blank to generate)', mask: '•' },
    { type: 'input', name: 'notes', message: 'Notes (optional)', default: defaults.notes || '' }
  ]);
  return answers;
}

export async function promptSearch() {
  const { q } = await inquirer.prompt([{ type: 'input', name: 'q', message: 'Search text' }]);
  return q;
}
