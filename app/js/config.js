/*************************************************************************
 * Config.js defines all routes for the application.
 * It uses $stateProvider and $urlRouterProvider injections
 * @NOTE some routes are handled on the $scope level of the controller
 * --> these use ng-if directives to hide or show elements
 ************************************************************************/

nibbl.config(function ($stateProvider, $urlRouterProvider){
        $urlRouterProvider.otherwise("/travel");

        $stateProvider

            //------------------------------
            // ROOT
            //------------------------------
            .state ('root', {
                templateUrl: 'views/common.html'
            })

            //------------------------------
            // TRAVEL
            //------------------------------
            .state ('travel', {
                url: '/travel',
                parent: 'root',
                templateUrl: 'views/travel.html',
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'css',
                                insertBefore: '#app-level',
                                files: [
                                    'vendors/bower_components/nouislider/jquery.nouislider.css',
                                    'vendors/bower_components/chosen/chosen.min.css'
                                ]
                            },
                            {
                                name: 'vendors',
                                files: [
                                    'vendors/bower_components/nouislider/jquery.nouislider.min.js',
                                    'vendors/bower_components/chosen/chosen.jquery.js'
                                ]
                            }
                        ])
                    }
                }
            })

            //------------------------------
            // EXPLORE
            //------------------------------
            .state ('explore', {
                url: '/explore',
                parent: 'root',
                templateUrl: 'views/explore.html'
            })

            //------------------------------
            // VR MODE
            //------------------------------
            .state ('vr', {
                url: '/vr',
                templateUrl: 'views/vr.html'
            })

});
