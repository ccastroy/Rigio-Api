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
        var name  = element.__data.identities[0].__data.profile.displayName;
        var photo = element.__data.identities[0].__data.profile.photos[0].value;
        var id    = element.__data.id;
        response.push({
          name: name,
          photo: photo,
          id: id,
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
