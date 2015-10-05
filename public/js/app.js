// Licensed under the Apache License. See footer for details.
var wtServices = angular.module('wtServices', []);
wtServices
  .service('PlacesService', ['$http', '$q', function ($http, $q) {
    return {
      load: function () {
        var deferred = $q.defer();
        $http.get("/api/1/places.json")
          .success(function (data) {
            deferred.resolve(data);
          })
          .error(function () {
            deferred.reject();
          });
        return deferred.promise;
      }
    };
  }])
  .service('WeatherService', ['$http', '$q', function ($http, $q) {
    return {
      // Retrieve current weather
      current: function (latitude, longitude) {
        // Comment the next line and uncomment the following block to retrieve data from the backend
        return $q.when({});
        /*
        var deferred = $q.defer();
        $http.get("/api/1/current.json?lat=" + encodeURIComponent(latitude) + "&lon=" + encodeURIComponent(longitude))
          .success(function (data) {
            deferred.resolve(data);
          })
          .error(function () {
            deferred.reject();
          });
        return deferred.promise;
        */
      },
      // Retrieve 10 day forecast
      forecast: function (latitude, longitude) {
        // Comment the next line and uncomment the following block to retrieve data from the backend
        return $q.when({});
        /*
        var deferred = $q.defer();
        $http.get("/api/1/forecast.json?lat=" + encodeURIComponent(latitude) + "&lon=" + encodeURIComponent(longitude))
          .success(function (data) {
            deferred.resolve(data);
          })
          .error(function () {
            deferred.reject();
          });
        return deferred.promise;
        */
      }
    };
  }])
  .service('TwitterService', ['$http', '$q', function ($http, $q) {
    return {
      // Retrieve tweets for location
      tweets: function (query) {
        // Comment the next line and uncomment the following block to retrieve data from the backend
        return $q.when([]);
        /*
        var deferred = $q.defer();
        $http.get("/api/1/tweets.json?query=" + encodeURIComponent(query))
          .success(function (data) {
            deferred.resolve(data);
          })
          .error(function () {
            deferred.reject();
          });
        return deferred.promise;
        */
      }
    };
  }]);

var wtControllers = angular.module('wtControllers', []);

wtControllers.filter('formatTemperature', [
  function() {
    return function(input, scale) {
      // input is assumed in Fahrenheit
      if (scale == 'C') {
        return Math.round((input - 32) * 5.0 / 9.0);;
      } else {
        return input;
      }
    }
  }
]);

wtControllers
  .controller('MainController', ['$scope', 'PlacesService', 'WeatherService', 'TwitterService',
  function ($scope, PlacesService, WeatherService, TwitterService) {
      $scope.data = {
        places: [],
        selectedPlace: {},
        current: {},
        forecast: {},
        tweets: [],
        selectedTweet: {},
        temperatureMode: 'F'
      };

      PlacesService.load().then(function (places) {
        $scope.data.places = places;
        if (places.length > 0) {
          $scope.updateInsights(places[0]);
        }
      });

      $scope.setTemperatureMode = function(mode) {
        $scope.data.temperatureMode = mode;
      }
      
      $scope.updateInsights = function (place) {
        console.info("Retrieving insights for", place);

        $scope.data.selectedPlace = place;
        $scope.data.currentWeather = {};
        $scope.data.weatherForecast = {};
        $scope.data.tweets = [];
        $("#selected-tweet").text("");

        $("#loading-weather-current").show();
        $("#loading-weather-forecast").show();
        $("#loading-twitter").show();
        
        WeatherService.current(place.lat, place.lon).then(function (current) {
          console.log("Current", current);
          $("#loading-weather-current").hide();
          $scope.data.currentWeather = current;
        });
        WeatherService.forecast(place.lat, place.lon).then(function (forecast) {
          console.log("Forecast", forecast);
          $("#loading-weather-forecast").hide();
          $scope.data.weatherForecast = forecast;
        });
        TwitterService.tweets(place.name).then(function (tweets) {
          console.log("Tweets", tweets);
          $scope.data.tweets = tweets;
          $("#loading-twitter").hide();
        });
      };

      $scope.selectTweet = function (tweet) {
        $scope.data.selectedTweet = tweet;

        $("#selected-tweet").text("");

        // Extract tweet id from the message id looking like:
        // "id": "tag:search.twitter.com,2005:597277951177003009",
        var tweetId = tweet.message.id.substring(tweet.message.id.lastIndexOf(':') + 1);
        console.info("Displaying tweet with id", tweetId);

        twttr.widgets.createTweet(
            tweetId,
            document.getElementById('selected-tweet'), {
              align: 'center'
            })
          .then(function (el) {});
      };
  }]);

var app = angular.module('wtApp', ['jsonFormatter', 'wtControllers', 'wtServices' ]);

//------------------------------------------------------------------------------
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//------------------------------------------------------------------------------
