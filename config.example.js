// Configuration file for the app
var config = {}

// Listening port for the app
config.port = process.env.PORT || 3000

// Vasttrafik API specific configuration
config.vasttrafik = {}
// API key
config.vasttrafik.apiKey = YOUR_KEY_HERE

// Output formats
config.formats = {}
config.formats.searchLocation = "{id} {name}\n"
config.formats.nextRide = "{name} leaves in {minutes} minutes.\n"

module.exports = config
