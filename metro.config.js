const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // Enable CSS support for web
  isCSSEnabled: true,
});

// Optimize transformer for lower memory usage
config.transformer = {
  ...config.transformer,
  // Disable source maps to reduce memory usage
  sourceMaps: false,
  minifierConfig: {
    compress: {
      // Reduce passes to minimize memory usage
      passes: 1,
      // Disable advanced optimizations
      reduce_vars: false,
      collapse_vars: false,
      // Additional memory optimizations
      computed_props: false,
      keep_infinity: true,
      side_effects: false
    },
    mangle: {
      // Disable name mangling to reduce memory usage
      toplevel: false,
      keep_classnames: true,
      keep_fnames: true
    }
  },
  // Let Metro automatically determine optimal number of workers
  maxWorkers: 'auto'
};

// Additional memory optimizations
config.maxWorkers = 1; // Force single worker
config.resetCache = true; // Clear cache on startup
config.cacheStores = []; // Disable caching temporarily

module.exports = config;