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

    // If user selected custom version, ask for custom input
    let finalVersion = version;
    if (version === 'custom') {
      const { customVersion } = await inquirer.prompt([
        {
          type: 'input',
          name: 'customVersion',
          message: 'Enter custom Expo SDK version:',
          validate: (input) => {
            if (!input || input.trim() === '') {
              return 'Please enter a valid Expo SDK version';
            }
            // Basic version format validation (supports formats like "51", "51.0.0", "51.0.0-beta.1")
            const versionRegex = /^\d+(\.\d+)?(\.\d+)?(-\w+(\.\d+)?)?$/;
            if (!versionRegex.test(input.trim())) {
              return 'Please enter a valid version format (e.g., "51", "51.0.0", "51.0.0-beta.1")';
            }
            return true;
          },
        },
      ]);
      finalVersion = customVersion.trim();
    }

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
      expoVersion: finalVersion,
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
