import { Bird } from "./bird.js";
import { Graphics } from "./graphics.js";
import { InputHandler } from "./input.js";

export class Simulation {
    constructor(config) {
        this.config = config;
        this.graphics = null;
        this.input = null;
        this.world = {
            // Should be set by map image and pixel density later
            width: 1000,
            height: 1000,
            birds: [],
            food: []
        }
        this.setupSketch();
        
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
    
    getBirdInfo(species) {
        return this.config.birds[species];
    }
    
    update() {
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
            self.graphics = new Graphics(self.config, self.world, p);
            self.input = new InputHandler(self.config, self.world, self.graphics);
            p.setup = () => self.graphics.setup();
            p.draw = () => self.graphics.draw();
            p.windowResized = () => self.input.onWindowResize();
            p.mouseWheel = (event) => self.input.onMouseWheel(event.delta);
            p.mouseClicked = () => self.input.onMouseClick();
            p.mousePressed = () => self.input.onMousePress();
            p.mouseReleased = () => self.input.onMouseRelease();
            p.mouseDragged = () => self.input.onMouseDrag();
        });
    }
}