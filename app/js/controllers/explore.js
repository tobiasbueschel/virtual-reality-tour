/**********************************************************************************************************
 * EXPLORE CONTROLLER
 **********************************************************************************************************/
nibbl.controller('exploreCtrl', ['$state', '$scope', function($state, $scope){

    $scope.goTravel = function () {
        console.log("hello");
        $state.go('travel');
    }

}]);