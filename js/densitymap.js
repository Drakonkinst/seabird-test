import { randRange } from "./utils.js";

const DEEP_OCEAN = 2;
const OCEAN = 1;
const LAND = 0;

const DECAY = 0.2;

export class DensityMap {
    constructor(image, ridgeDistance, ridgeWeight, unitsPerPixel) {
        const ridgeSteps = Math.floor(ridgeDistance / unitsPerPixel);
        //console.log("# Ridge Steps: " + ridgeDistance + " / " + unitsPerPixel + " = " + ridgeSteps);
        this.width = image.imgWidth;
        this.height = image.imgHeight;
        this.unitsPerPixel = unitsPerPixel;
        this.identityMap = [];
        this.densityMap = [];

        this.populateMap(image);
        this.applyRidge(ridgeWeight);
        this.extendRidge(ridgeWeight, ridgeSteps);
        
        this.flattenDensityMap();
        this.identityMap = null;
    }

    populateMap(image) {
        let identityCol = null;
        let densityCol = null;
        for(let i = 0; i < image.colorData.length; ++i) {
            if(i % this.width == 0) {
                if(identityCol != null) {
                    this.identityMap.push(identityCol);
                    this.densityMap.push(densityCol);
                }
                identityCol = [];
                densityCol = [];
            }

            let region = image.getRegionAtIndex(i);
            if(region == "deep_ocean") {
                densityCol.push(1);
                identityCol.push(DEEP_OCEAN);
            } else if(region == "ocean") {
                densityCol.push(1);
                identityCol.push(OCEAN);
            } else {
                densityCol.push(0);
                identityCol.push(LAND);
            }
        }
        if(identityCol != null && identityCol.length > 0) {
            this.identityMap.push(identityCol);
            this.densityMap.push(densityCol);
        }
    }

    applyRidge(ridgeWeight) {
        for(let y = 0; y < this.height; ++y) {
            for(let x = 0; x < this.width; ++x) {
                if(this.onRidge(x, y)) {
                    this.densityMap[y][x] *= ridgeWeight;
                }
            }
        }
    }

    extendRidge(ridgeWeight, ridgeSteps) {
        for(let i = 0; i < ridgeSteps; ++i) {
            ridgeWeight *= DECAY;
            if(ridgeWeight <= 1) {
                //console.log("Early stop " + (i + 1));
                return;
            }
            //console.log("Step " + (i + 1));
            for(let y = 0; y < this.height; ++y) {
                for(let x = 0; x < this.width; ++x) {
                    if(this.densityMap[y][x] != 1) {
                        continue;
                    }
                    if(this.hasLargeNeighbor(x, y, ridgeWeight / DECAY)) {
                        this.densityMap[y][x] = ridgeWeight;
                    }
                }
            }
        }
    }
    
    flattenDensityMap() {
        //console.log([...this.densityMap]);
        //console.log([...this.identityMap]);
        this.densityMap = Array.prototype.concat.apply([], this.densityMap);
        this.sum = 0;
        for(let i of this.densityMap) {
            this.sum += i;
        }
    }
    
    randomPoint() {
        let random = Math.random() * this.sum;
        let curr = 0;
        let index = 0;
        while(curr < random) {
            curr += this.densityMap[index++];
        }
        const margin = this.unitsPerPixel / 2;
        let y = Math.floor(index / this.width) * this.unitsPerPixel + randRange(0, margin);
        let x = (index % this.width) * this.unitsPerPixel + randRange(0, margin);
        return [x, y];
    }
    
    onRidge(row, col) {
        let centerId = this.identityMap[col][row];
        if(centerId == LAND) {
            return false;
        }
        let ridgeId = centerId == DEEP_OCEAN ? OCEAN : DEEP_OCEAN;
        return this.up(row, col) == ridgeId
            || this.left(row, col) == ridgeId
            || this.down(row, col) == ridgeId
            || this.right(row, col) == ridgeId
    }
    
    hasLargeNeighbor(row, col, threshold) {
        return (this.isValid(row + 1, col) && this.densityMap[col][row + 1] >= threshold)
            || (this.isValid(row - 1, col) && this.densityMap[col][row - 1] >= threshold)
            || (this.isValid(row, col + 1) && this.densityMap[col + 1][row] >= threshold)
            || (this.isValid(row, col - 1) && this.densityMap[col - 1][row] >= threshold);
    }

    up(row, col) {
        if(col <= 0) {
            return 0;
        }
        return this.identityMap[col - 1][row];
    }
    
    left(row, col) {
        if(row <= 0) {
            return 0;
        }
        return this.identityMap[col][row - 1];
    }
    
    right(row, col) {
        if(row >= this.width - 1) {
            return 0;
        }
        return this.identityMap[col][row + 1];
    }

    down(row, col) {
        if(col >= this.height - 1) {
            return 0;
        }
        return this.identityMap[col + 1][row];
    }
    
    isValid(row, col) {
        return 0 <= row && row < this.width && 0 <= col && col < this.height;
    }
}