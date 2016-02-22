'use strict';
(function($) {
    angular
            .module('angularFarbtasticDemo', [
                'farbtastic'
            ])
            .controller('FarbtasticCtrl', ['$scope', function($scope) {
                $scope.color = '#666666';
            }]);
}(jQuery));