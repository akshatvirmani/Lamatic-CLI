// src/commands/models.js
// `lamatic models <subcommand>`

const { Command } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const { getConfig } = require('../utils/config');
const { listModelCreds, createModelCreds } = require('../utils/api');

const models = new Command('models');
models.description('Manage model credentials in a Lamatic project');

// ── list ──────────────────────────────────────────────────────────────────────
models
  .command('list')
  .description('List all model credentials')
  .option('--project-id <id>', 'Project ID')
  .action(async (options) => {
    const config = getConfig();
    if (!config?.apiKey) {
      console.error(chalk.red('Error: Not authenticated. Run `lamatic auth login` first.'));
      process.exit(1);
    }

    let projectId = options.projectId;
    if (!projectId) {
      const res = await inquirer.prompt([{
        type: 'input',
        name: 'projectId',
        message: 'Project ID:',
        validate: (v) => v.trim() !== '' || 'Project ID is required',
      }]);
      projectId = res.projectId;
    }

    console.log(chalk.gray('\nFetching model credentials...'));
    try {
      const data = await listModelCreds({ orgId: config.orgId, projectId });
      const list = data.models || [];

      if (!list.length) {
        console.log(chalk.yellow('No model credentials found.'));
        return;
      }

      console.log(chalk.green(`\nFound ${list.length} model credential(s):\n`));
      list.forEach((m) => {
        console.log(chalk.bold(`  ${m.name}`));
        console.log(chalk.gray(`    Credential ID : ${m.credentialId}`));
        console.log(chalk.gray(`    Provider      : ${m.provider}`));
        console.log('');
      });
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      console.error(chalk.red(`Error: ${msg}`));
      process.exit(1);
    }
  });

// ── add ───────────────────────────────────────────────────────────────────────
models
  .command('add')
  .description('Add a new model credential')
  .option('--project-id <id>', 'Project ID')
  .option('--name <name>', 'Credential name')
  .option('--provider <provider>', 'Provider (e.g. openai, anthropic, mistral)')
  .option('--api-key <key>', 'Provider API key')
  .action(async (options) => {
    const config = getConfig();
    if (!config?.apiKey) {
      console.error(chalk.red('Error: Not authenticated. Run `lamatic auth login` first.'));
      process.exit(1);
    }

    let projectId = options.projectId;
    let name = options.name;
    let provider = options.provider;
    let providerKey = options.apiKey;

    if (!projectId || !name || !provider || !providerKey) {
      const res = await inquirer.prompt([
        !projectId && { type: 'input', name: 'projectId', message: 'Project ID:', validate: (v) => v.trim() !== '' || 'Required' },
        !name && { type: 'input', name: 'name', message: 'Credential name:', validate: (v) => v.trim() !== '' || 'Required' },
        !provider && { type: 'input', name: 'provider', message: 'Provider (e.g. openai, anthropic):', validate: (v) => v.trim() !== '' || 'Required' },
        !providerKey && { type: 'password', name: 'providerKey', message: 'Provider API Key:', mask: '*', validate: (v) => v.trim() !== '' || 'Required' },
      ].filter(Boolean));
      projectId = projectId || res.projectId;
      name = name || res.name;
      provider = provider || res.provider;
      providerKey = providerKey || res.providerKey;
    }

    console.log(chalk.gray('\nAdding model credential...'));
    try {
      const result = await createModelCreds({
        orgId: config.orgId,
        projectId,
        name,
        provider,
        credentials: { apiKey: providerKey },
      });
      console.log(chalk.green('Model credential added!'));
      console.log(chalk.gray(`  Credential ID : ${result.credentialId}`));
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      console.error(chalk.red(`Error: ${msg}`));
      process.exit(1);
    }
  });

module.exports = models;