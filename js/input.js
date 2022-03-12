import { Graphics } from "./graphics.js";
import { inBounds } from "./utils.js";

const MAX_ZOOM_LEVEL = 8;
const MIN_ZOOM_LEVEL = -8;

const SPACEBAR = 32;

export class InputHandler {
    constructor(config, sim, graphics) {
        this.config = config;
        this.sim = sim;
        this.world = this.sim.world;
        this.graphics = graphics;
        
        this.xOffset = 0;
        this.yOffset = 0;
    }
    
    /* Event Listeners */
    
    onKeyPress(keyCode) {
        if(keyCode == SPACEBAR) {
            // Toggle pause
            this.sim.paused = !this.sim.paused;
        }
    }

    onMouseClick() {

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