var config = require("./config.js"),
    express = require("express"),
    https = require("https"),
    u = encodeURIComponent
var app = express()

app.use(express.logger())

/**
 * Query interface
 *
 * Find stations matching the query
 */
app.get("/search/:query", function(request, response) {
    https.get("https://api.vasttrafik.se/bin/rest.exe/v1/location.name?authKey=" + u(config.vasttrafik.apiKey) + "&format=json&input=" + u(request.params.query), function(targetResponse) {

        var data = ""

        targetResponse.on("data", function(chunk) {
            data += chunk
        })

        targetResponse.on("end", function() {
            var result = JSON.parse(data),
                output = ""

            if (result && result.LocationList && result.LocationList.StopLocation) {
                result.LocationList.StopLocation.forEach(function(stop) {
                    output += stop.name + "\t\t" + stop.id + "\n"
                })
            }

            response.send(targetResponse.statusCode, output);
        })
    }).on("error", function(err) {
        response.send(500, err);
    });
})

// Run server
app.listen(config.port, function() {
    console.log("Listening on port " + config.port)
})
