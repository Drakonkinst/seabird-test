export const Config = {
    downloadResults: true,
    
    // World setup parameters
    world: {
        //name: "World",
        //map_path: "/maps/map1.png",
        
        width: 1500,    // World width in pixels
        height: 1500,   // World height in pixels
        
        startingZoom: -5,
        startingPos: [750, 750],
        birds: {
            "red": 10,
            "green": 10,
            "magenta": 10
        },
        preyPatches: 5,
        chunkSize: 100
    },
    
    // What to draw
    draw: {
        lookAhead: true,
        sight: true,
        chunkBorders: false
    },
    
    // Prey patch parameters
    preyPatch: {
        chunkSize: 200,
        fillColor: "#FF8C42",   // Hex color or "none" to make transparent
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
    
    // Levy flight parameters
    levyFlight: {
        maxAttempts: 10,
        fractalDimension: 1.4,
        distanceScalingFactor: 100
    },
    
    // Bird species
    birds: {
        "red": {
            maxSpeed: 1,
            color: "#ff0000",
            sight: 25,
            roamingPattern: "levyFlight",    // Possible values: "levyFlight", "wander"
            sizeMultiplier: 1.0
        },
        "green": {
            maxSpeed: 1.5,
            color: "#00ff00",
            sight: 25,
            roamingPattern: "levyFlight",
            sizeMultiplier: 1.0
        },
        "magenta": {
            maxSpeed: 1,
            color: "#ff00ff",
            sight: 50,
            roamingPattern: "levyFlight",
            sizeMultiplier: 2.0
        }
    }
}