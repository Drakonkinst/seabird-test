import { Bird } from "./bird.js";
import { Graphics } from "./graphics.js";
import { InputHandler } from "./input.js";
import { PreyPatch } from "./prey_patch.js";
import { mean } from "./utils.js";

export class Simulation {
    constructor(config) {
        this.config = config;
        this.graphics = null;
        this.input = null;
        this.world = {
            // Should be set by map image and pixel density later
            width: 1500,
            height: 1500,
            birds: [],
            preyPatches: []
        }
        this.metrics = {
            // The times when birds of each species find a prey patch
            success: {}
        }
        
        this.step = 0;
        this.paused = false;
        this.stepsPerUpdate = 1;
        
        this.selectedBird = null;
        
        this.setupSketch();
        
        this.spawnPreyPatches();
        this.spawnBirds();
        
        this.setUpdateInterval(10);
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
        console.log("Created bird " + bird.id);
        this.world.birds.push(bird);
    }
    
    spawnPreyPatches() {
        let numPreyPatches = this.config.world.preyPatches;
        for(let i = 0; i < numPreyPatches; ++i) {
            this.addPreyPatch();
        }
    }
    
    addPreyPatch() {
        let x = Math.random() * this.world.width;
        let y = Math.random() * this.world.height;
        let preyPatch = new PreyPatch(this, x, y);
        console.log("Created prey patch " + preyPatch.id);
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
        
        // If everyone is done, print averages
        if(numSuccess >= this.world.birds.length) {
            this.paused = true;
            let avg = {};
            for(let k in successObj) {
                avg[k] = mean(successObj[k]);
            }
            console.log(avg);
        }
    }
}