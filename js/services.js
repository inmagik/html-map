(function(){
  "use strict";

  angular.module("HtmlMap")
  .factory('ConfigService', function($http, $q){

    var svc = { config : null, cssConfig : null, shader:null};
    var parsedRules = [];

    var loadConfig = function(){
      var deferred = $q.defer();
      $http.get('config/mapconfig.json')
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
      $http.get('config/geostyle.css')
      .then(function (resp) {
        svc.cssConfig = resp.data;
        svc.shader = new carto.RendererJS().render(svc.cssConfig);

        deferred.resolve(resp.data);
      }).catch(function(err){
        deferred.reject(err);
      });

      return deferred.promise;

    };

    var createOlStyle = function(opts){
      var fill = new ol.style.Fill({
        color: opts['marker-fill'] || 'rgba(255,255,255,0.4)'
      });
      var stroke = new ol.style.Stroke({
        color: '#3399CC',
        width: opts['stroke-width'] || 1.25
      });
      var styles = [
        new ol.style.Style({
          image: new ol.style.Circle({
            fill: fill,
            stroke: stroke,
            radius: opts['marker-width'] || 5
          }),
          fill: fill,
          stroke: stroke
        })
      ];

     return styles;

    };

    svc.getStyleFor = function(name){
      var layer = svc.shader.findLayer({ name: "#"+name });
      if(!layer){
        return undefined;
      }
      return function(feature, resolution){
        var props = feature.getProperties();
        var style = layer.getStyle(props, { resolution: resolution});
        return createOlStyle(style);
      }


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
