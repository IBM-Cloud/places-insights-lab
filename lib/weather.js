// Licensed under the Apache License. See footer for details.
var request = require('request');
var _ = require('lodash');

function Weather(url) {
  var self = this;

  var defaultOptions = {
    language: "en-US",
    units: "m"
  };

  self.currentByGeolocation = function (latitude, longitude, options, callback) {
    self._callByGeolocation("/api/weather/v2/observations/current", latitude, longitude, options, callback);
  }

  self.tendayByGeolocation = function (latitude, longitude, options, callback) {
    self._callByGeolocation("/api/weather/v2/forecast/daily/10day", latitude, longitude, options, callback);
  }

  self.hourlyByGeolocation = function (latitude, longitude, options, callback) {
    self._callByGeolocation("/api/weather/v2/forecast/hourly/24hour", latitude, longitude, options, callback);
  }

  self.timeseriesByGeolocation = function (latitude, longitude, options, callback) {
    self._callByGeolocation("/api/weather/v2/observations/timeseries", latitude, longitude, options, callback);
  }

  self._callByGeolocation = function (endPoint, latitude, longitude, options, callback) {
    options = _.merge({}, defaultOptions, options);

    callURL = url + endPoint +
      "?geocode=" + encodeURIComponent(latitude.toFixed(2) + "," + longitude.toFixed(2)) +
      "&language=" + options.language +
      "&units=" + options.units
    
    console.info("Calling", callURL);
    request.get(callURL, {
        json: true
      },
      function (error, response, body) {
        callback(error, body)
      });
  }
}

module.exports = function (url) {
  return new Weather(url);
}

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
