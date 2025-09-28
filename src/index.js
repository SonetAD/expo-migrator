#!/usr/bin/env node

import { collectUserInput } from './user_input.js';
import { displayWelcomeBanner } from './libs/welcome_banner.js';
import { migrateExpoProject } from './migrate_expo_project.js';
import chalk from 'chalk';

try {
  displayWelcomeBanner();

  const userInput = await collectUserInput();

  // Pass folder name and expo version to migration logic
  await migrateExpoProject(userInput.projectPath, userInput.expoVersion);
} catch (error) {
  console.log();
  console.log(chalk.red('✗'), error.message);
  process.exit(1);
}
