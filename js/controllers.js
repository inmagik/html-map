(function(){
  "use strict";

  angular.module("HtmlMap")
  .controller('BodyCtrl', function($scope, $timeout, ConfigService){
    ConfigService.configPromise.then(function(data){
          $scope.config = data;
    });


  });

})();
