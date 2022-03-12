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
    }
    
    update(world) {
        this.doBehavior(world);
        this.steering.update();
        this.refreshFacing();
    }
    
    refreshFacing() {
        if(this.velocity.magnitudeSquared() != 0.0) {
            this.facing = Math.atan2(this.velocity.y, this.velocity.x);
        }
    }
    
    doBehavior() {
        // Simple straightforward (and non-configurable) AI for now
        // We can move this to task-based modules later
        
        if(this.successStep > 0) {
            // Do nothing
            return;
        }
        
        let isAvoiding = this.avoidBoundaries();
        if(!isAvoiding) {
            // Check for prey patches within sight
            let closestPreyPatch = null;
            let closestDistanceSq = Number.MAX_VALUE;
            for(let preyPatch of this.sim.world.preyPatches) {
                let minDistance = this.getSight() + preyPatch.radius;
                if(withinDistance(this.pos, preyPatch.pos, minDistance)) {
                    // Can see this prey patch
                    let distSq = this.pos.distanceSquared(preyPatch.pos);
                    if(distSq < closestDistanceSq) {
                        // Closer than any previous
                        closestPreyPatch = preyPatch;
                        closestDistanceSq = distSq;
                    }
                }
            }
            
            if(closestPreyPatch != null) {
                // Seek with automatic slowing
                this.steering.seek(closestPreyPatch.pos);
                if(closestDistanceSq <= SUCCESS_DISTANCE) {
                    // Record current simulation step
                    this.successStep = this.sim.step;
                    this.sim.registerSuccess(this.species, this.successStep);
                    
                    // Stop moving
                    this.velocity.setZero();
                    this.steering.reset();
                }
            } else {
                // Wander normally
                this.steering.wander();
            }
        }
    }
    
    avoidBoundaries() {
        let lookAhead = this.velocity.copy()
            .scaleToMagnitude(this.getMaxSpeed() * LOOK_AHEAD_MULTIPLIER)
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
    
    getMaxSpeed() {
        const value = this.sim.getBirdInfo(this.species).maxSpeed;
        if(value == null) {
            console.warn("Maximum speed for species \"" + this.species + "\" is not defined!");
        }
        return value;
    }
    
    getColor() {
        const value = this.sim.getBirdInfo(this.species).color;
        if(value == null) {
            console.warn("Color for species \"" + this.species + "\" is not defined!");
        }
        return value;
    }
    
    getSight() {
        const value = this.sim.getBirdInfo(this.species).sight;
        if(value == null) {
            console.warn("Sight for species \"" + this.species + "\" is not defined!");
        }
        return value;
    }
    
    static getLookAheadMultiplier() {
        return LOOK_AHEAD_MULTIPLIER;
    }
}