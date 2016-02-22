/**********************************************************************************************************
 * TRAVEL CONTROLLER
 **********************************************************************************************************/
nibbl.controller('travelCtrl', ['$state', '$scope', 'NgMap', '$timeout','routeService', function($state, $scope, NgMap, $timeout,routeService){

    var vm = this;
    vm.drivingMode = false; // indicates streetview should be on driving mode
    vm.drivingSpeed = 40; // 100 km per hour
    vm.driverMode = false;

    vm.origin = "1135 Karamea-Kohaihai Rd, Kahurangi National Park, Tasman";
    vm.destination = "Pier St, Jackson Bay, West Coast, New Zeland";

    var updateFrequency = 1*1000; // half a second
    var savedPath = null;  // position and count to restart from pause mode

    // Overview path between orign and destination.
    // This does NOT exactly follow the path of a road. It is used to draw path on the map.
    var overviewPath=[];
    var overviewPathIndex=0;  // current index points of overview path

    // Detailed path between overview path points
    // This does exactly follow the path of a road.
    var detailedPath=[];
    var detailedPathIndex=0;  // current index points of detailed path

    var directionsService = new google.maps.DirectionsService();

    //
    // At google's mercy, we get points to drive
    //
    var driveOverviewPaths = function() {
        var op1, op2;
        // drive detailed path because we have not drove through all
        if (detailedPath.length > detailedPathIndex) {
            driveDetailedPaths(); //SHOW TIME !!!!
        }
        // drove all detailed path, get a new detailed path from overview paths
        else {
            op1 = overviewPath[overviewPathIndex];
            op2 = overviewPath[overviewPathIndex+1];
            overviewPathIndex += 1;
            if (op1 && op2) {
                var request ={origin:op1, destination:op2, travelMode: 'DRIVING'};
                directionsService.route(request, function(response, status) {
                    if (status == google.maps.DirectionsStatus.OK) {
                        detailedPath = response.routes[0].overview_path;
                        console.log('Updated detailedPath for overviewpath between',
                            overviewPathIndex, 'and', overviewPathIndex+1,
                            'with', detailedPath.length, 'geo points');
                        detailedPathIndex = 0;
                        driveOverviewPaths();
                    }
                });
            }
        }
    };

    //
    // drive between two points by meter by meter and show it.
    //
    var driveDetailedPaths = function() {
        var meter = Math.floor(
            (parseInt(vm.drivingSpeed, 10) * 1000) / 3600  // how far we deive every second
            * (updateFrequency/1000));                         // how often do we see streetview
        var point1 = detailedPath[detailedPathIndex];
        var point2 = detailedPath[detailedPathIndex+1];

        if (point1 && point2) {
            //calculate where to look from two points
            var heading = google.maps.geometry.spherical.computeHeading(point1, point2);
            var distance = google.maps.geometry.spherical.computeDistanceBetween(point1, point2);
            var totalCount = parseInt(distance / meter, 10) || 1;

            var drive = function(count, position) {
                console.log(overviewPathIndex + '/' + overviewPath.length,
                    detailedPathIndex + '/' + detailedPath.length,
                    count + '/' + totalCount, 'distance', meter);
                if (totalCount >= count) {
                    $timeout( function() {
                        var pov = vm.map.getStreetView().getPov();
                        if (vm.driverMode) {
                            vm.map.setHeading(heading); // map heading is different from pov heading
                            pov.heading = heading;
                        }

                        vm.map.getStreetView().setPosition(position);
                        vm.map.getStreetView().setPov(pov);
                        vm.map.getStreetView().setVisible(true);

                        var distanceToPoint2 = google.maps.geometry.spherical.computeDistanceBetween(position, point2);
                        var nextPosition = distanceToPoint2 < meter ?
                            point2 : google.maps.geometry.spherical.computeOffset(position, meter, heading);
                        if (vm.drivingMode) {
                            drive(++count, nextPosition);
                        } else {
                            savedPath = {count: count, position: position};
                            return false;
                        }
                    }, updateFrequency);
                } else {
                    detailedPathIndex += 1;
                    driveOverviewPaths();
                }
            };

            var count = (savedPath && savedPath.count) || 1;
            var position = (savedPath && savedPath.position) || point1;
            savedPath = null; // once start driving, nullify savedPath
            drive(count, position);

        } else {
            detailedPathIndex += 1;
            driveOverviewPaths();
        }
    };

    vm.drive = function() {
        vm.drivingMode = !vm.drivingMode;
        if (vm.drivingMode) {
            vm.map.setZoom(16);
            if (savedPath) { // if continues
                driveDetailedPaths();
            } else {
                driveOverviewPaths();
            }
        }
    };

    vm.startVR = function () {
      routeService.setParamsAndGoVR(vm.origin,vm.destination, vm.drivingMode,  vm.drivingSpeed,vm.driverMode);
    }

    // When direction is changed
    // change overviewPath and reset driving directions
    vm.directionsChanged = function() {
        overviewPath = this.directions.routes[0].overview_path;
        console.log('direction is changed', 'got overviewPath with', overviewPath.length, 'points');
        vm.map.getStreetView().setPosition(overviewPath[0]);
        overviewPathIndex = 0; // set indexes to 0s
        detailedPathIndex = 0;
        vm.drivingMode = false;   // stop driving
        toContinue = null;     // reset continuing position
    };

    NgMap.getMap().then(function(map) {
        vm.map = map;
    });




}]);
