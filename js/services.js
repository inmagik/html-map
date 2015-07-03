(function(){
  "use strict";

  angular.module("HtmlMap")
  .factory('ConfigService', function($http, $q){

    var svc = { config : null, cssConfig : null};
    var parsedRules = [];

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

    var loadCssConfig = function(){
      var deferred = $q.defer();
      $http.get('config/config.css')
      .then(function (resp) {
        svc.cssConfig = resp.data;
        var parser = new cssjs();
        //parse css string
        parsedRules = parser.parseCSS(resp.data);
        console.log(2100, parsedRules);

        deferred.resolve(resp.data);
      }).catch(function(err){
        deferred.reject(err);
      });

      return deferred.promise;

    };

    svc.getStyleFor = function(name){
      var selectorName = "."+name;
      var rule = _.findWhere(parsedRules, {selector:selectorName});

      var x = _.groupBy(rule.rules, "directive");

      return new ol.style.Style({
        image: new ol.style.Circle({
          radius: 5,
          fill: new ol.style.Fill({color: '#666666'}),
          stroke: new ol.style.Stroke({color: '#bada55', width: 1})
        })
      })

      console.log("rule", rule, x);

    }

    svc.configPromise = $q.all([loadConfig(), loadCssConfig()]);


    return svc



  })


  .factory('MapsControllerDelegate', function($http, $q){

    var svc = { };
    svc.maps = {};
    var waiters = {};

    svc.applyMethod = function(func){
      angular.forEach(svc.maps, function(ctrl, name){
        console.log("ey", ctrl.map);
        func.apply(ctrl);
      });
    };

    svc.registerMap = function(mapController, name){
      if(!name){
        name = "map_" + Math.random()*10000;
      }
      svc.maps[name] = mapController;
      var w = waiters[name] || [];
      if(w.length){
        angular.forEach(w, function(i){
          i.resolve(true);
        })
      }
      return name;
    };

    svc.unregisterMap = function(name){
      delete svc.maps[name];
    };

    svc.waitForMap = function(mapName){
      var deferred = $q.defer();
      if(svc.maps[mapName]){
        deferred.resolve(true);
      } else {
        waiters[mapName] = waiters[mapName] || [];
        waiters[mapName].push(deferred);
      }
      return deferred.promise;
    };

    return svc



  });


})();
