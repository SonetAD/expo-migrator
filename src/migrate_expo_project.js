import { createNewProject } from './libs/create_new_project.js';
import chalk from 'chalk';

export async function migrateExpoProject(projectPath, expoVersion) {
  try {
    console.log();
    console.log(chalk.green('✓'), 'Migration configuration ready');
    console.log(chalk.gray('Version:'), expoVersion);
    console.log(chalk.gray('Project:'), projectPath);
    console.log();

    // Start the migration process
    console.log(chalk.blue('🚀 Starting migration...'));

    const migrationResult = await createNewProject(projectPath, expoVersion);

    if (migrationResult.success) {
      console.log();
      console.log(chalk.green('🎉'), 'Migration completed successfully!');
      console.log(chalk.gray('Old project:'), migrationResult.oldFolderPath);
      console.log(chalk.gray('New project:'), migrationResult.newFolderPath);
      console.log();
      console.log(chalk.blue('📋'), 'Summary:');
      console.log(
        chalk.gray('•'),
        `Created new Expo project with version ${expoVersion}`
      );
      console.log(
        chalk.gray('•'),
        'Migrated all files and folders from old project'
      );
      console.log(
        chalk.gray('•'),
        'Installed dependencies with compatible versions'
      );
      console.log(chalk.gray('•'), 'Your old project is safely backed up');
      console.log();
      console.log(chalk.yellow('💡'), 'Next steps:');
      console.log(
        chalk.gray('•'),
        'Review the migrated code for any breaking changes'
      );
      console.log(chalk.gray('•'), 'Test your app thoroughly');
      console.log(chalk.gray('•'), 'Update any deprecated APIs if needed');

      return migrationResult;
    } else {
      console.log();
      console.log(chalk.red('❌'), 'Migration failed!');
      console.log(chalk.red('Error:'), migrationResult.error);
      throw new Error(migrationResult.error);
    }
  } catch (error) {
    console.log();
    console.log(chalk.red('✗'), error.message);
    throw error;
  }
}
