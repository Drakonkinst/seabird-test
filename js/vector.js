/**
 * Represents a 2D vector.
 * 
 * Written by Drakonkinst
 * Reference: https://evanw.github.io/lightgl.js/docs/vector.html
 */
export class Vector {
    /**
     * Constructs a Vector object.
     * @param {number} x The x-coordinate.
     * @param {number} y The y-coordinate.
     */
    constructor(x, y) {
        this.x = x || 0.0;
        this.y = y || 0.0;
    }

    /**
     * Static builder for a Vector object, for different notation.
     * 
     * @param {number} x The x-coordinate.
     * @param {number} y The y-coordinate.
     */
    static of(x, y) {
        return new Vector(x, y);
    }
    
    /**
     * Creates a random unit vector by initializing a unit vector
     * then rotating it by a random angle.
     * 
     * @returns A random unit vector.
     */
    static random() {
        let v = new Vector(1.0, 0.0);
        v.rotate(Math.random() * 2.0 * Math.PI);
        return v;
    }

    /**
     * Creates a copy of the vector.
     * 
     * @returns {Vector} A copy of the vector.
     */
    copy() {
        return new Vector(this.x, this.y);
    }
    
    /**
     * Sets the vector to the given values.
     * 
     * @param {number} x The x-coordinate.
     * @param {number} y The y-coordinate.
     * @returns {Vector} The current vector.
     */
    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }
    
    /**
     * Sets the vector to the given vector's values.
     * 
     * @param {Vector} vector The vector to set the values to.
     * @returns {Vector} The current vector.
     */
    setToVector(vector) {
        this.x = vector.x;
        this.y = vector.y;
        return this;
    }
    
    /**
     * Sets the vector's values to zero.
     * 
     * @returns The current vector.
     */
    setZero() {
        this.x = 0.0;
        this.y = 0.0;
        return this;
    }

    /**
     * Adds the vector with another vector. This modifies the current vector.
     * 
     * @param {Vector} vector The other vector to add.
     * @returns {Vector} The current vector.
     */
    add(vector) {
        this.x += vector.x;
        this.y += vector.y;
        return this;
    }

    /**
     * Subtracts another vector from the current vector. This modifies the
     * current vector.
     * 
     * @param {Vector} vector The other vector to subtract.
     * @returns {Vector} The current vector.
     */
    subtract(vector) {
        this.x -= vector.x;
        this.y -= vector.y;
        return this;
    }

    /**
     * Multiplies all entries of the vector by a scalar value. This modifies
     * the current vector. Duplicate of Vector::scale.
     * 
     * @param {number} factor The factor to multiply the vector by.
     * @returns {Vector} The current vector.
     */
    multiply(factor) {
        return this.scale(factor);
    }

    /**
     * Divides all entries of the vector by a scalar value. This modifies the
     * current vector.
     * 
     * @param {number} factor The factor to divide the vector by.
     * @returns {Vector} The current vector.
     */
    divide(factor) {
        this.x /= factor;
        this.y /= factor;
        return this;
    }

    /**
     * Negates all entries of the vector. This modifies the current vector.
     * 
     * @returns {Vector} The current vector.
     */
    negate() {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    }

    /**
     * Multiplies all entries of the vector by a scalar value. This modifies
     * the current vector.
     * 
     * @param {number} factor The factor to multiply the vector by.
     * @returns {Vector} The current vector.
     */
    scale(factor) {
        this.x *= factor;
        this.y *= factor;
        return this;
    }

    /**
     * Scales the vector to match the given magnitude. This modifies the
     * current vector. Has the same effect as normalizing the vector then
     * scaling it by the given magnitude.
     * 
     * @param {number} magnitude The desired magnitude of the vector.
     * @returns {Vector} The current vector.
     */
    scaleToMagnitude(magnitude) {
        const currMagnitude = this.magnitude();
        if(currMagnitude <= 0.0) {
            // multiply by 0
            return this;
        }
        return this.scale(magnitude / currMagnitude);
    }

    /**
     * Returns the normalized vector of the current vector. This modifies the
     * current vector.
     * 
     * @returns {Vector} The normalized vector.
     */
    normalize() {
        return this.divide(this.magnitude());
    }

    /**
     * Returns dot product of the current vector with another vector.
     * 
     * @param {Vector} vector The other vector to take the dot product with.
     * @returns {number} The dot product of the current vector with another
     *                   vector.
     */
    dot(vector) {
        return this.x * vector.x + this.y * vector.y;
    }

    /**
     * Returns the magnitude of the vector.
     * 
     * @returns {number} The magnitude of the vector.
     */
    magnitude() {
        return Math.sqrt(this.magnitudeSquared());
    }

    /**
     * Returns the squared magnitude of the vector.
     * 
     * @returns {number} The squared magnitude of the vector.
     */
    magnitudeSquared() {
        return this.dot(this);
    }

    /**
     * Returns the squared distance between the current vector and another
     * vector.
     * 
     * @param {Vector} vector The vector to calculate the squared distance
     *                        between.
     * @returns {number} The squared distance between the current vector
     *                   and another vector.
     */
    distanceSquared(vector) {
        const deltaX = this.x - vector.x;
        const deltaY = this.y - vector.y;
        return deltaX * deltaX + deltaY * deltaY;
    }

    /**
     * Returns the distance between the current vector and another vector.
     * 
     * @param {Vector} vector The vector to calculate the distance between.
     * @returns {number} The distance between the current vector and another
     *                   vector.
     */
    distance(vector) {
        return Math.sqrt(this.distanceSquared(vector));
    }
    
    /**
     * Rotates the vector by the given radians.
     * 
     * @param {number} radians The angle to rotate in radians.
     * @returns The current vector.
     */
    rotate(radians) {
        const ca = Math.cos(radians);
        const sa = Math.sin(radians);
        const newX = ca * this.x - sa * this.y;
        const newY = sa * this.x + ca * this.y;
        this.x = newX;
        this.y = newY;
        return this;
    }

    /**
     * Prints the vector in the form (x, y).
     * 
     * @param {boolean} shouldRound True if vector entries should be rounded to
     *                              the nearest integer.
     * @returns {string} "(x, y)"
     */
    toString(shouldRound) {
        if(shouldRound) {
            return "(" + Math.round(this.x) + ", " + Math.round(this.y) + ")";
        }
        return "(" + this.x + ", " + this.y + ")";
    }
}