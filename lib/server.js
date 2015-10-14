// Licensed under the Apache License. See footer for details.
var hapi = require('hapi');
var Path = require('path');
var Inert = require('inert');
var cfenv = require('cfenv');
var moment = require('moment');

// load local VCAP configuration
var vcapLocal = null
try {
  vcapLocal = require("../vcap-local.json");
  console.log("Loaded local VCAP", vcapLocal);
} catch (e) {
  console.error(e);
}

// get the app environment from Cloud Foundry, defaulting to local VCAP
var appEnvOpts = vcapLocal ? {
  vcap: vcapLocal
} : {}
var appEnv = cfenv.getAppEnv(appEnvOpts);

// initialize Weather and Twitter services
var weather = getWeatherService(appEnv);
var twitter = getTwitterService(appEnv);

var server = new hapi.Server();
server.connection({
  host: appEnv.bind,
  port: appEnv.port
});
server.register(Inert, function(){});

// API Definition
server.route({
  method: "GET",
  path: "/api/1/current.json", //?lat={lat}&lon={lon}",
  handler: api_weatherCurrent
});

server.route({
  method: "GET",
  path: "/api/1/forecast.json", //?lat={lat}&lon={lon}",
  handler: api_weatherForecast
});

server.route({
  method: "GET",
  path: "/api/1/tweets.json", //?query={query}",
  handler: api_tweets
});

// places is a static list
server.route({
  method: "GET",
  path: "/api/1/places.json",
  handler: {
    file: Path.normalize(__dirname + "/places.json")
  }
});

// serve all other assets (html, css, js, images)
server.route({
  method: "GET",
  path: "/{param*}",
  handler: {
    directory: {
      path: Path.normalize(__dirname + '/../public')
    }
  }
})

// API Implementation
function api_weatherCurrent(request, reply) {  
  var lat = parseFloat(request.query.lat)
  var lon = parseFloat(request.query.lon)
  console.info("Current weather for", lat, lon);

  weather.currentByGeolocation(lat, lon, {}, function(error, body) {
    reply(error, body);
  });
}

function api_weatherForecast(request, reply) {
  var lat = parseFloat(request.query.lat)
  var lon = parseFloat(request.query.lon)
  console.info("Weather forecast for", lat, lon);
  
  weather.tendayByGeolocation(lat, lon, {}, function(error, body) {
    reply(error, body);
  });
}

function api_tweets(request, reply) {
  var query = request.query.query
  console.info("Tweets for", query);
  
  // we limit the search to at most 10 tweets in the last months
  var fewDaysAgo = moment().subtract(6, "months").format("YYYY-MM-DD");
  twitter.search(query + " AND posted:" + fewDaysAgo, 10, function(error, body) {
    reply(error, body.tweets);
  });
}

console.log("server starting on: " + appEnv.url)
server.start(function () {
  console.log("server started  on: " + appEnv.url)
});

function getWeatherService(appEnv) {
  // retrieve the credentials the Weather service by name
  var weatherCreds = appEnv.getServiceCreds("places-weatherinsights");
  if (!weatherCreds) {
    console.error("No Weather service named 'places-weatherinsights' found");
    return;
  }

  return require('./weather.js')(weatherCreds.url);
}

function getTwitterService(appEnv) {
  // retrieve the credentials the Twitter service by name
  var twitterCreds = appEnv.getServiceCreds("places-twitterinsights");
  if (!twitterCreds) {
    console.error("No Twitter service named 'places-twitterinsights' found");
    return;
  }

  return require('./twitter.js')(twitterCreds.url);
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
