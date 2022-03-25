import { Steering } from "./steering.js";
import { Vector } from "./vector.js";
import {
    generateRandomId,
    getCardinalDirection,
    toRadians,
    inBounds,
    randRange,
    withinDistance
} from "./utils.js";

// Constants for boundary avoidance
const AVOID_ANGLE = toRadians(45);
const LOOK_AHEAD_MULTIPLIER = 60;
const SUCCESS_DISTANCE = 5.0;

export class Bird {
    constructor(sim, species, x = 0, y = 0) {
        if(sim.getBirdInfo(species) == null) {
            throw new Error("Unknown bird species \"" + species + "\"!");
        }
        
        this.id = generateRandomId();
        this.sim = sim;
        this.species = species;
        this.pos = Vector.of(x, y);
        this.velocity = Vector.of(Math.random(), Math.random());
        this.steering = new Steering(this);
        this.facing = 0.0;
        this.refreshFacing();
        
        this.successStep = -1;
        this.state = new LevyFlightState(this);
        //this.state = new WanderState();
    }
    
    update() {
        this.doBehavior();
        this.steering.update();
        this.refreshFacing();
    }
    
    refreshFacing() {
        if(this.velocity.magnitudeSquared() != 0.0) {
            this.facing = Math.atan2(this.velocity.y, this.velocity.x);
        }
    }
    
    doBehavior() {
        if(this.successStep > 0) {
            // Do nothing
            return;
        }
        
        let isAvoiding = this.avoidBoundaries();
        if(!isAvoiding) {
            this.state = this.state.execute(this);
            if(this.state == null) {
                throw new Error("State transition to null");
            }
        }
    }
    
    avoidBoundaries() {
        let lookAhead = this.velocity.copy()
            //.scaleToMagnitude(this.getMaxSpeed() * LOOK_AHEAD_MULTIPLIER)
            .scale(LOOK_AHEAD_MULTIPLIER)
            .add(this.pos);
        if(!inBounds(lookAhead.x, lookAhead.y, this.sim.world)) {
            let rotationOffset = randRange(-AVOID_ANGLE, AVOID_ANGLE);
            /*
            // Set direction away from boundary instantly
            this.velocity.setToVector(getCardinalDirection(this.velocity))
                .negate()
                .rotate(rotationOffset);
            this.refreshFacing();
            this.steering.setWanderAngle(this.facing);
            */
           
            // Smoother boundary avoidance
            // Can optionally wrap this in cardinal direction
            let newTarget = this.velocity.copy()
                .negate()
                .rotate(rotationOffset)
                .scaleToMagnitude(this.velocity.magnitude())
                .add(this.pos);
            this.steering.seek(newTarget, 0);
            this.steering.setWanderAngleTowards(newTarget);
            return true;
        }
        return false;
    }
    
    onSuccess() {
        // Record current simulation step
        this.successStep = this.sim.step;
        this.sim.registerSuccess(this.species, this.successStep);

        // Stop moving
        this.velocity.setZero();
        this.steering.reset();
    }
    
    getMaxSpeed() {
        const value = this.getSpeciesInfo().maxSpeed;
        if(value == null) {
            console.warn("Maximum speed for species \"" + this.species + "\" is not defined!");
        }
        return value;
    }
    
    getColor() {
        const value = this.getSpeciesInfo().color;
        if(value == null) {
            console.warn("Color for species \"" + this.species + "\" is not defined!");
        }
        return value;
    }
    
    getSight() {
        const value = this.getSpeciesInfo().sight;
        if(value == null) {
            console.warn("Sight for species \"" + this.species + "\" is not defined!");
        }
        return value;
    }
    
    getSpeciesInfo() {
        return this.sim.getBirdInfo(this.species);
    }
    
    static getLookAheadMultiplier() {
        return LOOK_AHEAD_MULTIPLIER;
    }
}

export class State {
    static nameOf(state) {
        if(state instanceof SeekState) {
            return "Seeking";
        } else if(state instanceof SearchState) {
            return "Searching";
        } else if(state instanceof RestState) {
            return "Resting";
        }
    }
    
    // Returns the next state (which can be itself)
    execute(bird) {
        
    }
}

class SeekState extends State {
    constructor(preyPatch) {
        super();
        this.target = preyPatch;
    }
    
    execute(bird) {
        bird.steering.seek(this.target.pos);
        const distSq = bird.pos.distanceSquared(this.target.pos);
        if(distSq <= SUCCESS_DISTANCE) {
            bird.onSuccess();
            this.target.onBirdArrive();
            return new RestState();
        }
        return this;
    }
}

class SearchState extends State {
    constructor() {
        super();
    }
    
    execute(bird) {
        // Check for prey patches within sight
        let closestPreyPatch = null;
        let closestDistanceSq = Number.MAX_VALUE;
        for(let preyPatch of bird.sim.world.preyPatches) {
            let minDistance = bird.getSight() + preyPatch.radius;
            if(withinDistance(bird.pos, preyPatch.pos, minDistance)) {
                // Can see this prey patch
                const distSq = bird.pos.distanceSquared(preyPatch.pos);
                if(distSq < closestDistanceSq) {
                    // Closer than any previous
                    closestPreyPatch = preyPatch;
                    closestDistanceSq = distSq;
                }
            }
        }

        if(closestPreyPatch != null) {
            return new SeekState(closestPreyPatch);
        }

        return this;
    }
}

// Search state where the bird wanders randomly
class WanderState extends SearchState {
    constructor() {
        super();
    }
    
    execute(bird) {
        bird.steering.wander();
        return super.execute(bird);
    }
}

const LEVY_FLIGHT_SUCCESS_DISTANCE = 5.0;
const MAX_ATTEMPTS = 10;
const FRACTAL_DIMENSION = 1.4;
const LEVY_DISTANCE_SCALING_FACTOR = 100;
class LevyFlightState extends SearchState {
    constructor(bird) {
        super();
        this.targetPos = this.chooseTargetPos(bird);
    }
    
    execute(bird) {
        let searchResultState = super.execute(bird);
        if(searchResultState != this) {
            // Leave search state
            return searchResultState;
        }
        
        let distSq = bird.pos.distanceSquared(this.targetPos);
        if(distSq <= LEVY_FLIGHT_SUCCESS_DISTANCE * LEVY_FLIGHT_SUCCESS_DISTANCE) {
            this.targetPos = this.chooseTargetPos(bird);
        }
        bird.steering.seek(this.targetPos);
        return this;
    }
    
    chooseTargetPos(bird) {
        let attempts = 0;
        let potentialTarget = null;
        do {
            potentialTarget = Vector.random()
                .scale(this.randomMagnitude() * LEVY_DISTANCE_SCALING_FACTOR)
                .add(bird.pos);
        } while(++attempts < MAX_ATTEMPTS && !inBounds(potentialTarget.x, potentialTarget.y, bird.sim.world));
        if(attempts >= MAX_ATTEMPTS) {
            console.log("failed");
        }
        return potentialTarget;
    }
    
    randomMagnitude() {
        const x = Math.random();
        const y = Math.pow(1 - x, -1 / FRACTAL_DIMENSION);
        return y;
    }
}

class RestState extends State {
    execute(bird) {
        // Do nothing
        return this;
    }
}