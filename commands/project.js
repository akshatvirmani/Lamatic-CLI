// commands/project.js
// `lamatic project <subcommand>`

const { Command } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const { getConfig } = require('../utils/config');
const { getProject, getFlows, getFlowDetail, listProjects, deleteProject } = require('../utils/api');

const project = new Command('project');
project.description('Manage Lamatic projects');

// ── list ──────────────────────────────────────────────────────────────────────
project
  .command('list')
  .description('List all projects in your organization')
  .action(async () => {
    const config = getConfig();
    if (!config?.apiKey) {
      console.error(chalk.red('Error: Not authenticated. Run `lamatic auth login` first.'));
      process.exit(1);
    }

    console.log(chalk.gray('\nFetching projects...'));
    try {
      const data = await listProjects();
      const list = data.projects || [];

      if (!list.length) {
        console.log(chalk.yellow('No projects found.'));
        return;
      }

      console.log(chalk.green(`\nFound ${list.length} project(s):\n`));
      list.forEach((p) => {
        console.log(chalk.bold(`  ${p.name}`));
        console.log(chalk.gray(`    ID     : ${p.id}`));
        console.log(chalk.gray(`    Status : ${p.status}`));
        console.log(chalk.gray(`    Region : ${p.location}`));
        console.log('');
      });
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      console.error(chalk.red(`Error: ${msg}`));
      process.exit(1);
    }
  });

// ── get ───────────────────────────────────────────────────────────────────────
project
  .command('get')
  .description('Fetch and download an existing project to local')
  .option('--org-id <id>', 'Organization ID')
  .option('--project-id <id>', 'Project ID')
  .action(async (options) => {
    const config = getConfig();

    if (!config?.apiKey) {
      console.error(chalk.red('Error: Not authenticated. Run `lamatic auth login` first.'));
      process.exit(1);
    }

    const orgId = options.orgId || config.orgId;

    let projectId = options.projectId;
    if (!projectId) {
      const res = await inquirer.prompt([{
        type: 'input',
        name: 'projectId',
        message: 'Project ID:',
        validate: (val) => val.trim() !== '' || 'Project ID is required',
      }]);
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
        console.log(chalk.yellow(`\nFolder "${result.name}" already exists. Skipping download.`));
      } else {
        fs.mkdirSync(base);
        fs.mkdirSync(path.join(base, 'flows'));
        fs.mkdirSync(path.join(base, 'stores'));
        fs.mkdirSync(path.join(base, 'tools'));

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
                console.log(chalk.gray(`  Downloaded flow: ${flow.name}`));
              } catch (err) {
                console.log(chalk.yellow(`  Warning: Could not fetch flow details for ${flow.name}`));
              }
            }
          }
        } catch (flowErr) {
          console.log(chalk.yellow(`  Warning: Could not fetch flows: ${flowErr.message}`));
        }

        console.log(chalk.green(`\nProject downloaded locally!\n`));
        console.log(chalk.gray(`  ${result.name}/`));
        console.log(chalk.gray('  ├── flows/'));
        console.log(chalk.gray('  ├── stores/'));
        console.log(chalk.gray('  └── tools/'));
        console.log('');
        console.log(chalk.cyan(`cd ${result.name}`));
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message;
      console.error(chalk.red(`Error fetching project: ${msg}`));
      process.exit(1);
    }
  });

// ── delete ────────────────────────────────────────────────────────────────────
project
  .command('delete')
  .description('Delete a project')
  .option('--project-id <id>', 'Project ID to delete')
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

    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: chalk.red(`Are you sure you want to delete project ${projectId}?`),
      default: false,
    }]);

    if (!confirm) {
      console.log(chalk.yellow('Aborted.'));
      return;
    }

    console.log(chalk.gray('\nDeleting project...'));
    try {
      const result = await deleteProject({ orgId: config.orgId, projectId, userId: config.userId });
      console.log(chalk.green('Project deleted successfully!'));
      console.log(chalk.gray(`  Message: ${result.message}`));
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      console.error(chalk.red(`Error: ${msg}`));
      process.exit(1);
    }
  });

module.exports = project;