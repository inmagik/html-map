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
        var c, z;
        if($scope.config.map.centerProjection){
          c = ol.proj.transform($scope.config.map.center, $scope.config.map.centerProjection, 'EPSG:3857');
        } else {
          c = $scope.config.map.center
        }
        this.setCenter(c);

        z = $scope.config.map.zoom;
        this.setZoom(z);


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
