import { Vector } from "./vector.js";
import { generateRandomId } from "./utils.js";

let nextName = 1;

export class PreyPatch {
    constructor(sim, x = 0, y = 0, radius) {
        this.id = generateRandomId();
        this.name = nextName++;
        this.sim = sim;
        this.pos = Vector.of(x, y);
        this.radius = radius;
        this.numBirds = 0;
    }
    
    static resetNames() {
        nextName = 1;
    }
    
    onBirdArrive() {
        ++this.numBirds;
        if(this.numBirds == 1) {
            this.radius += this.sim.config.preyPatch.time1Bonus;
        } else {
            this.radius += this.sim.config.preyPatch.timeNBonus;
        }
    }
}