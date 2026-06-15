// src/commands/integrations.js
// `lamatic integrations <subcommand>`

const { Command } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const { getConfig } = require('../utils/config');
const { listIntegrations, listSupportedIntegrations, createIntegration } = require('../utils/api');

const integrations = new Command('integrations');
integrations.description('Manage integrations in a Lamatic project');

// ── list ──────────────────────────────────────────────────────────────────────
integrations
  .command('list')
  .description('List all integration credentials')
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

    console.log(chalk.gray('\nFetching integrations...'));
    try {
      const data = await listIntegrations({ orgId: config.orgId, projectId });
      const list = data.integrations || [];

      if (!list.length) {
        console.log(chalk.yellow('No integrations found.'));
        return;
      }

      console.log(chalk.green(`\nFound ${list.length} integration(s):\n`));
      list.forEach((i) => {
        console.log(chalk.bold(`  ${i.name}`));
        console.log(chalk.gray(`    Credential ID : ${i.credentialId}`));
        console.log(chalk.gray(`    Integration   : ${i.integration}`));
        console.log('');
      });
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      console.error(chalk.red(`Error: ${msg}`));
      process.exit(1);
    }
  });

// ── add ───────────────────────────────────────────────────────────────────────
integrations
  .command('add')
  .description('Add a new integration credential')
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

    // Fetch supported integrations for selection
    console.log(chalk.gray('\nFetching supported integrations...'));
    let supported = [];
    try {
      const data = await listSupportedIntegrations({ orgId: config.orgId, projectId });
      supported = data.integrations || [];
    } catch (err) {
      console.log(chalk.yellow('Could not fetch supported integrations. Enter manually.'));
    }

    const questions = [
      supported.length
        ? { type: 'list', name: 'integration', message: 'Choose an integration:', choices: supported.map((i) => ({ name: `${i.name} (${i.type})`, value: i.name })) }
        : { type: 'input', name: 'integration', message: 'Integration type (e.g. s3, slack, postgres):', validate: (v) => v.trim() !== '' || 'Required' },
      { type: 'input', name: 'name', message: 'Credential name:', validate: (v) => v.trim() !== '' || 'Required' },
      { type: 'password', name: 'apiKey', message: 'API Key / Credential:', mask: '*', validate: (v) => v.trim() !== '' || 'Required' },
    ];

    const ans = await inquirer.prompt(questions);

    console.log(chalk.gray('\nAdding integration...'));
    try {
      const result = await createIntegration({
        orgId: config.orgId,
        projectId,
        name: ans.name,
        integration: ans.integration,
        credentials: { apiKey: ans.apiKey },
      });
      console.log(chalk.green('Integration added!'));
      console.log(chalk.gray(`  Credential ID : ${result.credentialId}`));
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      console.error(chalk.red(`Error: ${msg}`));
      process.exit(1);
    }
  });

module.exports = integrations;