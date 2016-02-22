/**********************************************************************************************************
 * VR CONTROLLER
 **********************************************************************************************************/
nibbl.controller('vrCtrl', ['$state', '$scope', 'NgMap', '$timeout','routeService', function($state, $scope, NgMap, $timeout, routeService){
  $scope.vm = routeService.vm;
  routeService.getMaps();

  $scope.pov = {
  	heading: 0,
  	pitch: 0
  };


    if (window.DeviceOrientationEvent) {
        window.addEventListener("deviceorientation", function (event) {
            //tilt([event.beta, event.gamma]); //alpha z axis, beta x axis, gamma y axis
            console.log(event.alpha + " " + event.beta);

            var pitch = -event.gamma + (event.gamma < 0 ? -90 : 90);//-(event.gamma/2) ;

            var heading = event.alpha*(event.gamma < 0 ? -1 : 1) + (event.gamma < 0 ? -90 : 90);

            if (pitch > 0 && event.gamma > 180)
                var heading = -event.alpha - 270;

            if (pitch > 0 && event.gamma <= 180)
                var heading = -event.alpha + 90;

            var neg = (isSafari ? -1 : 1);

            //Currently for both views.
            $scope.pov = {
            	heading: heading,
            	pitch: pitch
            };

            console.log("Device orientation supported");
        }, true);
    } else {

        console.log("Device orientation not supported");
    }

    function calculateHeadingOffset(heading) {
        var addOn;
        var offset = 0.04;
        console.log(heading);
        if (heading >= 0) {
            addOn = -heading * offset;
        } else {
            addOn = +heading * offset;
        }
        return addOn;
    }

}]);
