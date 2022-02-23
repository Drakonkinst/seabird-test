import {Simulation} from "./simulation.js";

const CONFIG_PATH = "/config.json5";
let Instance = null;

function loadConfig(path, callback) {
    let configRequest = new XMLHttpRequest();
    configRequest.onload = function() {
        let jsonData = JSON5.parse(this.responseText);
        callback(jsonData);
    }
    configRequest.open("get", path, true);
    configRequest.send();
}

window.onload = function() {
    loadConfig(CONFIG_PATH, config => {
        Instance = new Simulation(config);
    });
    
    console.log("Page loaded!");
};
