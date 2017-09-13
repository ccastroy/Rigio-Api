'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');

var app = module.exports = loopback();

// Create an instance of PassportConfigurator with the app instance
var PassportConfigurator = require('loopback-component-passport').PassportConfigurator;
var passportConfigurator = new PassportConfigurator(app);
var FacebookTokenStrategy = require('passport-facebook-token');

var flash = require('express-flash');

app.use(loopback.token({
  headers: ['access_token'],
  model: 'accessToken',
}));

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});

// Exports tables to MySql
var dataSource = app.dataSources.Mysql;
dataSource.autoupdate(null, function(err) { });

// Load the provider configurations
var config = {};
try {
  config = require('../providers.json');
} catch (err) {
  console.error('Please configure your passport strategy in `providers.json`.');
  process.exit(1);
}

// We need flash messages to see passport errors
app.use(flash());

// Initialize passport
passportConfigurator.init();

// Set up related models
passportConfigurator.setupModels({
  userModel: app.models.user,
  userIdentityModel: app.models.userIdentity,
  userCredentialModel: app.models.userCredential,
});
// Configure passport strategies for third party auth providers
for (var s in config) {
  var c = config[s];
  c.session = c.session !== false;
  passportConfigurator.configureProvider(s, c);
}

