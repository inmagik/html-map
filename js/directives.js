(function(){
  "use strict";

  angular.module("HtmlMap")
  .directive('theMap', function(MapsControllerDelegate, $http, $compile, $timeout){
    return {
        restrict: 'EA',
        template: '<div>{{a}}</div>',
        scope: true,
        //link: linkFunc,
        controller: function($scope, $element, $attrs){

          var that = this;
          var handle = MapsControllerDelegate.registerMap(this, $attrs.mapHandle);

          $attrs.$set('mapHandle', handle);

          this.map = new ol.Map({
            layers: [],
            //interactions : [new ol.interaction.Select()],
            target: $element[0],
            view: new ol.View({

            })
          });

          this.map.addInteraction(new ol.interaction.Select());

          this.createLayerSwitcher = function(){
            this.layerSwitcher = new ol.control.LayerSwitcher({
              //tipLabel: 'Légende' // Optional label for button
            });
            this.map.addControl(this.layerSwitcher);
          }

          // Create a popup overlay which will be used to display feature info
          this.popup = new ol.Overlay.Popup();
          this.map.addOverlay(this.popup);

          // Add an event handler for the map "singleclick" event
          this.map.on('click', function(evt) {
            console.log(evt)
              // Hide existing popup and reset it's offset
              that.popup.hide();
              that.popup.setOffset([0, 0]);

              // Attempt to find a feature in one of the visible vector layers
              var featureAndLayer = that.map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
                  var template = layer.get('templatePopup');
                  if(template){
                      return [feature, layer];
                  }
                  return [null, null]
              });

              if (featureAndLayer) {
                  var feature = featureAndLayer[0];
                  var layer = featureAndLayer[1];
                  var coord= evt.coordinate;
                  var props = feature.getProperties();

                  $http.get(layer.get('templatePopup'))
                  .then(function(resp){

                    var s = $scope.$new(true);
                    s.data = { coord :coord, props:props};
                    $timeout(function(){

                      var info = resp.data;
                      // Offset the popup so it points at the middle of the marker not the tip
                      that.popup.setOffset([0, 0]);
                      that.popup.show(coord, info);
                      var cmpl = $compile(that.popup.container);
                      cmpl(s);
                    })
                  });


              }

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
