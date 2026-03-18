const { Command } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const { getConfig } = require('../utils/config');
const { createFlow } = require('../utils/api');

const flow = new Command('flow');

flow
  .command('create')
  .description('Create a new flow in a project')
  .option('--org-id <id>', 'Organization ID')
  .option('--project-id <id>', 'Project ID')
  .option('--name <name>', 'Flow name')
  .action(async (options) => {
    const config = getConfig();

    if (!config || !config.apiKey) {
      console.error(chalk.red('Error: Not authenticated.'));
      process.exit(1);
    }

    const orgId = options.orgId || config.orgId;

    if (!orgId) {
      console.error(chalk.red('Error: Organization ID is required.'));
      process.exit(1);
    }

    let projectId = options.projectId;
    if (!projectId) {
      const res = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectId',
          message: 'Project ID:',
          validate: (val) => val.trim() !== '' || 'Project ID is required',
        },
      ]);
      projectId = res.projectId;
    }

   
    let flowName = options.name;
    if (!flowName) {
      const res = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Flow name:',
          validate: (val) => val.trim() !== '' || 'Flow name is required',
        },
      ]);
      flowName = res.name;
    }

    console.log(chalk.gray(`\nCreating flow "${flowName}"...`));

    try {
      const result = await createFlow({
        orgId,
        projectId,
        name: flowName,
      });

      console.log(chalk.green('Flow created successfully!\n'));

    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message;
      console.error(chalk.red(`Error creating flow: ${msg}`));
      process.exit(1);
    }
  });

module.exports = flow;