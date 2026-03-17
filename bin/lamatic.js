const { program } = require('commander');

program
  .name('lamatic')
  .description('Lamatic CLI')
  .version('1.0.0');

program.addCommand(require('../commands/auth'));
program.addCommand(require('../commands/init'));
program.addCommand(require('../commands/flow'));
program.addCommand(require('../commands/deploy'));
program.addCommand(require('../commands/project'));

program.parse(process.argv);