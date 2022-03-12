import { Vector } from "./vector.js";

export function generateRandomId() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    );
}

export function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

const UP = new Vector(0, -1);
const DOWN = new Vector(0, 1);
const LEFT = new Vector(-1, 0);
const RIGHT = new Vector(1, 0);

export function getCardinalDirection(vector) {
    if(Math.abs(vector.y) > Math.abs(vector.x)) {
        if(vector.y > 0) {
            return DOWN;
        }
        return UP;
    } else {
        if(vector.x > 0) {
            return RIGHT;
        }
        return LEFT;
    }
}

export function inBounds(x, y, world) {
    return x >= 0 && x < world.width && y >= 0 && y < world.height;
}

export function randRange(min, max) {
    return Math.random() * (max - min) + min;
}

export function withinDistance(vectorA, vectorB, distance) {
    return Math.abs(vectorA.x - vectorB.x) <= distance
        && Math.abs(vectorA.y - vectorB.y) <= distance
        && vectorA.distanceSquared(vectorB) <= distance * distance;
}

export function mean(arr) {
    let sum = 0.0;
    for(let item of arr) {
        sum += item;
    }
    return sum / arr.length;
}