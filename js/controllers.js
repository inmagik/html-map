(function(){
  "use strict";

  angular.module("HtmlMap")
  .controller('BodyCtrl', function($scope, $timeout, ConfigService, MapsControllerDelegate, ModalService, $location){

    $scope.data = { config : null };
    $scope.meta = {};
    var s = $location.search();

    if (s.repo){
      ConfigService.getGitHubConfig(s.repo).then(function(data){
        $timeout(function(){
          $scope.data.config = {
              mapConfig : data[0],
              geoStyle : data[1]
          };
          initMeta();
        });
      });

    } else {

      ConfigService.getLocalConfig().then(function(data){
        $timeout(function(){
          $scope.data.config = {
              mapConfig : data[0],
              geoStyle : data[1]
          };
          initMeta();
        });
      });

    };

    $scope.resetMap = function(){
      MapsControllerDelegate.applyMethod(function(){
        this.resetMap()
      });
    };


    var initMeta = function(){
      var cfg = $scope.data.config.mapConfig;
      $scope.meta.title = cfg.title;
      var meta = cfg.meta || {};
      if(meta.description){
        $scope.meta.description = meta.description;
        if(meta.openDescription){
          $scope.showMapDescription()
        }
      }
      if(meta.descriptionUrl){
        $http.get(meta.descriptionUrl)
        .then(function(resp){
            $scope.meta.description = resp.data;
            if(meta.openDescription){
              $scope.showMapDescription()
            }
        })
      }

    }

    $scope.showMapDescription = function(){
      console.log($scope.meta.description);
      $scope.showAModal();
    };

    $scope.showAModal = function() {

    // Just provide a template url, a controller and call 'showModal'.
      ModalService.showModal({
        templateUrl: "templates/description.html",
        controller: "ModalController",
        inputs : {
          description : $scope.meta.description,
          title : $scope.meta.title
        }
      }).then(function(modal) {
        // The modal object has the element built, if this is a bootstrap modal
        // you can call 'modal' to show it, if it's a custom modal just show or hide
        // it as you need to.
        modal.element.modal({backdrop:false});
        modal.close.then(function(result) {
          $scope.message = result ? "You said Yes" : "You said No";
        });
      });

    };

  })

  .controller('ModalController', function($scope, close, description, title) {
    $scope.description = description;
    $scope.title = title;
   $scope.dismissModal = function(result) {
      close(result, 200); // close, but give 200ms for bootstrap to animate
   };

  });

})();
