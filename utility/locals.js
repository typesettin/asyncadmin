'use strict';
var path = require('path');
var fs = require('fs-extra');
var Errorie = require('errorie');

module.exports = function (periodic) {
  let sor_db_connection = require('../controller/sor_db_connection')(periodic);
  let pas_oauth2_config;
  let dataservicesConfig = fs.readJsonSync(path.join(process.cwd(),'content/config/themes/periodicjs.theme.dataservices/periodicjs.theme.json'));
  
  periodic.app.themeconfig = {
    sor: sor_db_connection,
    dataservices : {
      config : dataservicesConfig[periodic.settings.application.environment],
      population : require('../controller/helper_population')
    }
  };
  pas_oauth2_config = periodic.app.controller.extension.login.loginExtSettings.passport.oauth.oauth2client.filter(config => config.service_name === 'pas')[0];
  periodic.app.themeconfig.pas_oauth2_config = pas_oauth2_config;
  periodic.app.themeconfig.microservice_config = require(path.join(__dirname, '../../../config/themes/periodicjs.theme.dataservices/microservice'))[periodic.settings.application.environment];
  periodic.app.themeconfig.pas_client_auth_header = 'Basic ' + new Buffer(pas_oauth2_config.client_token_id + ':' + pas_oauth2_config.client_secret).toString('base64');
  //configure locals
  periodic.app.themeconfig = periodic.app.themeconfig || {};
  periodic.app.themeconfig.controller = Object.assign({},periodic.app.themeconfig.controller);

	return periodic;
};
