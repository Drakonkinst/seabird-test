import { Vector } from "./vector.js";
import { Bird } from "./bird.js";
import { toRadians } from "./utils.js";

const CANVAS_MARGIN = 0.0;
const CANVAS_RATIO = 1.0 - CANVAS_MARGIN * 2.0;
const ZOOM_FACTOR = 0.1;

const TEXT_PADDING_X = 10;
const TEXT_PADDING_Y = 16;
const TEXT_HEIGHT = 18;
const TEXT_SIZE = 16;

const Color = {
    OCEAN: "#1da2d8",
    DEEP_OCEAN: "#064273",
    LOOK_AHEAD: "#ff00ff",
    SIGHT: "#0000ff",
    SELECTED: "#ffd700"
};

let p = null;
let instance = null;

const drawBird = (() => {
    const SIZE = 15;
    const HALF_SIZE = SIZE / 2;
    const ANGLE = toRadians(120);
    
    return function(p, bird, config, sim) {
        const theta1 = bird.facing;
        const theta2 = theta1 + ANGLE;
        const theta3 = theta1 - ANGLE;
        
        const x = bird.pos.x;
        const y = bird.pos.y;
        
        const isSelected = sim.selectedBird != null && bird.id == sim.selectedBird.id;
        if(isSelected) {
            p.strokeWeight(1);
            p.stroke(Color.SELECTED);
        } else {
            p.strokeWeight(0.5);
            p.stroke(0);
        }
        
        
        p.fill(bird.getColor());
        p.beginShape();
        p.vertex(x, y);
        p.vertex(x + HALF_SIZE * Math.cos(theta2), y + HALF_SIZE * Math.sin(theta2));
        p.vertex(x + SIZE * Math.cos(theta1), y + SIZE * Math.sin(theta1));
        p.vertex(x + HALF_SIZE * Math.cos(theta3), y + HALF_SIZE * Math.sin(theta3));
        p.endShape(p.CLOSE);
        
        if(config.draw.lookAhead) {
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
            p.circle(x, y, sight * 2);
        }
    };
})();

export class Graphics {
    constructor(config, sim, p5Sketch) {
        if(instance != null) {
            throw new Error("Cannot have two Graphics objects at once!");
        }
        this.config = config;
        this.sim = sim;
        this.world = this.sim.world;
        this.sketch = p5Sketch;
        
        this.panX = 0;
        this.panY = 0;
        this.setZoomLevel(0);
        
        //this.paths = {};
        
        instance = this;
        p = p5Sketch;
        
        if(this.config.world.startingZoom != null) {
            this.setZoomLevel(this.config.world.startingZoom);
        }

        if(this.config.world.startingPos != null) {
            let posData = this.config.world.startingPos;
            this.panTo(posData[0], posData[1]);
        }

    }
    
    /* Drawing */
    
    reset() {
        p.stroke(0);
        p.noSmooth();
    }
    
    setup() {
        this.resetCanvas();
    }
    
    draw() {
        this.reset();
        
        if(this.sim.selectedBird != null) {
            this.panTo(this.sim.selectedBird.pos);
        }
        
        p.translate(this.panX, this.panY);
        p.clear();
        p.scale(this.zoom);
        p.background(Color.DEEP_OCEAN);
        p.fill(Color.OCEAN);
        p.rect(0, 0, this.world.width, this.world.height);
        
        this.drawPreyPatches();
        this.drawBirds();
        
        this.drawUI();
    }
    
    /* Drawing Objects */
    drawBirds() {
        for(let bird of this.world.birds) {
            this.drawBird(bird);
        }
    }
    
    drawBird(bird) {
        drawBird(p, bird, this.config, this.sim);
    }
    
    drawPreyPatches() {
        p.strokeWeight(1);
        p.stroke(0);
        p.noFill();

        for(let preyPatch of this.world.preyPatches) {
            this.drawPreyPatch(preyPatch);
        }
    }
    
    drawPreyPatch(preyPatch) {
        p.circle(preyPatch.pos.x, preyPatch.pos.y, preyPatch.radius * 2);
    }
    
    /* Drawing UI */
    drawUI() {
        p.scale(1 / this.zoom);
        p.translate(-this.panX, -this.panY);
        p.fill(255);
        p.noStroke();
        p.textFont("Courier New");
        p.textSize(TEXT_SIZE);
        
        let lines = {
            "topleft": 0,
            "botleft": 0,
            "topright": 0,
            "botright": 0
        };
        
        // Top left: Simulation Info
        this.writeText("Simulation Step: " + this.sim.step, "topleft", lines);
        this.writeText("Paused: " + (this.sim.paused ? "Yes" : "No"), "topleft", lines);
        this.writeText("Speed: " + this.sim.stepsPerUpdate, "topleft", lines);
        
        // Bottom left: Mouse Info
        this.writeText("Mouse Position: " + this.getMousePos().toString(true), "botleft", lines);
        this.writeText("Pan: (" + Math.round(-this.panX) + ", " + Math.round(-this.panY) + ")", "botleft", lines);
        this.writeText("Zoom: " + this.zoomLevel, "botleft", lines);
        
        // Top right: Controls
        this.writeText("SPACE: Toggle Pause", "topright", lines);
        this.writeText("[/]: Increase/Decrease Speed", "topright", lines);
        this.writeText("S: Toggle Sight", "topright", lines);
        
        // Bottom right: Target Info
        if(this.sim.selectedBird != null) {
            this.writeBirdInfo(this.sim.selectedBird, lines);
        }
    }
    
    writeBirdInfo(bird, lines) {
        this.writeText([
            "Species: " + bird.species,
            "Max Speed: " + this.sim.getBirdInfo(bird.species).maxSpeed,
            "Sight Range: " + this.sim.getBirdInfo(bird.species).sight,
            "",
            "Position: " + bird.pos.toString(true),
            "Speed: " + Math.round(bird.velocity.magnitude() * 100) / 100,
            "Success: " + (bird.successStep >= 0),
            "Id: " + bird.id
        ], "botright", lines);
    }
    
    writeText(text, corner, lines) {
        if(Array.isArray(text)) {
            for(let i = text.length - 1; i >= 0; --i) {
                this.writeText(text[i], corner, lines);
            }
            return;
        }
        
        let x = null;
        let y = null;
        
        if(corner == "topleft") {
            p.textAlign(p.LEFT);
            x = TEXT_PADDING_X;
            y = TEXT_PADDING_Y + TEXT_HEIGHT * lines["topleft"]; 
        } else if(corner == "botleft") {
            p.textAlign(p.LEFT);
            x = TEXT_PADDING_X;
            y = p.windowHeight - TEXT_PADDING_Y - TEXT_HEIGHT * lines["botleft"];
        } else if(corner == "topright") {
            p.textAlign(p.RIGHT);
            x = p.windowWidth - TEXT_PADDING_X;
            y = TEXT_PADDING_Y + TEXT_HEIGHT * lines["topright"]; 
        } else if(corner == "botright") {
            p.textAlign(p.RIGHT);
            x = p.windowWidth - TEXT_PADDING_X;
            y = p.windowHeight - TEXT_PADDING_Y - TEXT_HEIGHT * lines["botright"];
        }
        
        if(x != null && y != null) {
            ++lines[corner];
            p.text(text, x, y);
        }
    }
    
    /* Helpers */
    
    setZoomLevel(zoomLevel) {
        this.zoomLevel = zoomLevel;
        this.zoom = 1.0 + zoomLevel * ZOOM_FACTOR;
    }

    panTo(a, b) {
        if(b == null) {
            // Treat 'a' as a vector
            this.panX = (p.windowWidth / 2) - (a.x * this.zoom);
            this.panY = (p.windowHeight / 2) - (a.y * this.zoom);
        } else {
            // Treat 'a' and 'b' as x and y
            this.panX = (p.windowWidth / 2) - (a * this.zoom);
            this.panY = (p.windowHeight / 2) - (b * this.zoom);
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