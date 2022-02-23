import { Simulation } from "./simulation.js";
import { Config } from "../config.js"

window.onload = function() {
    if(Config == null) {
        console.warn("No Config object found!");
    }
    
    const Sim = new Simulation(Config);
    console.log("Page loaded!");
};
