const fs = require('node:fs/promises');
const path = require('node:path');
const { withDangerousMod } = require('@expo/config-plugins');

async function findKotlinEntryPoints(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const matches = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) matches.push(...await findKotlinEntryPoints(entryPath));
    else if (entry.name === 'MainActivity.kt' || entry.name === 'MainApplication.kt') matches.push(entryPath);
  }
  return matches;
}

module.exports = function withAndroidPackageFix(config) {
  return withDangerousMod(config, ['android', async (modConfig) => {
    const packageName = modConfig.android?.package;
    if (!packageName) throw new Error('expo.android.package is required');

    const javaRoot = path.join(modConfig.modRequest.platformProjectRoot, 'app', 'src', 'main', 'java');
    const entryPoints = await findKotlinEntryPoints(javaRoot);
    if (entryPoints.length !== 2) {
      throw new Error(`Expected two Android Kotlin entry points, found ${entryPoints.length}`);
    }

    for (const entryPoint of entryPoints) {
      const source = await fs.readFile(entryPoint, 'utf8');
      const updated = source.replace(/^package\s+[^\r\n]+/m, `package ${packageName}`);
      if (updated === source && !source.startsWith(`package ${packageName}`)) {
        throw new Error(`Could not update Android package declaration in ${entryPoint}`);
      }
      await fs.writeFile(entryPoint, updated, 'utf8');
    }

    return modConfig;
  }]);
};
