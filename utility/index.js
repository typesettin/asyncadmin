'use strict';

module.exports = function (resources){
  const credit = require('./credit')(resources);
  const email = require('./email')(resources);
  const error = require('./error')(resources);
  const geolocation = require('./geolocation')(resources);
  const litmus = require('./litmus')(resources);
  const model = require('./model')(resources);
  const regulation = require('./regulation')(resources);
  const security = require('./security')(resources);
  const sor_helpers = require('./sor_helpers');
  const adverse_communications = require('./adverse_communications')(resources);

  return {
    credit,
    email,
    error,
    geolocation,
    model,
    litmus,
    security,
    regulation,
    sor_helpers,
    adverse_communications
  };
};