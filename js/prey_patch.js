import { Vector } from "./vector.js";
import { generateRandomId } from "./utils.js";

//const DEFAULT_INCREASE_PER_BIRD = 5;
const DEFAULT_RADIUS = 32;

let nextName = 1;

export class PreyPatch {
    constructor(sim, x = 0, y = 0, radius = DEFAULT_RADIUS) {
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
        this.radius += this.sim.config.preyPatch.increasePerBird;
    }
}