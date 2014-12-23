Package.describe({
  name: 'striletskyy:twitter-api',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0',
  git: ' /* Fill me in! */ '
});

Package.onUse(function(api) {
  api.versionsFrom('1.0.1');
  api.addFiles('striletskyy:twitter-api.js');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('striletskyy:twitter-api');
  api.addFiles('striletskyy:twitter-api-tests.js');
});
