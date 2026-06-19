const { withAndroidManifest } = require('@expo/config-plugins');

const withUsageStatsPermission = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const manifest = androidManifest.manifest;

    if (!manifest['uses-permission']) {
      manifest['uses-permission'] = [];
    }

    const hasPermission = manifest['uses-permission'].find(
      (item) => item.$['android:name'] === 'android.permission.PACKAGE_USAGE_STATS'
    );

    if (!hasPermission) {
      manifest['uses-permission'].push({
        $: {
          'android:name': 'android.permission.PACKAGE_USAGE_STATS',
          'tools:ignore': 'ProtectedPermissions',
        },
      });
    }

    const hasQueryAll = manifest['uses-permission'].find(
      (item) => item.$['android:name'] === 'android.permission.QUERY_ALL_PACKAGES'
    );

    if (!hasQueryAll) {
      manifest['uses-permission'].push({
        $: {
          'android:name': 'android.permission.QUERY_ALL_PACKAGES',
          'tools:ignore': 'ProtectedPermissions',
        },
      });
    }

    // Ensure the tools namespace is present if we use tools:ignore
    if (!manifest.$['xmlns:tools']) {
      manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }

    return config;
  });
};

module.exports = withUsageStatsPermission;
