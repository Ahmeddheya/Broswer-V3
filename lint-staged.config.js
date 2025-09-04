module.exports = {
  '*.{ts,tsx,js,jsx}': [
    'eslint --fix',
    'prettier --write',
    'jest --bail --findRelatedTests --passWithNoTests'
  ],
  '*.{json,md,yml,yaml}': ['prettier --write']
};