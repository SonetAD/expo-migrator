import chalk from 'chalk';

/**
 * Fetch the latest Expo versions from npm registry
 * @returns {Object} - Object containing latest versions and metadata
 */
export async function fetchLatestExpoVersions() {
  try {
    // Fetch all versions from npm registry
    const res = await fetch('https://registry.npmjs.org/expo');
    const data = await res.json();

    // Extract dist-tags for latest and canary versions
    const distTags = data['dist-tags'] || {};
    const latestStable = distTags.latest;
    const canaryVersion = distTags.canary;

    // Get all versions as an array
    const allVersions = Object.keys(data.versions);

    // Filter out pre-release versions for stable releases
    const stableVersions = allVersions.filter((version) => {
      return (
        !version.includes('-') &&
        !version.includes('alpha') &&
        !version.includes('beta') &&
        !version.includes('rc')
      );
    });

    // Sort stable versions from latest to oldest
    stableVersions.sort((a, b) => {
      const pa = a.split('.').map(Number);
      const pb = b.split('.').map(Number);

      for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
        const numA = pa[i] || 0;
        const numB = pb[i] || 0;
        if (numA > numB) return -1;
        if (numA < numB) return 1;
      }
      return 0;
    });

    // Get top 5 stable versions
    const topStableVersions = stableVersions.slice(0, 5);

    // Return version data with metadata
    return {
      latest: latestStable,
      canary: canaryVersion,
      stable: topStableVersions,
      allVersions: allVersions,
    };
  } catch (err) {
    console.error(
      chalk.yellow(
        '⚠️  Warning: Could not fetch latest Expo versions from npm registry'
      )
    );
    console.error(chalk.gray(`   ${err.message}`));
    console.log(chalk.gray('   Falling back to static version list...\n'));
    return null;
  }
}

/**
 * Get available Expo SDK versions
 * @returns {Array} - Array of Expo SDK versions
 */
export async function getExpoVersions() {
  // Try to fetch latest versions first
  const versionData = await fetchLatestExpoVersions();

  if (versionData && versionData.latest) {
    // Return only latest stable and custom version options
    return [
      {
        name: `📱 SDK ${versionData.latest} (Latest Stable)`,
        value: versionData.latest,
      },
      { name: chalk.gray('─'.repeat(40)), disabled: true },
      { name: '🔧 Custom Version', value: 'custom' },
    ];
  }

  // Fallback to static versions if fetch fails
  return [
    { name: '📱 SDK 54 (Latest Stable)', value: '54' },
    { name: chalk.gray('─'.repeat(40)), disabled: true },
    { name: '🔧 Custom Version', value: 'custom' },
  ];
}
