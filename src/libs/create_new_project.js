import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import { installPackages, installDevDependencies } from './instal_packages.js';

export async function createNewProject(folderPath, expoVersion) {
  try {
    // Get the folder name and parent directory
    const folderName = path.basename(folderPath);
    const parentDir = path.dirname(folderPath);
    const oldFolderPath = path.join(parentDir, `old_${folderName}`);
    const newFolderPath = folderPath; // This will be the new folder with original name

    // Check if old folder already exists
    const oldFolderExists = await fs.pathExists(oldFolderPath);
    if (oldFolderExists) {
      return {
        success: false,
        error: `Old folder already exists: ${oldFolderPath}. Please remove it first.`,
      };
    }

    // Step 1: Rename the current folder to old_folder_name
    await fs.rename(folderPath, oldFolderPath);
    console.log(`✓ Renamed ${folderName} to old_${folderName}`);

    // Step 2: Create new empty folder for the project
    console.log(`📁 Creating new project folder: ${folderName}`);
    await fs.ensureDir(newFolderPath);
    console.log(`✓ Created new folder: ${folderName}`);

    // Step 3: Read old project structure and package.json
    console.log(`📋 Analyzing old project structure...`);
    const oldProjectItems = await fs.readdir(oldFolderPath, {
      withFileTypes: true,
    });

    // Files and folders to ignore when copying from old project
    const ignoredItems = [
      'node_modules',
      'package.json',
      'package-lock.json',
      'android',
      'web',
      'ios',
    ];

    // Step 4: Create new package.json with old project metadata but without dependencies
    console.log(`📄 Creating new package.json...`);
    const oldPackageJsonPath = path.join(oldFolderPath, 'package.json');
    const oldPackageJsonExists = await fs.pathExists(oldPackageJsonPath);

    let oldPackageJson = {};
    if (oldPackageJsonExists) {
      oldPackageJson = await fs.readJson(oldPackageJsonPath);
    }

    // Create new package.json with old project's metadata but clean dependencies
    const newPackageJson = {
      name: oldPackageJson.name || folderName,
      version: oldPackageJson.version || '1.0.0',
      description: oldPackageJson.description || '',
      main: oldPackageJson.main || 'index.js',
      scripts: oldPackageJson.scripts || {},
      keywords: oldPackageJson.keywords || [],
      author: oldPackageJson.author || '',
      license: oldPackageJson.license || 'MIT',
      // Add any other metadata fields but exclude dependencies/devDependencies
      ...(oldPackageJson.repository && {
        repository: oldPackageJson.repository,
      }),
      ...(oldPackageJson.bugs && { bugs: oldPackageJson.bugs }),
      ...(oldPackageJson.homepage && { homepage: oldPackageJson.homepage }),
      ...(oldPackageJson.engines && { engines: oldPackageJson.engines }),
      ...(oldPackageJson.browserslist && {
        browserslist: oldPackageJson.browserslist,
      }),
      // Start with empty dependencies - will be populated by expo install
      dependencies: {},
      devDependencies: {},
    };

    const newPackageJsonPath = path.join(newFolderPath, 'package.json');
    await fs.writeJson(newPackageJsonPath, newPackageJson, { spaces: 2 });
    console.log(`✓ Created package.json with old project metadata`);

    // Step 5: Install specific Expo version
    console.log(`🚀 Installing Expo version ${expoVersion}...`);
    try {
      execSync(`npm install expo@${expoVersion}`, {
        cwd: newFolderPath,
        stdio: 'inherit',
      });
      console.log(`✓ Successfully installed Expo version ${expoVersion}`);
    } catch (error) {
      return {
        success: false,
        error: `Failed to install Expo: ${error.message}`,
      };
    }

    // Step 6: Copy all files and folders from old project except ignored ones
    console.log(`📥 Copying files from old project...`);
    for (const item of oldProjectItems) {
      if (ignoredItems.includes(item.name)) {
        console.log(`⏭ Skipping: ${item.name} (excluded folder/file)`);
        continue;
      }

      const sourcePath = path.join(oldFolderPath, item.name);
      const destPath = path.join(newFolderPath, item.name);

      try {
        await fs.copy(sourcePath, destPath);
        console.log(`✓ Copied from old project: ${item.name}`);
      } catch (copyError) {
        console.error(`✗ Failed to copy ${item.name}:`, copyError.message);
        // Continue with other files even if one fails
      }
    }

    // Step 7: Extract and install dependencies from old project with same versions
    console.log(`📦 Installing dependencies from old project...`);
    try {
      if (oldPackageJsonExists) {
        // Extract dependencies and devDependencies with their versions
        const dependencies = oldPackageJson.dependencies || {};
        const devDependencies = oldPackageJson.devDependencies || {};

        // Get package names with versions for exact installation
        const dependencyEntries = Object.entries(dependencies);
        const devDependencyEntries = Object.entries(devDependencies);

        console.log(
          `📋 Found ${dependencyEntries.length} dependencies and ${devDependencyEntries.length} dev dependencies in old project`
        );

        // Install regular dependencies using expo install (will get compatible versions)
        if (dependencyEntries.length > 0) {
          const dependencyNames = dependencyEntries.map(
            ([name, version]) => name
          );
          console.log(
            `📦 Installing dependencies: ${dependencyNames.join(', ')}`
          );
          const dependenciesSuccess = await installPackages(
            dependencyNames,
            newFolderPath
          );
          if (!dependenciesSuccess) {
            console.warn(`⚠ Warning: Some dependencies failed to install`);
          }
        }

        // Install dev dependencies using npm install -D (will get compatible versions)
        if (devDependencyEntries.length > 0) {
          const devDependencyNames = devDependencyEntries.map(
            ([name, version]) => name
          );
          console.log(
            `🔧 Installing dev dependencies: ${devDependencyNames.join(', ')}`
          );
          const devDependenciesSuccess = await installDevDependencies(
            devDependencyNames,
            newFolderPath
          );
          if (!devDependenciesSuccess) {
            console.warn(`⚠ Warning: Some dev dependencies failed to install`);
          }
        }

        if (
          dependencyEntries.length === 0 &&
          devDependencyEntries.length === 0
        ) {
          console.log(`ℹ No dependencies found in old project to install`);
        }
      } else {
        console.log(
          `⚠ No package.json found in old project, skipping dependency installation`
        );
      }
    } catch (error) {
      console.error(`✗ Error during dependency installation: ${error.message}`);
      // Continue even if dependency installation fails
    }

    return {
      success: true,
      message: `Successfully created new Expo project, migrated files, and installed dependencies for ${folderName}`,
      oldFolderPath,
      newFolderPath,
      ignoredItems,
      expoVersion,
      approach: 'Manual folder creation with file copying',
      dependenciesInstalled: `Dependencies and dev dependencies installed from old project with compatible versions`,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to create new project: ${error.message}`,
    };
  }
}

export default createNewProject;
