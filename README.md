# Västtrafik next ride service

A simple web service for getting the next ride from http://www.vasttrafik.se

The intent of this app is to generate plain text results for the next bus/tram
ride for use in [Tasker](http://tasker.dinglisch.net/).

## Install and run

1. `npm install`
2. Create `config.js` using the template in
   [config.example.js](config.example.js)
3. `node app.js`

## Example usage

* Searching for stations: `curl http://localhost:3000/search/brunnsparken`

