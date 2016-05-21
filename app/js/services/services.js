nibbl


    //==============================================
    // ROUTE SERVICE
    //==============================================
    //service for sharing route/driving/direction data to enter VR mode
    .service('routeService', function (NgMap, $timeout,$state) {
      var serviceScope = this;
      serviceScope.vm = {};



      serviceScope.vm.drivingMode = false; // indicates streetview should be on driving mode
      serviceScope.vm.drivingSpeed = 10; // 100 km per hour
      serviceScope.vm.driverMode = true;

      serviceScope.vm.origin = "37.422800, -122.083794";
      serviceScope.vm.destination = "Stanford University";

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

      //getters and setters for origins and destinations
      serviceScope.setParamsAndGoVR = function (origin,destination,drivingMode,speed,driverMode) {
        serviceScope.vm.origin = origin;
        serviceScope.vm.destination = destination;
        serviceScope.vm.drivingMode = drivingMode; // indicates streetview should be on driving mode
        serviceScope.vm.drivingSpeed = speed; // 100 km per hour
        serviceScope.vm.driverMode = driverMode;
        $state.go('vr');
      };


      serviceScope.getMaps = function () {
        NgMap.getMap({id:'leftMap'}).then(function(map) {
          serviceScope.vm.map = map;
          serviceScope.vm.map.getStreetView().setVisible(true);

        });

        NgMap.getMap({id:'rightMap'}).then(function(map) {
          serviceScope.vm.map2 = map;
          map.getStreetView().setVisible(true);
        });
         serviceScope.vm.drive();
      };


      //
      // At google's mercy, we get points to drive
      //
      var driveOverviewPaths = function() {
        console.log("Driving overview path...");
          var op1, op2;
          // drive detailed path because we have not drove through all
          console.log("detailed path: ",detailedPath.length);
          if (detailedPath.length > detailedPathIndex) {
              driveDetailedPaths(); //SHOW TIME !!!!
          }
          // drove all detailed path, get a new detailed path from overview paths
          else {
              op1 = overviewPath[overviewPathIndex];
              op2 = overviewPath[overviewPathIndex+1];
              overviewPathIndex += 1;
              console.log("Op1 and Op2",op1,op2);
              if (true || (op1 && op2)) {
                  //var request ={origin:op1, destination:op2, travelMode: 'DRIVING'};
                  var request ={origin:serviceScope.vm.origin, destination:serviceScope.vm.destination, travelMode: 'DRIVING'};
                  directionsService.route(request, function(response, status) {
                      if (status == google.maps.DirectionsStatus.OK) {
                        //Get Gyroscope x,y,z
                        if (window.DeviceOrientationEvent) {
                            window.addEventListener("deviceorientation", function (event) {
                                //tilt([event.beta, event.gamma]); //alpha z axis, beta x axis, gamma y axis
                                var pitch = -event.gamma + (event.gamma < 0 ? -90 : 90);//-(event.gamma/2) ;
                                var heading = event.alpha*(event.gamma < 0 ? -1 : 1) + (event.gamma < 0 ? -90 : 90);

                                if (pitch > 0 && event.gamma > 180)
                                    var heading = -event.alpha - 270;

                                if (pitch > 0 && event.gamma <= 180)
                                    var heading = -event.alpha + 90;

                                var neg = (isSafari ? -1 : 1);

                                changePov(heading, pitch);
                                changePov(heading + calculateHeadingOffset(heading), pitch);
                                console.log("Device orientation supported");
                            }, true);
                        } else {

                            console.log("Device orientation not supported");
                        }


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

      //calculate heading offset for VR
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


      //change POV based on device orientation
      function changePOV (heading, pitch) {
          //set heading
          serviceScope.vm.map.setHeading(heading); // map heading is different from pov heading
          //set heading for left map
          serviceScope.vm.map2.setHeading(heading+offset);
          //set pov
          var pov = {heading:heading,pitch:pitch};
          var pov2 = {heading:heading+offset,pitch:pitch};
          //set left map position & pov
          serviceScope.vm.map.getStreetView().setPov(pov);
          //set right map position & pov
          serviceScope.vm.map2.getStreetView().setPov(pov2);
      }

      //
      // drive between two points by meter by meter and show it.
      //

      var driveDetailedPaths = function() {
          var meter = Math.floor(
              (parseInt(serviceScope.vm.drivingSpeed, 10) * 1000) / 3600  // how far we drive every second
              * (updateFrequency/1000));                         // how often do we see streetview
          var point1 = detailedPath[detailedPathIndex];
          var point2 = detailedPath[detailedPathIndex+1];

          if (point1 && point2) {
              //calculate where to look from two points
              var heading = google.maps.geometry.spherical.computeHeading(point1, point2);
              var offset = calculateHeadingOffset(heading);
              var distance = google.maps.geometry.spherical.computeDistanceBetween(point1, point2);
              var totalCount = parseInt(distance / meter, 10) || 1;

              var drive = function(count, position) {
                  console.log(overviewPathIndex + '/' + overviewPath.length,
                      detailedPathIndex + '/' + detailedPath.length,
                      count + '/' + totalCount, 'distance', meter);
                  if (totalCount >= count) {
                      $timeout( function() {
                          //pov for left map
                          var pov = serviceScope.vm.map.getStreetView().getPov();
                          var pov2 = serviceScope.vm.map.getStreetView().getPov();
                          if (serviceScope.vm.driverMode) {
                              //set heading for left map
                              serviceScope.vm.map.setHeading(heading); // map heading is different from pov heading
                              //set heading for left map
                              serviceScope.vm.map2.setHeading(heading+offset);
                              pov.heading = heading;
                              pov2.heading = heading+offset;

                          }
                          //set left map position & pov
                          serviceScope.vm.map.getStreetView().setPosition(position);
                          serviceScope.vm.map.getStreetView().setPov(pov);
                          serviceScope.vm.map.getStreetView().setVisible(true);

                          //set right map position & pov
                          serviceScope.vm.map2.getStreetView().setPosition(position);
                          serviceScope.vm.map2.getStreetView().setPov(pov2);
                          serviceScope.vm.map2.getStreetView().setVisible(true);

                          var distanceToPoint2 = google.maps.geometry.spherical.computeDistanceBetween(position, point2);
                          var nextPosition = distanceToPoint2 < meter ?
                              point2 : google.maps.geometry.spherical.computeOffset(position, meter, heading);
                          if (serviceScope.vm.drivingMode) {
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

      serviceScope.vm.drive = function() {
          serviceScope.vm.drivingMode = !serviceScope.vm.drivingMode;
          if (serviceScope.vm.drivingMode) {
              //serviceScope.vm.map.setZoom(16);
              if (savedPath) { // if continues
                  driveDetailedPaths();
              } else {
                  driveOverviewPaths();
              }
          }
      };

      // When direction is changed
      // change overviewPath and reset driving directions
      serviceScope.vm.directionsChanged = function() {
          overviewPath = this.directions.routes[0].overview_path;
          console.log('direction is changed', 'got overviewPath with', overviewPath.length, 'points');
          serviceScope.vm.map.getStreetView().setPosition(overviewPath[0]);
          overviewPathIndex = 0; // set indexes to 0s
          detailedPathIndex = 0;
          serviceScope.vm.drivingMode = false;   // stop driving
          toContinue = null;     // reset continuing position
      };

    })


    // =========================================================================
    // Malihu Scroll - Custom Scroll bars
    // =========================================================================
    .service('scrollService', function() {
        var ss = {};
        ss.malihuScroll = function scrollBar(selector, theme, mousewheelaxis) {
            $(selector).mCustomScrollbar({
                theme: theme,
                scrollInertia: 100,
                axis:'yx',
                mouseWheel: {
                    enable: true,
                    axis: mousewheelaxis,
                    preventDefault: true
                }
            });
        };

        return ss;
    })


    //==============================================
    // BOOTSTRAP GROWL
    //==============================================

    .service('growlService', function(){
        var gs = {};
        gs.growl = function(message, type, offX, offY) {

            if ( offX === undefined && offY === undefined ){
                offX = 20;
                offY = 85;
            }

            $.growl({
                message: message
            },{
                type: type,
                allow_dismiss: false,
                label: 'Cancel',
                className: 'btn-xs btn-inverse',
                placement: {
                    from: 'top',
                    align: 'right'
                },
                delay: 2500,
                animate: {
                        enter: 'animated bounceIn',
                        exit: 'animated bounceOut'
                },
                offset: {
                    x: offX,
                    y: offY
                }
            });
        };

        return gs;
    });
