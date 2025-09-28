import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';

function validateProjectPath(projectPath) {
  try {
    // Convert '.' to absolute path
    const absolutePath = path.resolve(projectPath);

    // Check if directory exists
    if (!fs.existsSync(absolutePath)) {
      return chalk.red(
        `❌ Directory does not exist: ${absolutePath}\n   Please try again with a valid path.`
      );
    }

    // Check if it's a directory
    if (!fs.statSync(absolutePath).isDirectory()) {
      return chalk.red(
        `❌ Path is not a directory: ${absolutePath}\n   Please try again with a valid directory path.`
      );
    }

    // Check for package.json
    const packageJsonPath = path.join(absolutePath, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      return chalk.red(
        `❌ No package.json found in: ${absolutePath}\n   Please try again with a valid Node.js project directory.`
      );
    }

    // Check if it's an Expo project
    try {
      const packageJson = fs.readJsonSync(packageJsonPath);
      const hasExpo =
        packageJson.dependencies?.expo ||
        packageJson.devDependencies?.expo ||
        packageJson.dependencies?.['@expo/cli'] ||
        packageJson.devDependencies?.['@expo/cli'];

      if (!hasExpo) {
        return chalk.red(
          `❌ This is not an Expo project: ${absolutePath}\n   No Expo dependencies found in package.json.\n   Please try again with a valid Expo project directory.`
        );
      }
    } catch (error) {
      return chalk.red(
        `❌ Invalid package.json file in: ${absolutePath}\n   Please try again with a valid project directory.`
      );
    }

    return true;
  } catch (error) {
    return chalk.red(
      `❌ Error accessing path: ${error.message}\n   Please try again with a valid path.`
    );
  }
}

export { validateProjectPath };
