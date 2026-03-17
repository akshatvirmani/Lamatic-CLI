const { Command } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const { getConfig } = require('../utils/config');
const { triggerDeployment } = require('../utils/api');

const deploy = new Command('deploy');

deploy
  .description('Trigger a deployment for a project')
  .option('--org-id <id>', 'Organization ID')
  .option('--project-id <id>', 'Project ID')
  .option('--name <name>', 'Deployment name')
  .option('--description <desc>', 'Deployment description')
  .action(async (options) => {
    const config= getConfig();

    if (!config || !config.apiKey) {
      console.error(chalk.red('Error: Not authenticated.'));
      process.exit(1);
    }

    const orgId = options.orgId || config.orgId;
    const userId = config.userId;

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

    let name = options.name;
    let description = options.description;

    if (!name || !description) {
      const res = await inquirer.prompt([
        !name && {
          type: 'input',
          name: 'name',
          message: 'Deployment name:',
          default: 'My Deployment',
        },
        !description && {
          type: 'input',
          name: 'description',
          message: 'Deployment description:',
          default: 'Triggered from Lamatic CLI',
        },
      ].filter(Boolean));

      name = name || res.name;
      description = description || res.description;
    }

    console.log(chalk.gray(`\nTriggering deployment for project "${projectId}"...`));

    try {
      const result = await triggerDeployment({
        orgId,
        projectId,
        name,
        description,
        userId,
      });

      console.log(chalk.green('Deployment triggered successfully!\n'));
      console.log(chalk.gray(JSON.stringify(result, null, 2)));
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message;
      console.error(chalk.red(`Error triggering deployment: ${msg}`));
      process.exit(1);
    }
  });

module.exports = deploy;