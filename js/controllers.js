(function(){
  "use strict";

  angular.module("HtmlMap")
  .controller('BodyCtrl', function($scope, $timeout, ConfigService, MapsControllerDelegate){
    ConfigService.configPromise.then(function(data){
        $scope.config = validateConfig(ConfigService.config);
        MapsControllerDelegate.waitForMap('main-map')
        .then($scope.startMap);
    });

    //#TODO: validate config
    var validateConfig = function(cfg){
      return cfg;
    };

    var getStyleFor = function(name){
      return ConfigService.getStyleFor(name) || undefined;
      //return undefined;
    }


    //#TODO: move to service
    var getLayer = function(obj){
      if(obj.layerType == 'stamen'){
        return new ol.layer.Tile({
          source: new ol.source.Stamen(obj.layerOptions)
        })
      }

      if(obj.layerType == 'geojson'){
        return new ol.layer.Vector({
          source: new ol.source.Vector({
            url: obj.layerOptions.url,
            format: new ol.format.GeoJSON()
          }),
          style : getStyleFor(obj.name)
        });

      }
      return null;
    }

    $scope.startMap = function(){

      MapsControllerDelegate.applyMethod(function(){
        var that = this;
        var c, z;
        if($scope.config.map.centerProjection){
          c = ol.proj.transform($scope.config.map.center, $scope.config.map.centerProjection, 'EPSG:3857');
        } else {
          c = $scope.config.map.center
        }
        this.setCenter(c);

        z = $scope.config.map.zoom;
        this.setZoom(z);

        angular.forEach($scope.config.layers, function(l){
          var layer = getLayer(l);
          if(layer){
            that.map.addLayer(layer);
          }
        });

      });


    }


  });

})();
