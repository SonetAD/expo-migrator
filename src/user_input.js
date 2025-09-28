import inquirer from 'inquirer';
import path from 'path';
import chalk from 'chalk';
import { getExpoVersions } from './libs/load_expo_version.js';
import { validateProjectPath } from './libs/validate_project_path.js';

async function collectUserInput() {
  try {
    console.log(chalk.gray("Let's get your project migrated.\n"));

    // Get Expo SDK version list
    const expoVersions = await getExpoVersions();

    const { version } = await inquirer.prompt([
      {
        type: 'list',
        name: 'version',
        message: 'Target Expo SDK version:',
        choices: expoVersions,
        pageSize: 8,
      },
    ]);

    const { projectPath } = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectPath',
        message: 'Project path:',
        default: '.',
        validate: async (input) => {
          const result = await validateProjectPath(input);
          return result === true ? true : result;
        },
      },
    ]);

    const { proceed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'proceed',
        message: 'Start migration?',
        default: true,
      },
    ]);

    if (!proceed) {
      console.log(chalk.yellow('\nMigration cancelled.'));
      process.exit(0);
    }

    return {
      expoVersion: version,
      projectPath: path.resolve(projectPath),
    };
  } catch (error) {
    if (error.isTtyError || error.message.includes('cancelled')) {
      console.log(chalk.yellow('\nMigration cancelled.'));
      process.exit(0);
    }
    throw error;
  }
}

export { collectUserInput };
