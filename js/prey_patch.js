import { Vector } from "./vector.js";
import { generateRandomId } from "./utils.js";

const EXPANSION_PER_BIRD = 5;

let nextName = 1;

export class PreyPatch {
    constructor(sim, x = 0, y = 0, radius = 32) {
        this.id = generateRandomId();
        this.name = nextName++;
        this.sim = sim;
        this.pos = Vector.of(x, y);
        this.radius = radius;
        this.numBirds = 0;
    }
    
    onBirdArrive() {
        ++this.numBirds;
        this.radius += EXPANSION_PER_BIRD;
    }
}