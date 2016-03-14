# NIBBL VR TOUR
Welcome to the first application that allows you to travel in Virtual Reality using [Google Cardboard](https://www.google.com/get/cardboard/).
This app has been developed during the [2016 Static Showdown](https://2016.staticshowdown.com/) Hackathon by [Firebase](https://www.firebase.com/).

The idea behind the app is simple. Virtual reality is becoming more accessible and popular among consumers and the developer community is growing daily. However, we realized that Google's popular Cardboard does **not yet** provide developers with an option to easily develop web apps using a JavaScript SDK and subsequently deploying them to mobile devices using [PhoneGap](http://phonegap.com/). Thus, we wanted to create an application that showcases the possibility of creating such a virtual reality application in a browser. One that works seamlessly on different devices and could be deployed as a native apps using frameworks such as PhoneGap/Cordova. The result is a simple app that allows you to travel your favorite routes and explore new cities in virtual reality.

Try out the [demo :computer:](https://vrtour.firebaseapp.com/)


#### VR Travel :round_pushpin:
*Ever dreamed about driving down Route 66 or do you just need to drive somewhere and want to familiarize yourself with the route? VR Travel lets you choose where you want to go*

![screenshot](https://github.com/staticshowdown/ss16-nibbl/blob/master/app/img/travel.png)

#### VR Explore :earth_americas:
*Go on a virtual reality tour through your favorite cities or explore new destinations that you never had the chance to visit. These are our recommended tours that provide an immersive and rich experience. During your tour you will stumble upon `points of interests` that allow you to learn more about the places that you visit.*

![screenshot](https://github.com/staticshowdown/ss16-nibbl/blob/master/app/img/explore.png)



### Installation Instructions
*If you are new to GitHub, you can find a quick tutorial [here](http://readwrite.com/2013/09/30/understanding-github-a-journey-for-beginners-part-1).*

###### (1) Download repository & open it
```
$ git clone https://github.com/tobiasbueschel/virtual-reality-tour
$ cd virtual-reality-tour
```

###### (2) Install node modules
```
$ npm install
```

###### (3) Install bower components
```
cd vendors
$ bower install
```

###### (4) Running the application and making changes
The project uses the JavaScript Task Runner [Grunt](http://gruntjs.com/). The following commands will be usefull:

+ `grunt` runs the default task & starts a localhost
+ `grunt ngtemplates` _refreshes the template html file_


###Contributing
Feel free to send us a pull request. If you find any bugs please report it on the [issue page](https://github.com/tobiasbueschel/virtual-reality-tour/issues).

###Team
[![Tobias Büschel](https://avatars1.githubusercontent.com/u/13087421?v=3&s=460)](https://github.com/tobiasbueschel) | [![Jia Shern](https://avatars3.githubusercontent.com/u/7147813?v=3&s=460)](https://github.com/saffront) | [![Kimeshan Naidoo](https://avatars1.githubusercontent.com/u/8416897?v=3&s=460)](https://github.com/kimeshan) | [![Ed Mothershaw](https://avatars2.githubusercontent.com/u/15124498?v=3&s=460)](https://github.com/edmothershaw)
---|---|---|---
[Tobias Büschel](https://github.com/tobiasbueschel) | [Jia Shern](https://github.com/saffront) | [Kimeshan Naidoo](https://github.com/kimeshan) | [Ed Mothershaw](https://github.com/edmothershaw)


###References & Technology used 
+ [AngularJS](https://angularjs.org/)
+ [Material Design Template](http://byrushan.com/projects/ma/1-5-2/)
+ [ng-map](http://ngmap.github.io/#/!street-view_road_trip.html)
+ [Bower](http://bower.io/)
+ [NodeJS](https://nodejs.org/en/)
+ [Grunt](http://gruntjs.com/)
+ [Unsplash](http://unsplash.com/)


###License
See the [MIT license](https://github.com/staticshowdown/ss16-nibbl/edit/master/LICENSE).
