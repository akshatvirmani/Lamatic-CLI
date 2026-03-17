const { Command } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const { getConfig, saveConfig } = require('../utils/config');
const { createProject } = require('../utils/api');

const init = new Command('init');

init
  .argument('[project-name]', 'Name of your project')
  .description('Initialize a new Lamatic project')
  .option('-s, --scratch', 'Create project from scratch')
  .option('-t, --template <name>', 'Use a template')
  .option('--org-id <id>', 'Organization ID')
  .option('--user-id <id>', 'User ID')
  .option('--region <region>', 'Region for project (default: us-east-1)')
  .action(async (projectName, options) => {
    const config = getConfig();

    if (!config || !config.apiKey) {
      console.error(chalk.red('Error: Not authenticated.'));
      process.exit(1);
    }

    if (!projectName) {
      const res = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Project name:',
          validate: (val) => val.trim() !== '' || 'Project name is required',
        },
      ]);
      projectName = res.name;
    }

    const orgId  = options.orgId  || config.orgId;
    const userId = options.userId || config.userId;
    const region = 'us-east-1';

    if (!orgId) {
      console.error(chalk.red('Error: Organization ID is required.'));
      process.exit(1);
    }

    if (!userId) {
      console.error(chalk.red('Error: User ID is required.'));
      process.exit(1);
    }

    if (options.scratch) {
      await runScratch(projectName, { orgId, userId, region });
    } else if (options.template) {
      console.log(chalk.yellow(`Template support is under delopment. Creating from scratch instead.`));
      await runScratch(projectName, { orgId, userId, region });
    } else {
      const res = await inquirer.prompt([
        {
          type: 'list',
          name: 'method',
          message: 'How do you want to create the project?',
          choices: ['From scratch', 'From template (coming soon)'],
        },
      ]);
      await runScratch(projectName, { orgId, userId, region });
    }
  });

async function runScratch(projectName, { orgId, userId, region }) {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'description',
      message: 'Project description (optional):',
    },
  ]);

  console.log(chalk.gray(`\nCreating project "${projectName}" on Lamatic...`));

  let project = null;

  try {
    project = await createProject({
      orgId,
      name: projectName,
      region,
      userId,
    });

    console.log(chalk.green('Project created successfully on Lamatic!\n'));
    console.log(chalk.white(' Project Details:'));
    console.log(chalk.gray(`ID:         ${project.id}`));
    console.log(chalk.gray(`Slug:       ${project.slug}`));
    console.log(chalk.gray(`Status:     ${project.status}`));
    console.log(chalk.gray(`API Key ID: ${project.apiKey.keyId}`));

  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    const status = err.response?.status;

    if (status === 401 || status === 403) {
      console.error(chalk.red('Error: Unauthorized. Check your API key.'));
    } else if (status === 404) {
      console.error(chalk.red(`Error: Organization "${orgId}" not found.`));
    } else {
      console.error(chalk.red(`Error creating project: ${msg}`));
    }
  }
}

module.exports = init;