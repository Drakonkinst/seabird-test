export const Config = {
    world: {
        //name: "World",
        //map_path: "/maps/map1.png",
        startingZoom: -5,
        startingPos: [750, 750],
        birds: {
            "bird1": 10,
            "bird2": 10,
            "bird3": 10
        },
        preyPatches: 10
    },
    draw: {
        lookAhead: true,
        sight: true
    },
    birds: {
        "bird1": {
            maxSpeed: 1,
            color: "#ff0000",
            sight: 50
        },
        "bird2": {
            maxSpeed: 1.5,
            color: "#00ff00",
            sight: 50
        },
        "bird3": {
            maxSpeed: 1,
            color: "#ff00ff",
            sight: 100
        }
    },
}