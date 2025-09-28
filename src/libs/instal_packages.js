import { spawn } from 'child_process';
import chalk from 'chalk';

async function installPackages(packageNames, projectPath) {
  if (!packageNames || packageNames.length === 0) {
    console.log(chalk.yellow('⚠'), 'No packages to install');
    return true;
  }

  if (!Array.isArray(packageNames)) {
    throw new Error('Package names must be provided as an array');
  }

  console.log(
    chalk.blue('📦'),
    `Installing ${packageNames.length} package(s)...`
  );
  console.log(chalk.gray('Packages:'), packageNames.join(', '));
  console.log();

  try {
    // Build the command arguments
    const args = ['expo', 'install', ...packageNames];

    // Show the command being executed
    console.log(chalk.gray('Running:'), `npx ${args.join(' ')}`);
    console.log();

    // Execute the command
    const success = await executeCommand('npx', args, projectPath);

    if (success) {
      console.log();
      console.log(chalk.green('✓'), 'Packages installed successfully');
      return true;
    } else {
      console.log();
      console.log(chalk.red('✗'), 'Package installation failed');
      return false;
    }
  } catch (error) {
    console.log();
    console.log(
      chalk.red('✗'),
      'Error during package installation:',
      error.message
    );
    return false;
  }
}

/**
 * Execute a command using spawn
 * @param {string} command - The command to execute
 * @param {string[]} args - Command arguments
 * @param {string} cwd - Working directory
 * @returns {Promise<boolean>} - Returns true if command succeeds
 */
function executeCommand(command, args, cwd) {
  return new Promise((resolve) => {
    const process = spawn(command, args, {
      cwd,
      stdio: 'inherit', // This will show the command output in real-time
      shell: true,
    });

    process.on('close', (code) => {
      resolve(code === 0);
    });

    process.on('error', (error) => {
      console.log(chalk.red('Command execution error:'), error.message);
      resolve(false);
    });
  });
}

async function installSinglePackage(packageName, projectPath) {
  return installPackages([packageName], projectPath);
}

async function installDevDependencies(packageNames, projectPath) {
  if (!packageNames || packageNames.length === 0) {
    console.log(chalk.yellow('⚠'), 'No dev dependencies to install');
    return true;
  }

  if (!Array.isArray(packageNames)) {
    throw new Error('Package names must be provided as an array');
  }

  console.log(
    chalk.blue('🔧'),
    `Installing ${packageNames.length} dev dependency(ies)...`
  );
  console.log(chalk.gray('Dev Dependencies:'), packageNames.join(', '));
  console.log();

  try {
    // Build the command arguments for npm install -D
    const args = ['install', '-D', ...packageNames];

    // Show the command being executed
    console.log(chalk.gray('Running:'), `npm ${args.join(' ')}`);
    console.log();

    // Execute the command
    const success = await executeCommand('npm', args, projectPath);

    if (success) {
      console.log();
      console.log(chalk.green('✓'), 'Dev dependencies installed successfully');
      return true;
    } else {
      console.log();
      console.log(chalk.red('✗'), 'Dev dependencies installation failed');
      return false;
    }
  } catch (error) {
    console.log();
    console.log(
      chalk.red('✗'),
      'Error during dev dependencies installation:',
      error.message
    );
    return false;
  }
}

export { installPackages, installSinglePackage, installDevDependencies };
