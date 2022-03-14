import { Graphics } from "./graphics.js";
import { inBounds, withinDistance } from "./utils.js";

const MAX_SELECT_DISTANCE = 75;

const MAX_ZOOM_LEVEL = 8;
const MIN_ZOOM_LEVEL = -8;
const MAX_STEPS_PER_UPDATE = 10;

const SPACEBAR = 32;
const LEFT_BRACKET = 219;
const RIGHT_BRACKET = 221;
const SHIFT = 16;

export class InputHandler {
    constructor(config, sim, graphics) {
        this.config = config;
        this.sim = sim;
        this.world = this.sim.world;
        this.graphics = graphics;
        
        this.xOffset = 0;
        this.yOffset = 0;
    }
    
    /* Helpers */
    
    isKeyDown(keyCode) {
        return this.graphics.sketch.keyIsDown(keyCode);
    }
    
    /* Event Listeners */
    
    onKeyPress(keyCode) {
        let shiftEnabled = this.isKeyDown(SHIFT);
        switch(keyCode) {
            case SPACEBAR:
                // Toggle pause
                this.sim.paused = !this.sim.paused;
                break;
            case RIGHT_BRACKET:
                // Increase updates per step
                if(shiftEnabled) {
                    this.sim.stepsPerUpdate = MAX_STEPS_PER_UPDATE;
                } else if(this.sim.stepsPerUpdate < MAX_STEPS_PER_UPDATE) {
                    this.sim.stepsPerUpdate += 1;
                }
                break;
            case LEFT_BRACKET:
                // Decrease updates per step
                if(shiftEnabled) {
                    this.sim.stepsPerUpdate = 1;
                } else if(this.sim.stepsPerUpdate > 1) {
                    this.sim.stepsPerUpdate -= 1;
                }
                break;
            default:
                if(keyCode < 65 || keyCode > 90) {
                    console.log(keyCode);
                }
        }
        
        // Handle alphabet input
        if(keyCode >= 65 && keyCode <= 90) {
            let letter = String.fromCharCode(keyCode);
            switch(letter) {
                case 'S':
                    this.config.draw.lookAhead = !this.config.draw.lookAhead;
                    this.config.draw.sight = this.config.draw.lookAhead;
                    break;
                case 'R':
                    this.sim.resetSimulation();
                    break;
                default:
                    console.log(letter);
            }
        }
    }

    onMouseClick() {
        // Look for bird
        const mousePos = this.graphics.getMousePos();
        let closestBird = null;
        let closestDistSq = MAX_SELECT_DISTANCE;
        for(let bird of this.world.birds) {
            let distSq = mousePos.distanceSquared(bird.pos);
            if(distSq < closestDistSq) {
                closestBird = bird;
                closestDistSq = distSq;
            }
        }
        
        if(closestBird != null) {
            this.sim.selectedBird = closestBird;
        } else {
            this.sim.selectedBird = null;
        }
    }

    onMousePress() {
        this.xOffset = this.graphics.sketch.mouseX - this.graphics.panX;
        this.yOffset = this.graphics.sketch.mouseY - this.graphics.panY;
    }

    onMouseRelease() {

    }

    onMouseDrag() {
        this.graphics.panX = this.graphics.sketch.mouseX - this.xOffset;
        this.graphics.panY = this.graphics.sketch.mouseY - this.yOffset;
    }

    onMouseWheel(delta) {
        const mousePos = this.graphics.getMousePos();
        if(delta > 0 && this.graphics.zoomLevel > MIN_ZOOM_LEVEL) {
            this.graphics.setZoomLevel(this.graphics.zoomLevel - 1);

            if(inBounds(mousePos.x, mousePos.y, this.world)) {
                this.graphics.panX += mousePos.x * Graphics.getZoomFactor();
                this.graphics.panY += mousePos.y * Graphics.getZoomFactor();
            }
        } else if(delta < 0 && this.graphics.zoomLevel < MAX_ZOOM_LEVEL) {
            this.graphics.setZoomLevel(this.graphics.zoomLevel + 1);

            if(inBounds(mousePos.x, mousePos.y, this.world)) {
                this.graphics.panX -= mousePos.x * Graphics.getZoomFactor();
                this.graphics.panY -= mousePos.y * Graphics.getZoomFactor();
            }
        }
    }

    onWindowResize() {
        this.graphics.resetCanvas();
    }
}