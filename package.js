Package.describe({
  name: 'striletskyy:twitter-api',
  summary: 'Twiiter api for meteor application',
  version: '0.0.1',
  git: 'https://github.com/JSSolutions/meteor-twitter-api.git'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0.1');
  api.addFiles('striletskyy:twitter-api.js');
});
