import { Vector } from "./vector.js";
import { Bird } from "./bird.js";
import { toRadians } from "./utils.js";

const CANVAS_MARGIN = 0.0;
const CANVAS_RATIO = 1.0 - CANVAS_MARGIN * 2.0;
const ZOOM_FACTOR = 0.1;

const Color = {
    OCEAN: "#1da2d8",
    DEEP_OCEAN: "#064273",
    LOOK_AHEAD: "#ff00ff",
    SIGHT: "#0000ff"
};

let p = null;
let instance = null;

const drawBird = (() => {
    const SIZE = 30;
    const HALF_SIZE = SIZE / 2;
    const ANGLE = toRadians(120);
    
    return function(p, bird, config) {
        const theta1 = bird.facing;
        const theta2 = theta1 + ANGLE;
        const theta3 = theta1 - ANGLE;
        
        const x = bird.pos.x;
        const y = bird.pos.y;
        
        p.stroke(0);
        p.fill(bird.getColor());
        p.beginShape();
        p.vertex(x, y);
        p.vertex(x + HALF_SIZE * Math.cos(theta2), y + HALF_SIZE * Math.sin(theta2));
        p.vertex(x + SIZE * Math.cos(theta1), y + SIZE * Math.sin(theta1));
        p.vertex(x + HALF_SIZE * Math.cos(theta3), y + HALF_SIZE * Math.sin(theta3));
        p.endShape(p.CLOSE);
        
        if(config.draw.look_ahead) {
            p.stroke(Color.LOOK_AHEAD);
            const length = bird.getMaxSpeed() * Bird.getLookAheadMultiplier();
            const endX = x + length * Math.cos(theta1);
            const endY = y + length * Math.sin(theta1);
            p.line(x, y, endX, endY);
        }
        
        if(config.draw.sight) {
            p.stroke(Color.SIGHT);
            p.noFill();
            const sight = bird.getSight();
            p.circle(x, y, sight);
        }
    };
})();

export class Graphics {
    constructor(config, world, p5Sketch) {
        if(instance != null) {
            throw new Error("Cannot have two Graphics objects at once!");
        }
        this.config = config;
        this.world = world;
        this.sketch = p5Sketch;
        
        this.panX = 0;
        this.panY = 0;
        this.setZoomLevel(0);
        
        //this.paths = {};
        
        instance = this;
        p = p5Sketch;
    }
    
    /* Drawing */
    
    reset() {
        p.stroke(0);
    }
    
    setup() {
        this.resetCanvas();
    }
    
    draw() {
        this.reset();
        p.translate(this.panX, this.panY);
        p.clear();
        p.scale(this.zoom);
        p.background(Color.DEEP_OCEAN);
        p.fill(Color.OCEAN);
        p.rect(0, 0, this.world.width, this.world.height);
        
        this.drawBirds();
    }
    
    /* Drawing Objects */
    drawBirds() {
        p.strokeWeight(0.5);
        
        for(let bird of this.world.birds) {
            this.drawBird(bird);
        }
    }
    
    drawBird(bird) {
        drawBird(p, bird, this.config);
    }
    
    /* Drawing UI */
    
    /* Helpers */
    
    setZoomLevel(zoomLevel) {
        this.zoomLevel = zoomLevel;
        this.zoom = 1.0 + zoomLevel * ZOOM_FACTOR;
    }

    panTo(a, b) {
        if(b == null) {
            // Treat 'a' as a vector
            this.panX = (this.world.width / 2) - (a.x * this.zoom);
            this.panY = (this.world.height / 2) - (a.y * this.zoom);
        } else {
            // Treat 'a' and 'b' as x and y
            this.panX = (this.world.width / 2) - (a * this.zoom);
            this.panY = (this.world.height / 2) - (b * this.zoom);
        }
    }
    
    resetCanvas() {
        p.resizeCanvas(window.innerWidth * CANVAS_RATIO, window.innerHeight * CANVAS_RATIO);
    }
    
    getMousePos() {
        return new Vector((p.mouseX - this.panX) / this.zoom, (p.mouseY - this.panY) / this.zoom);
    }
    
    static getZoomFactor() {
        return ZOOM_FACTOR;
    }
}