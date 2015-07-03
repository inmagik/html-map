(function(){
  "use strict";

  angular.module("HtmlMap")
  .directive('theMap', function(MapsControllerDelegate){
    return {
        restrict: 'EA',
        template: '<div>{{a}}</div>',
        scope: true,
        //link: linkFunc,
        controller: function($scope, $element, $attrs){
          var handle = MapsControllerDelegate.registerMap(this, $attrs.mapHandle);

          $attrs.$set('mapHandle', handle);

          this.map = new ol.Map({
            layers: [],
            target: $element[0],
            view: new ol.View({

            })
          });

          //shortcut methods
          this.setCenter = function(center){ return this.map.getView().setCenter(center)};
          this.setZoom = function(zoom){ return this.map.getView().setZoom(zoom)};

          console.log(this)


          $scope.$emit('map-ready-'+handle);

        },
        link: function(scope, element, attrs) {
          scope.$on('$destroy', function() {
            MapsControllerDelegate.unregisterMap(this, $attrs.mapHandle);
          });
        }
        //controllerAs: 'vm',
        //bindToController: true // because the scope is isolated
    };

  });

})();
