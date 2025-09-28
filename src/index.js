#!/usr/bin/env node

import { collectUserInput } from './user_input.js';
import { displayWelcomeBanner } from './libs/welcome_banner.js';
import chalk from 'chalk';

try {
  displayWelcomeBanner();

  const userInput = await collectUserInput();

  console.log();
  console.log(chalk.green('✓'), 'Migration configuration ready');
  console.log(chalk.gray('Version:'), userInput.expoVersion);
  console.log(chalk.gray('Project:'), userInput.projectPath);
  console.log();

  // TODO: Add actual migration logic here
  console.log(chalk.blue('🚀 Starting migration...'));
} catch (error) {
  console.log();
  console.log(chalk.red('✗'), error.message);
  process.exit(1);
}
