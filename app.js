var config = require("./config.js"),
    express = require("express"),
    https = require("https"),
    u = encodeURIComponent
var app = express()

app.use(express.logger())

/**
 * String interpolation
 */
String.prototype.supplant = function (o) {
    return this.replace(/{([^{}]*)}/g,
        function (a, b) {
            var r = o[b]
            return typeof r === 'string' || typeof r === 'number' ? r : a
        }
    )
}

function getJSON(url, onSuccess, onError) {
    try {
        https.get(url, function(response) {
            var data = ""
            response.on("data", function(chunk) { data += chunk })
            response.on("end",  function()      { onSuccess(response.statusCode, JSON.parse(data)) })
        }).on("error", function(err) { onError(err) })
    } catch (err) {
        onError(err)
    }
}

/**
 * Query interface
 *
 * Find stations matching the query
 */
app.get("/search/:query", function(request, response) {
    getJSON(
        "https://api.vasttrafik.se/bin/rest.exe/v1/location.name?authKey=" + u(config.vasttrafik.apiKey) + "&format=json&input=" + u(request.params.query),
        function(status, result) {
            var output = ""

            if (result && result.LocationList && result.LocationList.StopLocation) {
                result.LocationList.StopLocation.forEach(function(stop) {
                    output += config.formats.searchLocation.supplant(stop)
                })
            }

            response.send(status, output)
        },
        function(err) {
            console.log(err)
            response.send(500, err.toString())
        }
    )
})

/**
 * Next ride interface
 */
app.get("/next/:station/:direction/:filter", function(request, response) {
    var p = request.params
    getJSON(
        "https://api.vasttrafik.se/bin/rest.exe/v1/departureBoard?authKey=" + u(config.vasttrafik.apiKey) + "&format=json&id=" + u(p.station) + "&direction=" + u(p.direction),
        function(status, result) {
            var output = "",
                done = []

            if (result && result.DepartureBoard && result.DepartureBoard.Departure) {
                var currentTime = new Date()

                result.DepartureBoard.Departure.forEach(function(departure) {
                    if (departure.name.match(p.filter) && done.indexOf(departure.name) < 0) {
                        done.push(departure.name)

                        var departureTime = new Date(currentTime),
                            t = departure.rtTime ? departure.rtTime : departure.time,
                            parts = t.split(":").map(function(i) { return parseInt(i.replace(/^0([0-9])$/, "$1")) })

                        departureTime.setHours(parts[0])
                        departureTime.setMinutes(parts[1])

                        departure.minutes = (departureTime - currentTime) / (1000*60)

                        output += config.formats.nextRide.supplant(departure)
                    }
                })
            }

            response.send(status, output)
        },
        function(err) {
            console.log(err)
            response.send(500, err.toString())
        }
    )
})

// Run server
app.listen(config.port, function() {
    console.log("Listening on port " + config.port)
})
