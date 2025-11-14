const purgecss = require('@fullhuman/postcss-purgecss')({
  content: ['./**/*.html', './src/**/*.{js,jsx,ts,tsx}'],
  defaultExtractor: content => content.match(/[^<>'"/\s]*[^<>'"/\s:]/g) || []
});

module.exports = {
  plugins: [
    require('autoprefixer'),
    ...(process.env.NODE_ENV === 'production' ? [purgecss] : [])
  ]
};