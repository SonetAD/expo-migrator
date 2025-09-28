import chalk from 'chalk';

/**
 * Center text in terminal
 */
function centerText(text, width = process.stdout.columns || 80) {
  const padding = Math.max(0, Math.floor((width - text.length) / 2));
  return ' '.repeat(padding) + text;
}

/**
 * Display a clean, amazing banner that works beautifully in both light and dark terminals
 */
function displayWelcomeBanner() {
  console.clear();

  // Beautiful spacing
  console.log('\n\n\n');

  // Main title - bold and prominent, works perfectly in both light/dark themes
  const title = 'Expo Migrator';
  console.log(centerText(chalk.bold(title)));

  console.log();

  // Subtitle - subtle gray that's readable in both light and dark terminals
  const subtitle = 'Seamless migration for your Expo applications';
  console.log(centerText(chalk.gray(subtitle)));

  // Clean spacing
  console.log('\n\n');
}

export { displayWelcomeBanner };
