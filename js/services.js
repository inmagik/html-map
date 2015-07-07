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



    svc.configPromise = $q.all([loadConfig(), loadCssConfig()]);

    return svc


  })


  .factory('OLFactory', function(ConfigService, $http, $q){

    var svc = { };


    var createOlStyle = function(opts){
      var fill = new ol.style.Fill({
        color: opts['marker-fill'] || 'rgba(255,255,255,0.4)'
      });
      var stroke = new ol.style.Stroke({
        color: '#3399CC',
        width: opts['stroke-width'] || 1.25
      });

      var pfill;
      if(opts['polygon-fill']){
        pfill = new ol.style.Fill({
          color: opts['polygon-fill']
        });
      }

      var lstroke;
      if(opts['line-width'] || opts['line-color']){
        lstroke = new ol.style.Stroke({
          color: opts['line-color'] || '#222',
          width: opts['line-width'] || 1
        });
      }

      var options = {
        image: new ol.style.Circle({
          fill: fill,
          stroke: stroke,
          radius: opts['marker-width'] || 5
        }),
        fill: pfill || fill,
        stroke: lstroke || stroke
      };

      if(opts['text-name']){

        var textStroke = new ol.style.Stroke({
          color: opts['text-stroke']|| 'black',
          width: opts['text-stroke-width'] || 1
        });

        var textFill = new ol.style.Fill({
          color: opts['text-fill'] || '#000'
        });

        console.log(1, opts)

        options.text = new ol.style.Text({
          font: opts['text-size'] || '12px' + ' '+ opts['text-face-name'] || 'Calibri,sans-serif',
          text: opts['text-name'],
          fill: textFill,
          stroke: textStroke,
          offsetX : opts['text-dx'],
          offsetY : opts['text-dy'],
          rotation : opts['text-rotation']
        })
      };

      if(opts['z-index']){
        options.zIndex = opts['z-index'];
      }

      var style  = new ol.style.Style(options);

      var styles = [
        style
      ];


     return styles;

    };

    svc.getStyleFor = function(name, map){
      var layer = ConfigService.shader.findLayer({ name: "#"+name });
      if(!layer){
        return undefined;
      }
      return function(feature, resolution){
        var props = feature.getProperties();
        var zoom = map.getView().getZoom();
        var style = layer.getStyle(props, { resolution: resolution, zoom:zoom});
        return createOlStyle(style);
      }
    }


    var xyzLayer= function(obj){
      return new ol.layer.Tile({
        title : obj.title || 'XYZ Layer',
        type : "base",
        source: new ol.source.XYZ(obj.layerOptions)
      })
    };

    var getBaseTileOptions = function(obj){
      var out = {};
      if(!obj.layerOptions){
        return out;
      }
      out = _.pick(obj.layerOptions, ['opacity', 'hue', 'contrast', 'brightness']);
      return out;

    }

    svc.createLayer= function(obj, map){

      var baseTileOptions =getBaseTileOptions(obj);

      if(obj.layerType == 'stamen'){
        var opts = _.extend(
            baseTileOptions,
            {
              title : obj.title || 'Stamen '+obj.layerOptions.layer,
              type : "base",
              source: new ol.source.Stamen(obj.layerOptions)
            }
          );
        return new ol.layer.Tile(opts)
      }

      if(obj.layerType == 'mapquest'){

        return new ol.layer.Tile({
          title : obj.title || 'MapQuest '+obj.layerOptions.layer,
          type : "base",
          source: new ol.source.MapQuest(obj.layerOptions)
        })
      }

      if(obj.layerType == 'opencyclemap'){
        return new ol.layer.Tile({
          title : obj.title || 'OSM opencyclemap',
          type : "base",
          source: new ol.source.OSM({
            attributions: [
              new ol.Attribution({
                html: 'All maps &copy; ' +
                    '<a href="http://www.opencyclemap.org/">OpenCycleMap</a>'
              }),
              ol.source.OSM.ATTRIBUTION
            ],
            url: 'http://{a-c}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png'
          })
        });
      }

      if(obj.layerType == 'osm'){
        return new ol.layer.Tile({
          title : obj.title || 'OpenStreetMap',
          type : "base",
          source: new ol.source.OSM(obj.layerOptions)
        })
      }


      var cartoDBNames = {
        'positron' : 'light_all',
        'positron-no-labels' : 'light_nolabels',
        'dark-matter' : 'dark_all',
        'dark-matter-no-labels' : 'dark_nolabels',
      }
      if(obj.layerType == 'cartodb'){
        var l = cartoDBNames[obj.layerOptions.layer];
        var opts = _.extend(
            baseTileOptions,
            {
              title : obj.title || 'CartoDB ' + obj.layerOptions.layer,
              type : "base",
              source: new ol.source.XYZ({
                urls : [
                    'http://a.basemaps.cartocdn.com/'+l+'/{z}/{x}/{y}.png',
                    'http://a.basemaps.cartocdn.com/'+l+'/{z}/{x}/{y}.png',
                    'http://a.basemaps.cartocdn.com/'+l+'/{z}/{x}/{y}.png',
                    'http://a.basemaps.cartocdn.com/'+l+'/{z}/{x}/{y}.png'
                ],
                attributions : [new ol.Attribution({html:'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'})]
              }
            )
          });
          return new ol.layer.Tile(opts)

      }

      if(obj.layerType == 'geojson'){
        return new ol.layer.Vector({
          title : obj.title || obj.name,
          source: new ol.source.Vector({
            url: obj.layerOptions.url,
            format: new ol.format.GeoJSON()
          }),
            style : svc.getStyleFor(obj.name, map)
        });

      }
      return null;
    }

    return svc;


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
