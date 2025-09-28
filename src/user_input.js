import inquirer from 'inquirer';
import path from 'path';
import chalk from 'chalk';
import { getExpoVersions } from './libs/load_expo_version.js';
import { validateProjectPath } from './libs/validate_project_path.js';

async function collectUserInput() {
  try {
    // Add some breathing room
    console.log();

    // Get Expo SDK version list
    const expoVersions = await getExpoVersions();

    const { version } = await inquirer.prompt([
      {
        type: 'list',
        name: 'version',
        message: chalk.bold('🎯 Target Expo SDK version:'),
        choices: expoVersions,
        pageSize: 8,
        prefix: ' ',
        suffix: '',
      },
    ]);

    console.log(); // Add spacing

    // If user selected custom version, ask for custom input
    let finalVersion = version;
    if (version === 'custom') {
      const { customVersion } = await inquirer.prompt([
        {
          type: 'input',
          name: 'customVersion',
          message: chalk.bold('✏️  Enter custom Expo SDK version:'),
          prefix: ' ',
          suffix: '',
          validate: (input) => {
            if (!input || input.trim() === '') {
              return chalk.red('Please enter a valid Expo SDK version');
            }
            // Basic version format validation (supports formats like "51", "51.0.0", "51.0.0-beta.1")
            const versionRegex = /^\d+(\.\d+)?(\.\d+)?(-\w+(\.\d+)?)?$/;
            if (!versionRegex.test(input.trim())) {
              return chalk.red(
                'Please enter a valid version format (e.g., "51", "51.0.0", "51.0.0-beta.1")'
              );
            }
            return true;
          },
        },
      ]);
      finalVersion = customVersion.trim();
      console.log(); // Add spacing after custom version input
    }

    const { projectPath } = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectPath',
        message: chalk.bold('📁 Project path:'),
        default: '.',
        prefix: ' ',
        suffix: '',
        validate: async (input) => {
          const result = await validateProjectPath(input);
          return result === true ? true : chalk.red(result);
        },
      },
    ]);

    console.log(); // Add spacing

    const { proceed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'proceed',
        message: chalk.bold('🚀 Start migration?'),
        default: true,
        prefix: ' ',
        suffix: '',
      },
    ]);

    if (!proceed) {
      console.log();
      console.log(chalk.yellow('✋ Migration cancelled.'));
      process.exit(0);
    }

    return {
      expoVersion: finalVersion,
      projectPath: path.resolve(projectPath),
    };
  } catch (error) {
    if (error.isTtyError || error.message.includes('cancelled')) {
      console.log();
      console.log(chalk.yellow('✋ Migration cancelled.'));
      process.exit(0);
    }
    throw error;
  }
}

export { collectUserInput };
