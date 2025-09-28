import fs from 'fs';
import path from 'path';

export async function deleteFolder(folderPath) {
  try {
    // Check if the path exists
    if (!fs.existsSync(folderPath)) {
      return {
        success: false,
        error: `Path does not exist: ${folderPath}`,
      };
    }

    // Check if it's a directory
    const stats = fs.statSync(folderPath);
    if (!stats.isDirectory()) {
      return {
        success: false,
        error: `Path is not a directory: ${folderPath}`,
      };
    }

    // Use fs.rmSync with recursive option (Node.js 14.14.0+)
    // This is the modern way to delete directories recursively
    fs.rmSync(folderPath, {
      recursive: true,
      force: true,
    });

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to delete folder: ${error.message}`,
    };
  }
}

/**
 * Safely deletes a folder with additional validation
 * @param {string} folderPath - The path to the folder to delete
 * @param {boolean} confirmDeletion - Whether to require confirmation (default: true)
 * @returns {Promise<{success: boolean, error?: string}>} - Result of the deletion operation
 */
export async function safeDeleteFolder(folderPath, confirmDeletion = true) {
  try {
    // Resolve to absolute path
    const absolutePath = path.resolve(folderPath);

    // Basic safety checks to prevent accidental deletion of important directories
    const dangerousPaths = [
      '/',
      '/Users',
      '/System',
      '/Applications',
      process.env.HOME,
      path.join(process.env.HOME, 'Desktop'),
      path.join(process.env.HOME, 'Documents'),
      path.join(process.env.HOME, 'Downloads'),
    ];

    if (dangerousPaths.includes(absolutePath)) {
      return {
        success: false,
        error: `Refusing to delete protected directory: ${absolutePath}`,
      };
    }

    // Check if path is too short (potential safety issue)
    if (absolutePath.split(path.sep).length < 3) {
      return {
        success: false,
        error: `Path appears too broad for safe deletion: ${absolutePath}`,
      };
    }

    return await deleteFolder(absolutePath);
  } catch (error) {
    return {
      success: false,
      error: `Failed to safely delete folder: ${error.message}`,
    };
  }
}
