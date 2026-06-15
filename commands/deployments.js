// src/commands/deployments.js
// `lamatic deployments <subcommand>`

const { Command } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const { getConfig } = require('../utils/config');
const { listDeployments, getDeployment } = require('../utils/api');

const deployments = new Command('deployments');
deployments.description('View deployments for a Lamatic project');

// ── list ──────────────────────────────────────────────────────────────────────
deployments
  .command('list')
  .description('List all deployments')
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

    console.log(chalk.gray('\nFetching deployments...'));
    try {
      const data = await listDeployments({ orgId: config.orgId, projectId });
      const list = data.deployments || [];

      if (!list.length) {
        console.log(chalk.yellow('No deployments found.'));
        return;
      }

      console.log(chalk.green(`\nFound ${list.length} deployment(s):\n`));
      list.forEach((d) => {
        const statusColor = d.status === 'success' ? chalk.green(d.status) : chalk.red(d.status);
        console.log(chalk.bold(`  ${d.name}`));
        console.log(chalk.gray(`    ID     : ${d.id}`));
        console.log(`    Status : ${statusColor}`);
        console.log('');
      });
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      console.error(chalk.red(`Error: ${msg}`));
      process.exit(1);
    }
  });

// ── get ───────────────────────────────────────────────────────────────────────
deployments
  .command('get')
  .description('Get details of a specific deployment')
  .option('--project-id <id>', 'Project ID')
  .option('--deployment-id <id>', 'Deployment ID')
  .action(async (options) => {
    const config = getConfig();
    if (!config?.apiKey) {
      console.error(chalk.red('Error: Not authenticated. Run `lamatic auth login` first.'));
      process.exit(1);
    }

    let projectId = options.projectId;
    let deploymentId = options.deploymentId;

    if (!projectId || !deploymentId) {
      const res = await inquirer.prompt([
        !projectId && { type: 'input', name: 'projectId', message: 'Project ID:', validate: (v) => v.trim() !== '' || 'Required' },
        !deploymentId && { type: 'input', name: 'deploymentId', message: 'Deployment ID:', validate: (v) => v.trim() !== '' || 'Required' },
      ].filter(Boolean));
      projectId = projectId || res.projectId;
      deploymentId = deploymentId || res.deploymentId;
    }

    console.log(chalk.gray('\nFetching deployment details...'));
    try {
      const d = await getDeployment({ orgId: config.orgId, projectId, deploymentId });
      console.log(chalk.green('\nDeployment found!\n'));
      console.log(chalk.bold(`  ${d.name}`));
      console.log(chalk.gray(`    ID           : ${d.id}`));
      console.log(chalk.gray(`    Status       : ${d.status}`));
      console.log(chalk.gray(`    Triggered By : ${d.triggered_by}`));
      console.log(chalk.gray(`    Created At   : ${d.created_at}`));
      console.log(chalk.gray(`    Time Taken   : ${d.time_taken_in_seconds}s`));
      if (d.changes_deployed?.length) {
        console.log(chalk.gray('    Changes:'));
        d.changes_deployed.forEach((c) => console.log(chalk.gray(`      - ${c.name}`)));
      }
      console.log('');
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      console.error(chalk.red(`Error: ${msg}`));
      process.exit(1);
    }
  });

module.exports = deployments;