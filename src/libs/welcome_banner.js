import chalk from 'chalk';

/**
 * Display a clean, minimal welcome banner
 */
function displayWelcomeBanner() {
  console.clear();

  console.log();
  console.log(chalk.bold('  Expo Migrator'));
  console.log(chalk.gray('  Migrate your Expo app smoothly'));
  console.log();
}

export { displayWelcomeBanner };
