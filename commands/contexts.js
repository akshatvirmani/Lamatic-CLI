// src/commands/contexts.js
// `lamatic contexts <subcommand>`

const { Command } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const { getConfig } = require('../utils/config');
const { listContexts, createContext, deleteContext } = require('../utils/api');

const contexts = new Command('contexts');
contexts.description('Manage contexts in a Lamatic project');

// ── list ──────────────────────────────────────────────────────────────────────
contexts
  .command('list')
  .description('List all contexts in a project')
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

    console.log(chalk.gray('\nFetching contexts...'));
    try {
      const data = await listContexts({ orgId: config.orgId, projectId });
      const list = data.contexts || [];

      if (!list.length) {
        console.log(chalk.yellow('No contexts found.'));
        return;
      }

      console.log(chalk.green(`\nFound ${list.length} context(s):\n`));
      list.forEach((c) => {
        console.log(chalk.bold(`  ${c.name}`));
        console.log(chalk.gray(`    ID      : ${c.id}`));
        console.log(chalk.gray(`    Type    : ${c.type}`));
        console.log(chalk.gray(`    Objects : ${c.objectCount}`));
        console.log('');
      });
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      console.error(chalk.red(`Error: ${msg}`));
      process.exit(1);
    }
  });

// ── create ────────────────────────────────────────────────────────────────────
contexts
  .command('create')
  .description('Create a new context')
  .option('--project-id <id>', 'Project ID')
  .option('--name <name>', 'Context name')
  .option('--type <type>', 'Context type: vector or memory', 'vector')
  .action(async (options) => {
    const config = getConfig();
    if (!config?.apiKey) {
      console.error(chalk.red('Error: Not authenticated. Run `lamatic auth login` first.'));
      process.exit(1);
    }

    let projectId = options.projectId;
    let name = options.name;
    let type = options.type;

    if (!projectId || !name) {
      const res = await inquirer.prompt([
        !projectId && { type: 'input', name: 'projectId', message: 'Project ID:', validate: (v) => v.trim() !== '' || 'Required' },
        !name && { type: 'input', name: 'name', message: 'Context name:', validate: (v) => v.trim() !== '' || 'Required' },
        { type: 'list', name: 'type', message: 'Context type:', choices: ['vector', 'memory'], default: type },
      ].filter(Boolean));
      projectId = projectId || res.projectId;
      name = name || res.name;
      type = res.type || type;
    }

    console.log(chalk.gray(`\nCreating ${type} context "${name}"...`));
    try {
      const result = await createContext({ orgId: config.orgId, projectId, name, type });
      console.log(chalk.green('Context created!'));
      console.log(chalk.gray(`  ID    : ${result.id}`));
      console.log(chalk.gray(`  Class : ${result.class}`));
      console.log(chalk.gray(`  Type  : ${result.isMemory ? 'memory' : 'vector'}`));
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      console.error(chalk.red(`Error: ${msg}`));
      process.exit(1);
    }
  });

// ── delete ────────────────────────────────────────────────────────────────────
contexts
  .command('delete')
  .description('Delete a context')
  .option('--project-id <id>', 'Project ID')
  .option('--context-id <id>', 'Context ID')
  .action(async (options) => {
    const config = getConfig();
    if (!config?.apiKey) {
      console.error(chalk.red('Error: Not authenticated. Run `lamatic auth login` first.'));
      process.exit(1);
    }

    let projectId = options.projectId;
    let contextId = options.contextId;

    if (!projectId || !contextId) {
      const res = await inquirer.prompt([
        !projectId && { type: 'input', name: 'projectId', message: 'Project ID:', validate: (v) => v.trim() !== '' || 'Required' },
        !contextId && { type: 'input', name: 'contextId', message: 'Context ID:', validate: (v) => v.trim() !== '' || 'Required' },
      ].filter(Boolean));
      projectId = projectId || res.projectId;
      contextId = contextId || res.contextId;
    }

    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: chalk.red(`Are you sure you want to delete context ${contextId}?`),
      default: false,
    }]);

    if (!confirm) {
      console.log(chalk.yellow('Aborted.'));
      return;
    }

    console.log(chalk.gray('\nDeleting context...'));
    try {
      const result = await deleteContext({ orgId: config.orgId, projectId, contextId });
      console.log(chalk.green('Context deleted!'));
      console.log(chalk.gray(`  Message: ${result.message}`));
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      console.error(chalk.red(`Error: ${msg}`));
      process.exit(1);
    }
  });

module.exports = contexts;