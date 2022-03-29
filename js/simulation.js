import { Bird } from "./bird.js";
import { Graphics } from "./graphics.js";
import { InputHandler } from "./input.js";
import { PreyPatch } from "./prey_patch.js";
import { createCSVData, generateRandomId, getFormattedTime, mean, promptFileDownload, randRange } from "./utils.js";

export class Simulation {
    constructor(config) {
        this.id = generateRandomId();
        this.config = config;
        this.graphics = null;
        this.input = null;
        this.world = {};
        this.metrics = {};
        
        this.stepsPerUpdate = 1;
        
        this.onSimulationStart();
        this.setupSketch();
        this.setUpdateInterval(10);
    }
    
    onSimulationStart() {
        // Should be set by map image and pixel density later
        this.world.width = this.config.world.width;
        this.world.height = this.config.world.height;
        this.world.birds = [];
        this.world.preyPatches = [];
        
        // The times when birds of each species find a prey patch
        this.metrics.success = {};

        this.step = 0;
        this.paused = false;
        this.selectedBird = null;

        PreyPatch.resetNames();
        this.spawnPreyPatches();
        this.spawnBirds();
    }
    
    spawnBirds() {
        let birds = this.config.world.birds;
        for(let birdType in birds) {
            let count = birds[birdType];
            for(let i = 0; i < count; ++i) {
                this.addBird(birdType);
            }
        }
    }
    
    addBird(type) {
        let x = Math.random() * this.world.width;
        let y = Math.random() * this.world.height;
        let bird = new Bird(this, type, x, y);
        //console.log("Created bird " + bird.id);
        this.world.birds.push(bird);
    }
    
    spawnPreyPatches() {
        let numPreyPatches = this.config.world.preyPatches;
        for(let i = 0; i < numPreyPatches; ++i) {
            this.addPreyPatch();
        }
    }
    
    addPreyPatch() {
        const PREY_PATCH_MARGIN = this.config.preyPatch.minDistFromBorder;
        let x = randRange(PREY_PATCH_MARGIN, this.world.width - PREY_PATCH_MARGIN);
        let y = randRange(PREY_PATCH_MARGIN, this.world.height - PREY_PATCH_MARGIN);
        let preyPatch = new PreyPatch(this, x, y, this.config.preyPatch.initalSize);
        //console.log("Created prey patch " + preyPatch.id);
        this.world.preyPatches.push(preyPatch);
    }
    
    getBirdInfo(species) {
        return this.config.birds[species];
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
        
        for(let bird of this.world.birds) {
            bird.update();
        }
    }
    
    setUpdateInterval(interval) {
        let self = this;
        this.updateInterval = setInterval(() => self.update(), interval);
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
    
    /* Metrics */
    
    registerSuccess(species, step) {
        let successObj = this.metrics.success;
        if(!successObj.hasOwnProperty(species)) {
            successObj[species] = [];
        }
        successObj[species].push(step);
        
        // Count num successes
        let numSuccess = 0;
        for(let k in successObj) {
            numSuccess += successObj[k].length;
        }
        
        // If everyone is done, finish the simulation
        if(numSuccess >= this.world.birds.length) {
            this.onSimulationFinish();
        }
    }
    
    onSimulationFinish() {
        // Calculate summary statistics
        
        this.paused = true;
        let avg = {};
        for(let k in this.metrics.success) {
            avg[k] = mean(this.metrics.success[k]);
        }
        console.log(avg);
        
        let preyPatchCount = {};
        let preyPatchFreq = {};
        for(let preyPatch of this.world.preyPatches) {
            preyPatchCount[preyPatch.name] = preyPatch.numBirds;
            if(!preyPatchFreq.hasOwnProperty(preyPatch.numBirds)) {
                preyPatchFreq[preyPatch.numBirds] = 0;
            }
            preyPatchFreq[preyPatch.numBirds] += 1;
        }
        console.log(preyPatchCount);
        console.log(preyPatchFreq);
        
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
        
        const fileName = "seabird_results_" + getFormattedTime() + ".csv";
        const data = createCSVData(columns, dataRows);
        console.log("Downloading " + fileName);
        promptFileDownload(fileName, data);
    }
    
    resetSimulation() {
        this.onSimulationStart();
    }
}