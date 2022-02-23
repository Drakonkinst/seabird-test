import { Vector } from "./vector.js";
import { toRadians } from "./utils.js";

const MAX_FORCE = 0.1;
const WANDER_CIRCLE_DISTANCE = 1.0;     // indirectly modifies wander force
const WANDER_CIRCLE_RADIUS = 1.0;       // indirectly modifies wander angle change
const MAX_ANGLE_CHANGE = toRadians(15);
const TWO_PI = Math.PI * 2.0;

function truncate(vector, max) {
    if(vector.magnitudeSquared() > max * max) {
        vector.scaleToMagnitude(max);
    }
}

export class Steering {
    constructor(bird) {
        this.host = bird;
        this.wanderAngle = Math.random() * TWO_PI;
        this.steering = new Vector();
    }
    
    update() {
        let host = this.host;
        truncate(this.steering, MAX_FORCE);
        host.velocity.add(this.steering);
        truncate(host.velocity, host.getMaxSpeed());
        host.pos.add(host.velocity);
        this.reset();
    }
    
    reset() {
        this.steering.setZero();
    }
    
    seek(targetPos, slowingRadius = 20) {
        if(targetPos == null) {
            console.warn(this.host.id + " received null seek command!");
            return;
        }
        let host = this.host;
        let distance = host.pos.distance(targetPos);
        let seekForce = targetPos.copy().subtract(host.pos);
        let maxVelocity = host.getMaxSpeed();
        
        if(distance < slowingRadius) {
            seekForce.scaleToMagnitude(maxVelocity * (distance / slowingRadius));
        } else {
            seekForce.scaleToMagnitude(maxVelocity);
        }
        
        this.steering.add(seekForce.subtract(host.velocity));
    }
    
    flee() {
        let host = this.bird;
        let fleeForce = host.pos.copy()
            .subtract(targetPos)
            .scaleToMagnitude(host.getMaxSpeed())
            .subtract(host.velocity);
        this.steering.add(fleeForce);
    }
    
    wander() {
        let circleCenter = this.host.velocity.copy().scaleToMagnitude(WANDER_CIRCLE_DISTANCE);
        this.wanderAngle += Math.random() * (MAX_ANGLE_CHANGE * 2.0) - MAX_ANGLE_CHANGE;
        this.wanderAngle %= TWO_PI;
        
        let displacement = Vector.of(
            Math.cos(this.wanderAngle),
            Math.sin(this.wanderAngle)
        ).scale(WANDER_CIRCLE_RADIUS);
        
        // Add wander force
        let wanderForce = circleCenter.add(displacement);
        this.steering.add(wanderForce);
    }
    
    setWanderAngleTowards(towards) {
        this.wanderAngle = Math.atan2(towards.y - this.host.pos.y, towards.x - this.host.pos.x);
    }
    
    setWanderAngle(radians) {
        this.wanderAngle = radians;
    }
}