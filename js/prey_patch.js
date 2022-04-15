import { Vector } from "./vector.js";
import { generateRandomId } from "./utils.js";

let nextName = 1;

export class PreyPatch {
    constructor(sim, x, y, radius) {
        this.id = generateRandomId();
        this.name = nextName++;
        this.sim = sim;
        this.pos = Vector.of(x, y);
        this.initialRadius = radius;
        this.radius = radius;
        // this.food = 
        this.birds = [];
    }

    static resetNames() {
        nextName = 1;
    }

    onBirdArrive(bird) {
        this.birds.push(bird);
        this.radius = this.recalculateRadius();
    }

    recalculateRadius() {
        let numBirds = this.birds.length;
        if(numBirds > 1) {
            return this.initialRadius + this.sim.config.preyPatch.time1Bonus + (numBirds - 1) * this.sim.config.preyPatch.timeNBonus;
        } else if(numBirds == 1) {
            return this.initialRadius + this.sim.config.preyPatch.time1Bonus;
        } else {
            return this.initialRadius;
        }
    }
}