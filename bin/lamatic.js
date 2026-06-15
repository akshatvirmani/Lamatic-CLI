#!/usr/bin/env node

const { program } = require("commander");
const pkg = require("../package.json");

program
  .name("lamatic")
  .description("The official CLI for Lamatic AI flows")
  .version(pkg.version);

program.addCommand(require("../commands/auth"));
program.addCommand(require("../commands/init"));
program.addCommand(require("../commands/deploy"));
program.addCommand(require("../commands/flow"));
program.addCommand(require("../commands/project"));
program.addCommand(require("../commands/contexts"));
program.addCommand(require("../commands/models"));
program.addCommand(require("../commands/integrations"));
program.addCommand(require("../commands/deployments"));

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}