/**********************************************************************************************************
 * VR CONTROLLER
 **********************************************************************************************************/
nibbl.controller('vrCtrl', ['$state', '$scope', 'NgMap', '$timeout','routeService', function($state, $scope, NgMap, $timeout, routeService){
  $scope.vm = routeService.vm;
  routeService.getMaps();
}]);
