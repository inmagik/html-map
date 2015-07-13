(function(){
  "use strict";

  angular.module("HtmlMap")
  .controller('BodyCtrl', function($scope, $timeout, ConfigService, MapsControllerDelegate, OLFactory, $location, repoConfig){

    $scope.data = { config : null };
    var s = $location.search();

    if (s.repo){
      ConfigService.getGitHubConfig(s.repo).then(function(data){
        $timeout(function(){
          $scope.data.config = {
              mapConfig : data[0],
              geoStyle : data[1]
          };
        });
      });

    } else {

      ConfigService.getLocalConfig().then(function(data){
        $timeout(function(){
          $scope.data.config = {
              mapConfig : data[0],
              geoStyle : data[1]
          };
        });
      });

    };

    $scope.resetMap = function(){
      MapsControllerDelegate.applyMethod(function(){
        this.resetMap()
      });
    };

  });

})();
