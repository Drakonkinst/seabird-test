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
        preyPatches: 20
    },
    
    // What to draw
    draw: {
        lookAhead: true,
        sight: true
    },
    
    // Prey patch parameters
    preyPatch: {
        minDistFromBorder: 64,  // Minimum distance prey patches can spawn from the world border
        initialSize: 32,
        increasePerBird: 5
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
            roamingPattern: "levyFlight"    // Possible values: "levyFlight", "wander"
        },
        "green": {
            maxSpeed: 1.5,
            color: "#00ff00",
            sight: 25,
            roamingPattern: "levyFlight"
        },
        "magenta": {
            maxSpeed: 1,
            color: "#ff00ff",
            sight: 50,
            roamingPattern: "levyFlight"
        }
    },
}