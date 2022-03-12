export const Config = {
    world: {
        //name: "World",
        //map_path: "/maps/map1.png",
        birds: {
            "bird1": 5,
            "bird2": 5
        },
        preyPatches: 10
    },
    draw: {
        look_ahead: true,
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
            sight: 100
        }
    },
}