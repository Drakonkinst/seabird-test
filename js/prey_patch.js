import { Vector } from "./vector.js";
import { generateRandomId } from "./utils.js";

export class PreyPatch {
    constructor(sim, x = 0, y = 0, radius = 32) {
        this.id = generateRandomId();
        this.sim = sim;
        this.pos = Vector.of(x, y);
        this.radius = radius;
    }
}