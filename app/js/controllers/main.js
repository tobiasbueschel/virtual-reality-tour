/**********************************************************************************************************
 * MAIN CONTROLLER
 * Manages common functions.
 **********************************************************************************************************/

nibbl.controller('mainCtrl', ['FIREBASE_URL', '$timeout', '$state', '$scope', 'growlService', '$firebaseArray', '$rootScope', '$sce',
        function(FIREBASE_URL, $timeout, $state, $scope, growlService, $firebaseArray, $rootScope, $sce){

        /**
         * Detects mobile browser
         */
        if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
           angular.element('html').addClass('ismobile');

        growlService.growl('You are on a mobile device', 'success' );

        }

        /**
         * Sets skin of the header to blue
         */
        this.currentSkin = 'blue';

        /**
         * Converts html into trusted html in order to display it safely in the browser
         * @source http://stackoverflow.com/questions/19415394/with-ng-bind-html-unsafe-removed-how-do-i-inject-html
         * @param html_code
         * @returns {*}
         */
        $scope.to_trusted = function(html_code) {
            return $sce.trustAsHtml(html_code);
        };

}]);


