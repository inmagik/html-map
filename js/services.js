(function(){
  "use strict";

  angular.module("HtmlMap")
  .factory('ConfigService', function($http, $q){

    var svc = { config : null};

    var loadConfig = function(){
      var deferred = $q.defer();

      $http.get('config/config.json')
      .then(function (resp) {
        svc.config = resp.data;
        deferred.resolve(resp.data);
      }).catch(function(err){
        deferred.reject(err);
      });

      return deferred.promise;

    }

    svc.configPromise = loadConfig();

    return svc



  });

})();
