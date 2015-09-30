// Licensed under the Apache License. See footer for details.
var
  request = require('request'),
  _ = require('lodash');

function Weather(apiUrl, apiKey) {
  var self = this;

  var defaultOptions = {
    language: "en-US",
    units: "m"
  };

  self.autocomplete = function (query, callback) {
    request.get(
      "http://autocomplete.wunderground.com/aq?query=" + encodeURIComponent(query), {
        json: true
      },
      function (error, response, body) {
        // keep only the cities in the results
        if (body && body.RESULTS) {
          _.remove(body.RESULTS, function (item) {
            return item.type != 'city'
          });
        }
        callback(error, body);
      });
  }

  self.currentByQuery = function (text, options, callback) {
    self.autocomplete(text, function (error, body) {
      if (error) {
        callback(error, null)
      } else if (body.RESULTS && body.RESULTS[0]) {
        self.currentByGeolocation(body.RESULTS[0].lat, body.RESULTS[0].lon, options, callback)
      } else {
        callback("no result", null);
      }
    });
  }

  self.currentByGeolocation = function (latitude, longitude, options, callback) {
    self._callByGeolocation("/observations/current.json", latitude, longitude, options, callback);
  }

  self.tendayByQuery = function (text, options, callback) {
    self.autocomplete(text, function (error, body) {
      if (error) {
        callback(error, null)
      } else if (body.RESULTS && body.RESULTS[0]) {
        self.tendayByGeolocation(body.RESULTS[0].lat, body.RESULTS[0].lon, options, callback)
      } else {
        callback("no result", null);
      }
    });
  }

  self.tendayByGeolocation = function (latitude, longitude, options, callback) {
    self._callByGeolocation("/forecast/daily/10day.json", latitude, longitude, options, callback);
  }

  self._callByGeolocation = function (method, latitude, longitude, options, callback) {
    options = _.merge({}, defaultOptions, options);

    callURL =
      apiUrl + "/geocode/" + encodeURIComponent(latitude) + "/" + encodeURIComponent(longitude) +
      method + "?apiKey=" + apiKey + "&language=" + options.language + "&units=" + options.units
    request.get(callURL, {
        json: true
      },
      function (error, response, body) {
        callback(error, body)
      });
  }

}

module.exports = function (apiUrl, apiKey) {
  return new Weather(apiUrl, apiKey);
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
