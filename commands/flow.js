// src/commands/flows.js
// `lamatic flows <subcommand>`

const { Command } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const { getConfig } = require('../utils/config');
const { createFlow, getFlows, deleteFlow, renameFlow, updateFlowStatus } = require('../utils/api');

const flows = new Command('flow');
flows.description('Manage flows in a Lamatic project');

// ── create ────────────────────────────────────────────────────────────────────
flows
  .command('create')
  .description('Create a new flow in a project')
  .option('--project-id <id>', 'Project ID')
  .option('--name <name>', 'Flow name')
  .action(async (options) => {
    const config = getConfig();
    if (!config?.apiKey) {
      console.error(chalk.red('Error: Not authenticated. Run `lamatic auth login` first.'));
      process.exit(1);
    }

    let projectId = options.projectId;
    let flowName = options.name;

    if (!projectId) {
      const res = await inquirer.prompt([{
        type: 'input',
        name: 'projectId',
        message: 'Project ID:',
        validate: (v) => v.trim() !== '' || 'Project ID is required',
      }]);
      projectId = res.projectId;
    }

    if (!flowName) {
      const res = await inquirer.prompt([{
        type: 'input',
        name: 'name',
        message: 'Flow name:',
        validate: (v) => v.trim() !== '' || 'Flow name is required',
      }]);
      flowName = res.name;
    }

    console.log(chalk.gray(`\nCreating flow "${flowName}"...`));
    try {
      await createFlow({ orgId: config.orgId, projectId, name: flowName });
      console.log(chalk.green('Flow created successfully!'));
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      console.error(chalk.red(`Error: ${msg}`));
      process.exit(1);
    }
  });

// ── list ──────────────────────────────────────────────────────────────────────
flows
  .command('list')
  .description('List all flows in a project')
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

    console.log(chalk.gray('\nFetching flows...'));
    try {
      const data = await getFlows({ orgId: config.orgId, projectId });
      const list = data.flows || [];

      if (!list.length) {
        console.log(chalk.yellow('No flows found.'));
        return;
      }

      console.log(chalk.green(`\nFound ${list.length} flow(s):\n`));
      list.forEach((f) => {
        const statusColor = f.status === 'active' ? chalk.green(f.status) : chalk.yellow(f.status);
        console.log(chalk.bold(`  ${f.name}`));
        console.log(chalk.gray(`    ID     : ${f.id}`));
        console.log(chalk.gray(`    Slug   : ${f.slug}`));
        console.log(`    Status : ${statusColor}`);
        console.log('');
      });
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      console.error(chalk.red(`Error: ${msg}`));
      process.exit(1);
    }
  });

// ── delete ────────────────────────────────────────────────────────────────────
flows
  .command('delete')
  .description('Delete a flow')
  .option('--project-id <id>', 'Project ID')
  .option('--flow-id <id>', 'Flow ID')
  .action(async (options) => {
    const config = getConfig();
    if (!config?.apiKey) {
      console.error(chalk.red('Error: Not authenticated. Run `lamatic auth login` first.'));
      process.exit(1);
    }

    let projectId = options.projectId;
    let flowId = options.flowId;

    if (!projectId || !flowId) {
      const res = await inquirer.prompt([
        !projectId && { type: 'input', name: 'projectId', message: 'Project ID:', validate: (v) => v.trim() !== '' || 'Required' },
        !flowId && { type: 'input', name: 'flowId', message: 'Flow ID:', validate: (v) => v.trim() !== '' || 'Required' },
      ].filter(Boolean));
      projectId = projectId || res.projectId;
      flowId = flowId || res.flowId;
    }

    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: chalk.red(`Are you sure you want to delete flow ${flowId}?`),
      default: false,
    }]);

    if (!confirm) {
      console.log(chalk.yellow('Aborted.'));
      return;
    }

    console.log(chalk.gray('\nDeleting flow...'));
    try {
      const result = await deleteFlow({ orgId: config.orgId, projectId, flowId });
      console.log(chalk.green('Flow deleted successfully!'));
      console.log(chalk.gray(`  Message: ${result.message}`));
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      console.error(chalk.red(`Error: ${msg}`));
      process.exit(1);
    }
  });

// ── rename ────────────────────────────────────────────────────────────────────
flows
  .command('rename')
  .description('Rename a flow')
  .option('--project-id <id>', 'Project ID')
  .option('--flow-id <id>', 'Flow ID')
  .option('--name <name>', 'New flow name')
  .action(async (options) => {
    const config = getConfig();
    if (!config?.apiKey) {
      console.error(chalk.red('Error: Not authenticated. Run `lamatic auth login` first.'));
      process.exit(1);
    }

    let projectId = options.projectId;
    let flowId = options.flowId;
    let name = options.name;

    if (!projectId || !flowId || !name) {
      const res = await inquirer.prompt([
        !projectId && { type: 'input', name: 'projectId', message: 'Project ID:', validate: (v) => v.trim() !== '' || 'Required' },
        !flowId && { type: 'input', name: 'flowId', message: 'Flow ID:', validate: (v) => v.trim() !== '' || 'Required' },
        !name && { type: 'input', name: 'name', message: 'New name:', validate: (v) => v.trim() !== '' || 'Required' },
      ].filter(Boolean));
      projectId = projectId || res.projectId;
      flowId = flowId || res.flowId;
      name = name || res.name;
    }

    console.log(chalk.gray(`\nRenaming flow to "${name}"...`));
    try {
      const result = await renameFlow({ orgId: config.orgId, projectId, flowId, name });
      console.log(chalk.green('Flow renamed successfully!'));
      console.log(chalk.gray(`  New Name : ${result.name}`));
      console.log(chalk.gray(`  Flow ID  : ${result.flowId}`));
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      console.error(chalk.red(`Error: ${msg}`));
      process.exit(1);
    }
  });

// ── status ────────────────────────────────────────────────────────────────────
flows
  .command('status')
  .description('Update flow status (active or inactive)')
  .option('--project-id <id>', 'Project ID')
  .option('--flow-id <id>', 'Flow ID')
  .option('--status <status>', 'Status: active or inactive')
  .action(async (options) => {
    const config = getConfig();
    if (!config?.apiKey) {
      console.error(chalk.red('Error: Not authenticated. Run `lamatic auth login` first.'));
      process.exit(1);
    }

    let projectId = options.projectId;
    let flowId = options.flowId;
    let status = options.status;

    if (!projectId || !flowId || !status) {
      const res = await inquirer.prompt([
        !projectId && { type: 'input', name: 'projectId', message: 'Project ID:', validate: (v) => v.trim() !== '' || 'Required' },
        !flowId && { type: 'input', name: 'flowId', message: 'Flow ID:', validate: (v) => v.trim() !== '' || 'Required' },
        !status && { type: 'list', name: 'status', message: 'Status:', choices: ['active', 'inactive'] },
      ].filter(Boolean));
      projectId = projectId || res.projectId;
      flowId = flowId || res.flowId;
      status = status || res.status;
    }

    console.log(chalk.gray(`\nUpdating flow status to "${status}"...`));
    try {
      const result = await updateFlowStatus({ orgId: config.orgId, projectId, flowId, status });
      console.log(chalk.green('Flow status updated!'));
      console.log(chalk.gray(`  Flow ID : ${result.flowId}`));
      console.log(chalk.gray(`  Status  : ${result.status}`));
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      console.error(chalk.red(`Error: ${msg}`));
      process.exit(1);
    }
  });

module.exports = flows;