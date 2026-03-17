const { Command } = require('commander');
const chalk = require('chalk');
const { saveConfig, getConfig, clearConfig } = require('../utils/config');

const auth = new Command('auth');

auth
  .command('login')
  .description('Authenticate with your Lamatic API key')
  .option('--api-key <key>', 'Your organization API key')
  .option('--org-id <id>', 'Organization ID')
  .option('--user-id <id>', 'Your user ID')
  .action((options) => {
    if (!options.apiKey) {
      console.error(chalk.red('Error: --api-key is required'));
      console.log(chalk.gray('Use the structure: lamatic auth login --api-key <key> --org-id <org_id> --user-id <user_id>'));
      process.exit(1);
    }

    saveConfig({
      apiKey: options.apiKey,
      orgId: options.orgId || null,
      userId: options.userId || null,
    });

    console.log(chalk.green('Authenticated successfully!'));
    console.log(chalk.gray(`Org ID:  ${options.orgId}`));
    console.log(chalk.gray(`User ID: ${options.userId}`));
  });

auth
  .command('logout')
  .description('Remove stored credentials')
  .action(() => {
    clearConfig();
    console.log(chalk.green('Logged out...'));
  });

auth
  .command('status')
  .description('Show current auth status')
  .action(() => {
    const config = getConfig();
    if (!config || !config.apiKey) {
      console.log(chalk.red('Not authenticated.'));
    } else {
      console.log(chalk.green('Authenticated!'));
      console.log(chalk.gray(`  API Key: ${config.apiKey.slice(0, 14)}...`));
      if (config.orgId)  console.log(chalk.gray(`  Org ID:  ${config.orgId}`));
      if (config.userId) console.log(chalk.gray(`  User ID: ${config.userId}`));
    }
  });

module.exports = auth;