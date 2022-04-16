export const Config = {
    downloadResults: true,
    
    // World setup parameters
    world: {
        //name: "World",
        mapPath: "./map.png",
        unitsPerPixel: 100,
        // Must match all hex colors used in the image
        legend: {
            "#003466": "deep_ocean",
            "#2758a5": "ocean",
            "#61af60": "land"
        },
        
        startingZoom: -7,
        startingPos: [1500, 1500],
        birds: {
            "red": 50,
            "green": 50,
            "magenta": 50
        },
        preyPatches: 10
    },
    
    // What to draw
    draw: {
        lookAhead: false,
        sight: false,
        chunkBorders: false,
        heatMap: false
    },
    
    heatMap: {
        cellSize: 50,
        colors: {        // Scale is on [0.0, 1.0]
            "#003466": 0.0,
            "#164977": 0.15,
            "#305f8b": 0.30,
            "#45769c": 0.45,
            "#5e8cac": 0.60,
            "#75a2bf": 0.75
        },
        alpha: 175, // 255 for full opacity. Lower opacity leads to significant performance decrease
        interval: 1
    },
    
    // Levy flight parameters
    levyFlight: {
        maxAttempts: 10,
        fractalDimension: 1.4,
        distanceScalingFactor: 100
    },
    
    // Prey patch parameters
    preyPatch: {
        chunkSize: 200,         // Prey patch spatial hashmap size
        fillColor: "#FF8C42",    // Hex color or "none" to make transparent
        minDistFromBorder: 64,  // Minimum distance prey patches can spawn from the world border
        
        // Let P(x) = Patch size at x birds
        // P(0) = initialSize
        // P(1) = initialSize + time1Bonus
        // P(n) = initialSize + time1Bonus + (n - 1) * timeNBonus
        // To make this based on the initial size, you can use expressions like "initialSize * 5"
        // since this actually supports normal JavaScript
        initialSize: 10,    // P(0) = 10
        time1Bonus: 40,     // P(1) = 50
        timeNBonus: 1       // P(5) = 54
    },
    
    bird: {
        chunkSize: 100,         // Bird spatial hashmap chunk size
        startingFoodMultiplier: 1.0,    // The food percent birds start at on average
        startingFoodVariation: 0.1,     // The variation on the food percent birds start on average. 0 for no variation
        starvationColor: "#aaaaaa",     // The color birds turn when they begin to starve
        starvationThreshold: 0.5        // The food percent at which birds begin to turn to the starvation color. 0.0 if this never happens
    },
    
    // Bird species
    birdSpecies: {
        "red": {
            maxSpeed: 1,
            color: "#ff0000",
            sight: 25,
            roamingPattern: "levyFlight",    // Possible values: "levyFlight", "wander"
            sizeMultiplier: 1.0,
            avoidDistanceMultiplier: 2.0,
            foodCapacity: 20000
        },
        "green": {
            maxSpeed: 1.5,
            color: "#00ff00",
            sight: 25,
            roamingPattern: "levyFlight",
            sizeMultiplier: 1.0,
            avoidDistanceMultiplier: 2.0,
            foodCapacity: 20000
        },
        "magenta": {
            maxSpeed: 1,
            color: "#ff00ff",
            sight: 50,
            roamingPattern: "levyFlight",
            sizeMultiplier: 2.0,
            avoidDistanceMultiplier: 2.0,
            foodCapacity: 20000
        }
    }
}