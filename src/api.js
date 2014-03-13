var _ = require('underscore');

module.exports.persistCustomer = function(customerData) {
  $('.dummy-api').html('<p>API Request <pre>' + JSON.stringify(customerData) +'</pre></p>');

  var defer = $.Deferred();
  defer.resolve(_.extend({}, customerData, {updatedAt: new Date()}));
  return defer.promise();
};
