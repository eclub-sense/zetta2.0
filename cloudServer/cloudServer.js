/* global == */
var zetta = require('../zetta2.0-runtime/zetta');
var LED = require('zetta-mock-led');

var PORT = 1337;

var zettor = zetta();
zettor.name('eclub-iot-cloud');

// PV - Autorizace
zettor.httpServer.cloud.use(function(handle) {
    handle('request', function(env, next) {
      console.log(env.request.headers);
      
      // tady auth!
      var peopleWithAccess = [
        "pikoutom:123456",
        "valacpav:3484384",
        "sedivy:666"
      ];
      
      // if there is auth request, verify it
      if(env.request.headers.authorization) {
        console.log('checking people with access');
        var authArr = env.request.headers.authorization.split(" ");
        if(authArr.length > 1 && authArr[0] == 'Basic') {       
          var authString = new Buffer(authArr[1], 'base64').toString('utf8');
          
          // if the person is in the list, then OK
          if(peopleWithAccess.indexOf(authString) > -1) {
            console.log('found ya');
            // for everyone to use
            env.auth = {
              username: authString.split(":")[0],
              ownedDevices: [ "58e84075-46a9-4593-a430-fc402a410972" ]
            };
          } else {
            console.log('that`s not you bro');
            env.response.body = 'Unauthorized';
            env.response.statusCode = 401;
            env.argo._routed = true;
          }
        } else {
          console.log('we allow only basic auth');
          env.response.body = 'Bad Request';
          env.response.statusCode = 400;
          env.argo._routed = true;
        }
      } else {
          console.log('no credentials');
      }
      next(env);
    });
  });

zettor.use(LED, 1);
zettor.use(LED, 2);
zettor.use(LED, 666);
zettor.listen(PORT, function(err) {
  if(err) {
    console.error(err);
    process.exit(1);
  }
  console.log('running on http://localhost:', PORT)
});