import { Vector } from "./vector.js";
import { Bird, State } from "./bird.js";
import { toRadians } from "./utils.js";

const CANVAS_MARGIN = 0.0;
const CANVAS_RATIO = 1.0 - CANVAS_MARGIN * 2.0;
const ZOOM_FACTOR = 0.05;

const TEXT_PADDING_X = 10;
const TEXT_PADDING_Y = 16;
const TEXT_HEIGHT = 18;
const TEXT_SIZE = 16;

const Color = {
    OCEAN: "#2758a5",
    BACKGROUND: "#1C0B19",
    DEEP_OCEAN: "#003466",
    LAND: "#61af60",
    LOOK_AHEAD: "#FF6961",
    SIGHT: "#bde0ff",
    SELECTED: "#ffd700",
    GRID: "#3A5683"
};
const cachedColors = {};

let p = null;
let instance = null;

const drawBird = (() => {
    const DEFAULT_SIZE = 15;
    const ANGLE = toRadians(120);
    
    return function(p, bird, config, sim) {
        const theta1 = bird.facing;
        const theta2 = theta1 + ANGLE;
        const theta3 = theta1 - ANGLE;
        
        const x = bird.pos.x;
        const y = bird.pos.y;
        const size = DEFAULT_SIZE * bird.getSpeciesInfo().sizeMultiplier;
        const halfSize = size / 2;
        
        const isSelected = sim.selectedBird != null && bird.id == sim.selectedBird.id;
        
        // Show target pos when searching in levy flight
        if(isSelected && State.nameOf(bird.state) == "Searching" && bird.state.targetPos != null) {
            p.stroke("red");
            p.strokeWeight(2.0)
            p.line(bird.pos.x, bird.pos.y, bird.state.targetPos.x, bird.state.targetPos.y);
        }
        
        if(isSelected) {
            p.strokeWeight(1);
            p.stroke(Color.SELECTED);
        } else {
            p.strokeWeight(0.5);
            p.stroke(0);
        }
        
        if(bird.getFoodPercent() > config.bird.starvationThreshold) {
            p.fill(bird.getColor());
        } else {
            let progress = bird.getFoodPercent() / config.bird.starvationThreshold;
            let fillColor = p.lerpColor(p.color(config.bird.starvationColor), p.color(bird.getColor()), progress);
            p.fill(fillColor);
        }
        
        p.beginShape();
        p.vertex(x, y);
        p.vertex(x + halfSize * Math.cos(theta2), y + halfSize * Math.sin(theta2));
        p.vertex(x + size * Math.cos(theta1), y + size * Math.sin(theta1));
        p.vertex(x + halfSize * Math.cos(theta3), y + halfSize * Math.sin(theta3));
        p.endShape(p.CLOSE);
        
        if(config.draw.lookAhead) {
            p.stroke(Color.LOOK_AHEAD);
            const length = bird.getMaxSpeed() * bird.getLookAheadMultiplier();
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
        
        this.mapImage = p.loadImage(this.config.world.mapPath);

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
        p.background(Color.BACKGROUND);
        this.drawMap();

        if(this.config.draw.heatMap) {
            this.drawHeatMap(this.sim.metrics.heatMap);
        }
        
        if(this.config.draw.chunkBorders) {
            this.drawGrid(this.sim.data.birdMap.cellSize, 0.5);
            this.drawGrid(this.sim.data.preyPatchMap.cellSize, 1.5);
        }
        
        this.drawPreyPatches();

        this.drawBirds();
        this.drawPreyPatchesText();
        
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
        
        if(this.config.preyPatch.fillColor == "none") {
            p.noFill();
        } else {
            p.fill(this.config.preyPatch.fillColor);
        }

        for(let preyPatch of this.world.preyPatches) {
            this.drawPreyPatch(preyPatch);
        }
    }
    
    drawPreyPatchesText() {
        p.fill(0);
        p.strokeWeight(1);
        p.stroke(0);
        p.textAlign(p.CENTER, p.CENTER);
        
        for(let preyPatch of this.world.preyPatches) {
            this.drawPreyPatchText(preyPatch);
        }
    }
    
    drawPreyPatch(preyPatch) {
        
        p.circle(preyPatch.pos.x, preyPatch.pos.y, preyPatch.radius * 2);
    }
    
    drawPreyPatchText(preyPatch) {
        p.text(preyPatch.name, preyPatch.pos.x, preyPatch.pos.y);
    }
    
    drawGrid(chunkSize, strokeWeight) {
        p.stroke(Color.GRID);
        p.strokeWeight(strokeWeight);
        
        const horizontal = Math.ceil(this.world.width / chunkSize);
        const vertical = Math.ceil(this.world.height / chunkSize);

        for(var i = 1; i < horizontal; i++) {
            p.line(i * chunkSize, 0, i * chunkSize, this.world.width);
        }
        for(var j = 1; j < vertical; j++) {
            p.line(0, j * chunkSize, this.world.width, j * chunkSize);
        }
    }
    
    drawHeatMap(heatMap) {
        for(let y = 0; y < heatMap.sizeY; ++y) {
            for(let x = 0; x < heatMap.sizeX; ++x) {
                let color = heatMap.getColorAtPoint(x, y);
                if(color != null) {
                    if(cachedColors.hasOwnProperty(color)) {
                        color = cachedColors[color];
                    } else {
                        color = p.color(color);
                        color.setAlpha(this.config.heatMap.alpha);
                    }
                    p.stroke(color);
                    p.fill(color);
                    let startX = x * heatMap.cellSize;
                    let startY = y * heatMap.cellSize;
                    p.rect(startX, startY, heatMap.cellSize, heatMap.cellSize);
                }
            }
        }
    }
    
    drawMap() {
        p.image(this.mapImage, 0, 0, this.sim.mapImage.worldWidth, this.sim.mapImage.worldHeight);
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
        this.writeText("FPS: " + Math.round(p.frameRate()), "topleft", lines);
        this.writeText("", "topleft", lines);
        for(let k in this.sim.metrics.alive) {
            if(this.sim.metrics.alive.hasOwnProperty(k)) {
                this.writeText(k + ": " + this.sim.metrics.alive[k], "topleft", lines);
            }
        }
        
        // Bottom left: Mouse Info
        this.writeText("Mouse Position: " + this.getMousePos().toString(true), "botleft", lines);
        this.writeText("Pan: (" + Math.round(-this.panX) + ", " + Math.round(-this.panY) + ")", "botleft", lines);
        this.writeText("Zoom: " + this.zoomLevel, "botleft", lines);
        this.writeText("Region: " + this.sim.mapImage.getRegionAtPos(this.getMousePos()), "botleft", lines);
        
        // Top right: Controls
        this.writeText([
            "SPACE: Toggle Pause",
            "[/]: Increase/Decrease Speed",
            "S: Toggle Sight",
            "G: Toggle Grid",
            "H: Toggle Heatmap",
            "R: Reset Simulation",
        ], "topright", lines);
        
        // Bottom right: Target Info
        if(this.sim.selectedBird != null) {
            if(this.sim.selectedBird.alive) {
                this.writeBirdInfo(this.sim.selectedBird, lines);   
            } else {
                this.sim.selectedBird = null;
            }
            
        }
    }
    
    writeBirdInfo(bird, lines) {
        this.writeText([
            "Species: " + bird.species,
            "Max Speed: " + bird.getSpeciesInfo().maxSpeed,
            "Sight Range: " + bird.getSpeciesInfo().sight,
            "",
            "State: " + State.nameOf(bird.state),
            "Position: " + bird.pos.toString(true),
            "Speed: " + Math.round(bird.velocity.magnitude() * 100) / 100,
            "Food: " + bird.food + "/" + bird.getSpeciesInfo().foodCapacity,
            "Success: " + (bird.successStep >= 0 ? "Yes (" + bird.successStep + ")" : "No"),
            "Id: " + bird.id
        ], "botright", lines);  
    }
    
    writeText(text, corner, lines) {
        if(Array.isArray(text)) {
            if(corner == "botleft" || corner == "botright") {
                for(let i = text.length - 1; i >= 0; --i) {
                    this.writeText(text[i], corner, lines); 
                }
            } else {
                for(let i = 0; i < text.length; ++i) {
                    this.writeText(text[i], corner, lines); 
                }
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