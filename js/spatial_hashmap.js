import { Vector } from "./vector.js";

/**
 * Represents two integers. Can be used as a key for hashing since its
 * toString() method is automatically called whenever the object is used as a
 * key or property.
 */
export class IntPair {
    /**
     * Constructs an IntPair object.
     * 
     * @param {number} x The x-coordinate.
     * @param {number} y The y-coordinate.
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Gets the IntPair object from its string representation.
     * 
     * @param {string} str The string representation of this IntPair.
     * @returns {IntPair} The IntPair representation of the given string. 
     */
    static fromString(str) {
        let args = str.split(" ");
        return new IntPair(parseInt(args[0]), parseInt(args[1]));
    }

    /**
     * Returns a string of the given coordinates as a key.
     * @param {number} x The x-coordinate.
     * @param {number} y The y-coordinate.
     */
    static keyString(x, y) {
        return x + " " + y;
    }

    /**
     * Returns a string representation of this IntPair.
     * 
     * @returns {string} A string representation of this IntPair.
     */
    toString() {
        return IntPair.keyString(this.x, this.y);
    }
}

/**
 * Represents a collection of GameObjects in 2D space, using a HashMap with
 * IntPair objects as keys.
 * 
 * GameObjects are defined by having the following attributes:
 * - Vector pos: Their position in the world
 */
const OVERLAP = 1;
export class SpatialHashMap {
    /**
     * Constructs a SpatialHashMap object.
     * 
     * @param {number}  cellSize  The size of each cell (or chunk). 
     * @param {boolean} fillNearby Whether surrounding cells should also
     *                            contain a duplicate of the stored object.
     */
    constructor(cellSize, fillNearby = false) {
        this.cellSize = cellSize;
        this.map = {};
        this.fillNearby = fillNearby;
        this.size = 0;
    }

    /**
     * Creates a key for the given vector.
     * 
     * @param {Vector} vector The vector to find a key for.
     * @returns {IntPair} The key for the given vector.
     */
    key(vector) {
        let cellSize = this.cellSize;
        return new IntPair(~~(vector.x / cellSize), ~~(vector.y / cellSize));
    }

    /**
     * Inserts an object at the given key.
     * 
     * @param {GameObject}     obj The object to insert.
     * @param {IntPair|string} key The key to insert the object at.
     */
    insertAtKey(obj, key) {
        let map = this.map;

        if(!map.hasOwnProperty(key)) {
            map[key] = [];
        }
        map[key].push(obj);
        this.size++;
    }

    /**
     * Inserts an object into the HashMap. If fillNearby is true, then it
     * also inserts the object into the immediately surrounding keys.
     * 
     * @param {GameObject} obj The object to insert.
     * @returns {IntPair} The primary key.
     */
    insert(obj) {
        let key = this.key(obj.pos);
        let x = key.x;
        let y = key.y;
        if(this.fillNearby) {
            // Fill all adjacent squares
            for(let i = -OVERLAP; i <= OVERLAP; i++) {
                key.x = x + i;
                for(let j = -OVERLAP; j <= OVERLAP; j++) {
                    key.y = y + j;
                    // Uses string representation of key
                    this.insertAtKey(obj, key.toString());
                }
            }
        } else {
            // Fill only single square
            this.insertAtKey(obj, key);
        }
        return key;
    }

    /**
     * Gets the list of objects at the single key associated with the vector.
     * 
     * @param {Vector} vector The vector to query.
     * @returns {Array<GameObject>} A list of objects.
     */
    querySingle(vector) {
        return this.getFromKey(this.key(vector));
    }

    /**
     * Gets the list of objects within the bounding box given by a center
     * vector and a rectangular distance. While this works for all use cases,
     * other querying methods may be more efficient for smaller queries.
     * 
     * @param {Vector} vector   The vector to query. 
     * @param {number} distance The rectangular distance from the vector to
     *                          query.
     * @returns {Array<GameObject>} A list of objects.
     */
    queryDynamic(vector, distance) {
        let keyMin = this.key(Vector.of(vector.x - distance, vector.y - distance));
        let keyMax = this.key(Vector.of(vector.x + distance, vector.y + distance));
        let list = [];

        for(let i = keyMin.x; i <= keyMax.x; i++) {
            for(let j = keyMin.y; j <= keyMax.y; j++) {
                let newKey = IntPair.keyString(i, j);
                this.queryCollect(newKey, list);
            }
        }
        return list;
    }

    /**
     * Gets the list of objects at the key associated with the vector and
     * its 8 immediately surrounding keys.
     * 
     * @param {Vector} vector The vector to query. 
     * @returns {Array<GameObject>} A list of objects.
     */
    queryNearby(vector) {
        let key = this.key(vector);
        let list = [];
        for(let i = -OVERLAP; i <= OVERLAP; i++) {
            for(let j = -OVERLAP; j <= OVERLAP; j++) {
                let newKey = IntPair.keyString(key.x + i, key.y + j);
                this.queryCollect(newKey, list);
            }
        }
        return list;
    }

    /**
     * Collects all objects stored at a key to the given list.
     * 
     * @param {IntPair|string} key The key to collect.
     * @param {Array<GameObject>} list A list of objects.
     */
    queryCollect(key, list) {
        Array.prototype.push.apply(list, this.getFromKey(key));
    }

    /**
     * Gets the list of objects associated with a given key.
     * 
     * @param {IntPair|string} key The key to access.
     * @return {Array<GameObject>} A list of objects.
     */
    getFromKey(key) {
        return this.map[key] || [];
    }

    /**
     * Removes an object at the given key.
     * 
     * @param {GameObject}     obj The object to remove. 
     * @param {IntPair|string} key The key to remove the object at.
     */
    removeAtKey(obj, key) {
        let list = this.map[key];
        if(list != null) {
            let index = list.indexOf(obj);
            if(index > -1) {
                list.splice(index, 1);
                this.size--;
            }
        } else {
            debug("Failed to remove at " + key);
        }
    }

    /**
     * Removes an object from the HashMap. If fillNearby is true, then it also
     * removes the object from the surrounding keys.
     * 
     * @param {GameObject} obj The object to remove.
     * @returns {GameObject} The removed object.
     */
    remove(obj) {
        let key = this.key(obj.pos);
        if(this.fillNearby) {
            for(let i = -OVERLAP; i <= OVERLAP; i++) {
                for(let j = -OVERLAP; j <= OVERLAP; j++) {
                    // uses string representation of key
                    this.removeAtKey(obj, IntPair.keyString(key.x + i, key.y + j));
                }
            }
        } else {
            this.removeAtKey(obj, key);
        }
        return obj;
    }

    /**
     * Removes all keys associated with empty lists from the HashMap.
     */
    clean() {
        for(let k in this.map) {
            if(this.map.hasOwnProperty(k)) {
                if(this.map[k].length <= 0) {
                    delete this.map[k];
                }
            }
        }
    }

    /**
     * Clears all entries from the HashMap.
     */
    clear() {
        this.map = {};
        this.size = 0;
    }
}