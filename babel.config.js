module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@/components': './src/shared/ui',
            '@/features': './src/features',
            '@/shared': './src/shared',
            '@/types': './src/shared/types',
            '@/utils': './src/shared/lib',
            '@/store': './src/shared/store',
            '@/api': './src/shared/api'
          },
        },
      ],
    ],
  };
};