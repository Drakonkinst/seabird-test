import { Bird, State } from "./bird.js";
import { Graphics } from "./graphics.js";
import { Heatmap } from "./heatmap.js";
import { InputHandler } from "./input.js";
import { ImageHandler } from "./image_handler.js"
import { PreyPatch } from "./prey_patch.js";
import { SpatialHashMap } from "./spatial_hashmap.js";
import { createCSVData, generateRandomId, getFormattedTime, inBounds, mean, promptFileDownload, randRange } from "./utils.js";

const MAX_SPAWN_ATTEMPTS = 10;
const RAD_2 = Math.sqrt(2);

export class Simulation {
    constructor(config) {
        let self = this;
        this.id = generateRandomId();
        this.config = config;
        this.graphics = null;
        this.input = null;
        this.world = {};
        this.metrics = {};
        this.data = {};
        
        this.stepsPerUpdate = 1;
        
        this.validateConfig();
        this.startSimulation(() => {
            self.setupSketch();
            self.setUpdateInterval(10);
        });
    }
    
    validateConfig() {
        
    }
    
    startSimulation(callback) {
        let self = this;
        if(this.mapImage == null) {
            this.mapImage = new ImageHandler(
                this.config.world.mapPath,
                this.config.world.unitsPerPixel,
                () => self.onSimulationStart(callback),
                this.config.world.legend);
        } else {
            self.onSimulationStart(callback);
        }
    }
    
    onSimulationStart(callback = () => {}) {
        // Should be set by map image and pixel density later
        this.world.width = this.mapImage.worldWidth;
        this.world.height = this.mapImage.worldHeight;
        this.world.birds = [];
        this.world.deadBirds = [];
        this.world.preyPatches = [];
        
        // The times when birds of each species find a prey patch
        this.metrics.success = {};
        this.metrics.alive = {};
        this.metrics.heatMap = new Heatmap(
            this.config.heatMap.cellSize,
            this.world.width,
            this.world.height,
            this.config.heatMap.colors);
        
        // Data
        this.data.birdMap = new SpatialHashMap(this.config.bird.chunkSize);
        this.data.preyPatchMap = new SpatialHashMap(this.config.preyPatch.chunkSize, true);

        this.step = 0;
        this.paused = false;
        this.selectedBird = null;

        PreyPatch.resetNames();
        this.spawnPreyPatches();
        this.spawnBirds();
        callback();
    }
    
    spawnBirds() {
        let birds = this.config.world.birds;
        for(let birdType in birds) {
            let count = birds[birdType];
            for(let i = 0; i < count; ++i) {
                this.spawnBird(birdType);
            }
        }
    }
    
    spawnBird(type) {
        let x = Math.random() * this.world.width;
        let y = Math.random() * this.world.height;

        let attempts = 0;
        while(!this.isValidPos(x, y) && ++attempts < MAX_SPAWN_ATTEMPTS) {
            x = Math.random() * this.world.width;
            y = Math.random() * this.world.height;
        }
        if(attempts >= MAX_SPAWN_ATTEMPTS) {
            // Invalid spawn
            return;
        }
        let bird = new Bird(this, type, x, y);
        //console.log("Created bird " + bird.id);
        this.addBird(bird);
    }
    
    addBird(bird) {
        this.world.birds.push(bird);
        this.updateBirdPos(bird);
        
        if(!this.metrics.alive.hasOwnProperty(bird.species)) {
            this.metrics.alive[bird.species] = 0;
        }
        ++this.metrics.alive[bird.species];
    }
    
    removeBird(bird) {
        // Assumed to be already removed from this.world.birds
        if(bird.lastKey != null) {
            this.data.birdMap.removeAtKey(bird, bird.lastKey);
        }
        --this.metrics.alive[bird.species];
        this.world.deadBirds.push(bird);
        this.checkSimulationFinish();
    }
    
    spawnPreyPatches() {
        let numPreyPatches = this.config.world.preyPatches;
        for(let i = 0; i < numPreyPatches; ++i) {
            this.spawnPreyPatch();
        }
    }
    
    spawnPreyPatch() {
        const PREY_PATCH_MARGIN = this.config.preyPatch.minDistFromBorder;
        let x = Math.random() * this.world.width;
        let y = Math.random() * this.world.height;
        
        let attempts = 0;
        while(++attempts < MAX_SPAWN_ATTEMPTS && !this.isValidArea(x, y, PREY_PATCH_MARGIN)) {
            x = Math.random() * this.world.width;
            y = Math.random() * this.world.height;
        }
        if(attempts >= MAX_SPAWN_ATTEMPTS) {
            // Invalid spawn
            return;
        }
        let preyPatch = new PreyPatch(this, x, y, this.config.preyPatch.initialSize);
        //console.log("Created prey patch " + preyPatch.id);
        this.addPreyPatch(preyPatch);
    }
    
    addPreyPatch(preyPatch) {
        this.world.preyPatches.push(preyPatch);
        this.data.preyPatchMap.insert(preyPatch);
    }
    
    update() {
        if(this.paused) {
            return;
        }
        
        for(let i = 0; i < this.stepsPerUpdate; ++i) {
            this.doStep();
        }
    }
    
    doStep() {
        ++this.step;
        
        for(let i = this.world.birds.length - 1; i >= 0; --i) {
            let bird = this.world.birds[i];
            if(bird.alive) {
                bird.update();
                this.updateBirdPos(bird);
            } else {
                this.world.birds.splice(i, 1);
                this.removeBird(bird);
            }
        }
        
        if(this.step % this.config.heatMap.interval == 0) {
            for(let bird of this.world.birds) {
                if(State.nameOf(bird.state) != "Resting") {
                    this.metrics.heatMap.apply(bird);
                }
            }
        }
    }
    
    setUpdateInterval(interval) {
        let self = this;
        this.updateInterval = setInterval(() => self.update(), interval);
    }
    
    updateBirdPos(bird) {
        let currKey = this.data.birdMap.key(bird.pos);
        if(bird.lastKey != null
                && currKey.x == bird.lastKey.x
                && currKey.y == bird.lastKey.y) {
            // No need to change
            return;
        } else if(bird.lastKey != null) {
            this.data.birdMap.removeAtKey(bird, bird.lastKey);
        }
        //console.log(bird.lastKey + " -> " + currKey);
        this.data.birdMap.insertAtKey(bird, currKey);
        bird.lastKey = currKey;
    }

    setupSketch() {
        let self = this;
        this.sketch = new p5(function(p) {
            self.graphics = new Graphics(self.config, self, p);
            self.input = new InputHandler(self.config, self, self.graphics);
            p.setup = () => self.graphics.setup();
            p.draw = () => self.graphics.draw();
            p.windowResized = () => self.input.onWindowResize();
            p.mouseWheel = (event) => self.input.onMouseWheel(event.delta);
            p.mouseClicked = () => self.input.onMouseClick();
            p.mousePressed = () => self.input.onMousePress();
            p.mouseReleased = () => self.input.onMouseRelease();
            p.mouseDragged = () => self.input.onMouseDrag();
            p.keyPressed = () => self.input.onKeyPress(event.keyCode);
        });
    }
    
    isValidPos(x, y) {
        const region = this.mapImage.getRegionAtPoint(x, y);
        return inBounds(x, y, this.world) && region != null && region != "land";
    }

    isValidArea(x, y, radius) {
        return this.isValidPos(x, y)
            && this.isValidPos(x + radius, y)
            && this.isValidPos(x - radius, y)
            && this.isValidPos(x, y + radius)
            && this.isValidPos(x, y - radius)
            && this.isValidPos(x + radius * RAD_2, y + radius * RAD_2)
            && this.isValidPos(x - radius * RAD_2, y + radius * RAD_2)
            && this.isValidPos(x + radius * RAD_2, y - radius * RAD_2)
            && this.isValidPos(x - radius * RAD_2, y - radius * RAD_2);
    }
    
    getBirdInfo(species) {
        return this.config.birdSpecies[species];
    }
    
    /* Metrics */
    
    registerSuccess(species, step) {
        const successObj = this.metrics.success;
        if(!successObj.hasOwnProperty(species)) {
            successObj[species] = [];
        }
        successObj[species].push(step);
        
        this.checkSimulationFinish();
    }
    
    checkSimulationFinish() {
        // Count num successes
        let numSuccess = 0;
        const successObj = this.metrics.success;
        for(let k in successObj) {
            numSuccess += successObj[k].length;
        }
        
        // If everyone is done, finish the simulation
        if(numSuccess >= this.world.birds.length) {
            this.onSimulationFinish();
        }
    }
    
    onSimulationFinish() {
        this.paused = true;
        if(this.config.downloadResults) {
            this.downloadSimulationResults();
        }
    }
    
    downloadSimulationResults() {
        const columns = [
            "simulation_id",
            "bird_id",
            "bird_species",
            "success_step",
            "prey_patch_name"
        ];
        const dataRows = [];
        
        for(let bird of this.world.birds) {
            let data = [
                this.id,
                bird.id,
                bird.species,
                bird.successStep,
                bird.foundPreyPatch.name
            ];
            dataRows.push(data);
        }
        
        for(let bird of this.world.deadBirds) {
            let data = [
                this.id,
                bird.id,
                bird.species,
                bird.successStep,
                null
            ];
            dataRows.push(data);
        }
        
        const fileName = "seabird_results_" + getFormattedTime() + ".csv";
        const data = createCSVData(columns, dataRows);
        console.log("Downloading " + fileName);
        promptFileDownload(fileName, data);
    }
    
    resetSimulation() {
        this.startSimulation();
    }
}