(function(){
  "use strict";

  angular.module("HtmlMap")
  .controller('BodyCtrl', function($scope, $timeout, ConfigService, MapsControllerDelegate, OLFactory){
    ConfigService.configPromise.then(function(data){
        $scope.config = validateConfig(ConfigService.config);
        MapsControllerDelegate.waitForMap('main-map')
        .then($scope.startMap);
    });

    //#TODO: validate config
    var validateConfig = function(cfg){
      return cfg;
    };



    //#TODO: move to service

    $scope.startMap = function(){

      MapsControllerDelegate.applyMethod(function(){
        var that = this;
        var c, z, e;
        if($scope.config.map.centerProjection){
          c = ol.proj.transform($scope.config.map.center, $scope.config.map.centerProjection, 'EPSG:3857');
        } else {
          c = $scope.config.map.center
        }
        if($scope.config.map.extent && $scope.config.map.extentProjection){
          var transformer = ol.proj.getTransform($scope.config.map.extentProjection, 'EPSG:3857');
          e = ol.extent.applyTransform($scope.config.map.extent, transformer);
        } else if ($scope.config.map.extent) {
          e = $scope.config.map.extent;
        }

        z = $scope.config.map.zoom;

        this.setViewOptions({
          center : c,
          zoom : z,
          minZoom : $scope.config.map.minZoom,
          maxZoom : $scope.config.map.maxZoom,
          extent : e
        });
        

        $scope.resetMap = function(){
          that.setZoom(z);
          that.setCenter(c);
        };

        if($scope.config.map.extent){
          //this.map.getView().setProperties({"extent":$scope.config.map.extent});
          //this.map.getView().getProjection().setWorldExtent($scope.config.map.extent);
        }

        if($scope.config.map.layerSwitcher !== false){
          this.createLayerSwitcher(c);
        }

        angular.forEach($scope.config.layers, function(l){
          var layer = OLFactory.createLayer(l, that.map);
          if(l.templatePopup){
            layer.set('templatePopup', l.templatePopup)
          }
          if(layer){
            that.map.addLayer(layer);
          }
        });

      });


    }


  });

})();
