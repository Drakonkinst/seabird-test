export const Config = {
    world: {
        //name: "World",
        //map_path: "/maps/map1.png",
        startingZoom: -5,
        startingPos: [750, 750],
        birds: {
            "red": 10,
            "green": 10,
            "magenta": 10
        },
        preyPatches: 20
    },
    draw: {
        lookAhead: true,
        sight: true
    },
    birds: {
        "red": {
            maxSpeed: 1,
            color: "#ff0000",
            sight: 25
        },
        "green": {
            maxSpeed: 1.5,
            color: "#00ff00",
            sight: 25
        },
        "magenta": {
            maxSpeed: 1,
            color: "#ff00ff",
            sight: 50
        }
    },
}