export const Config = {
    downloadResults: true,
    
    // World setup parameters
    world: {
        //name: "World",
        //map_path: "/maps/map1.png",
        
        width: 3000,    // World width in pixels
        height: 3000,   // World height in pixels
        
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
        lookAhead: true,
        sight: true,
        chunkBorders: false,
        heatMap: true
    },
    
    heatMap: {
        cellSize: 50,
        colors: {        // Scale is on [0.0, 1.0]
            "#006993": 0.0,
            "#067898": 0.1,
            "#0D869D": 0.2,
            "#1395A1": 0.3,
            "#1AA3A6": 0.4,
            "#20B2AB": 0.5
        },
        alpha: 255,
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
            foodCapacity: 20000
        },
        "green": {
            maxSpeed: 1.5,
            color: "#00ff00",
            sight: 25,
            roamingPattern: "levyFlight",
            sizeMultiplier: 1.0,
            foodCapacity: 20000
        },
        "magenta": {
            maxSpeed: 1,
            color: "#ff00ff",
            sight: 50,
            roamingPattern: "levyFlight",
            sizeMultiplier: 2.0,
            foodCapacity: 20000
        }
    }
}