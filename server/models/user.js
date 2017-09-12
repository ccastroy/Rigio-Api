'use strict';

module.exports = function(user) {
  user.getUsers = function(cb) {
    user.find({
      fields: {id: true},
      include: {
        relation: 'identities',
        scope: {
          fields: ['profile'],
        },
      },
    }
      , function(err, array) {
      var response = [];
      array.forEach(function(element) {
        // brace yourself chanchada incoming
        var felement = JSON.parse(JSON.stringify(element, null, 2));
        response.push({
          name: felement.identities[0].profile.displayName,
          photo: felement.identities[0].profile.photos[0].value,
          id: felement.id,
        });
      }, this);
      cb(null, response);
    });
  };
  user.remoteMethod(
    'getUsers',
    {
      description: 'Return names from users',
      http: {path: '/getUsers', verb: 'get'},
      accepts: [],
      returns: {
        arg: 'data',
        type: ['userProfile'],
        root: true,
      },
    }
  );
};
