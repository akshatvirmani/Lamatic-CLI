const { Command } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const { getConfig } = require('../utils/config');
const { getProject, getFlows, getFlowDetail } = require('../utils/api');

const project = new Command('project');

project
  .command('get')
  .description('Fetch and download an existing project to local')
  .option('--org-id <id>', 'Organization ID')
  .option('--project-id <id>', 'Project ID')
  .action(async (options) => {
    const config = getConfig();

    if (!config || !config.apiKey) {
      console.error(chalk.red('Error: Not authenticated.'));
      process.exit(1);
    }

    const orgId = options.orgId || config.orgId;

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

    console.log(chalk.gray(`\nFetching project "${projectId}"...`));

    try {
      const result = await getProject({ orgId, projectId });

      console.log(chalk.green('Project found!\n'));
      console.log(chalk.white('Project Details:'));
      console.log(chalk.gray(`ID:         ${result.id}`));
      console.log(chalk.gray(`Name:       ${result.name}`));
      console.log(chalk.gray(`Status:     ${result.status}`));
      console.log(chalk.gray(`Region:     ${result.location}`));
      console.log(chalk.gray(`Slug:       ${result.slug}`));
      console.log(chalk.gray(`Endpoint:   ${result.endpoint}`));
      console.log(chalk.gray(`Created by: ${result.created_by}`));

      const base = path.join(process.cwd(), result.name);

      if (fs.existsSync(base)) {
        console.log(chalk.yellow(`\nFolder "${result.name}" already exists. Skipping it.`));
      } else {
        // For Creating folders
        fs.mkdirSync(base);
        fs.mkdirSync(path.join(base, 'flows'));
        fs.mkdirSync(path.join(base, 'stores'));
        fs.mkdirSync(path.join(base, 'tools'));

        // Fetching and downloading flows
        console.log(chalk.gray('\nFetching flows...'));
        try {
          const flowsData = await getFlows({ orgId, projectId });
          const flows = flowsData.flows || [];

          if (flows.length === 0) {
            console.log(chalk.yellow('No flows found in this project.'));
          } else {
            for (const flow of flows) {
              try {
                const flowDetail = await getFlowDetail({ orgId, projectId, flowId: flow.id });

                fs.writeFileSync(
                  path.join(base, 'flows', `${flow.slug}.json`),
                  JSON.stringify(flowDetail, null, 2)
                );

                console.log(chalk.gray(` Downloaded flow: ${flow.name}`));
              } catch (err) {
                console.log(chalk.yellow(`Warning: Could not fetch flow details for ${flow.name}`));
              }
            }
          }
        } catch (flowErr) {
          console.log(chalk.yellow(`  Warning: Could not fetch flows: ${flowErr.message}`));
        }


        console.log(chalk.green(`\nProject downloaded locally!\n`));
        console.log(chalk.gray(`  ${result.name}/`));
        console.log(chalk.gray('  ├── lamatic.config.yaml'));
        console.log(chalk.gray('  ├── flows/'));
        console.log(chalk.gray('  │   └── *.yaml'));
        console.log(chalk.gray('  ├── stores/'));
        console.log(chalk.gray('  ├── tools/'));
        console.log(chalk.gray('  └── README.md'));
        console.log('');
        console.log(chalk.cyan(`cd ${result.name}`));
      }

    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message;
      console.error(chalk.red(`Error fetching project: ${msg}`));
      process.exit(1);
    }
  });

module.exports = project;