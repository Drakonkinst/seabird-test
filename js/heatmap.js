export class Heatmap {
    constructor(cellSize, width, height, colors) {
        this.cellSize = cellSize;
        this.width = width;
        this.height = height;
        this.currMax = 0;
        this.createGrid();
        this.setupColors(colors);
    }

    createGrid() {
        this.sizeX = Math.ceil(this.width / this.cellSize);
        this.sizeY = Math.ceil(this.height / this.cellSize);
        this.numCells = this.sizeX * this.sizeY;
        //console.log("Creating a " + this.sizeX + " by " + this.sizeY + " heatmap with " + this.numCells + " cells total");
        this.data = [];
        for(let i = 0; i < this.numCells; ++i) {
            this.data.push(0);
        }
    }
    
    setupColors(colors) {
        this.colorValues = [];
        for(let k in colors) {
            if(colors.hasOwnProperty(k)) {
                let color = k;
                let value = colors[k];
                this.colorValues.push([color, value]);
            }
        }
        this.colorValues.sort(function(a, z) {
            return z[1] - a[1];
        });
    }
    
    applyAll(arr) {
        for(let obj of arr) {
            this.apply(obj);
        }
    }
    
    apply(obj) {
        let index = this.getIndexForWorldPos(obj.pos.x, obj.pos.y);
        if(index < 0) {
            return;
        }
        let newValue = ++this.data[index];
        if(newValue > this.currMax) {
            this.currMax = newValue;
        }
    }
    
    getColorAtPoint(x, y) {
        if(this.outOfBounds(x, y)) {
            return null;
        }
        return this.getColor(this.data[this.getIndex(x, y)]);
    }
    
    getColor(value) {
        let percent = value / this.currMax;
        for(let i = 0; i < this.colorValues.length; ++i) {
            if(percent >= this.colorValues[i][1]) {
                return this.colorValues[i][0];
            }
        }
        // Blank
        return null;
    }
    
    getIndexForWorldPos(worldX, worldY) {
        let x = Math.floor(worldX / this.cellSize);
        let y = Math.floor(worldY / this.cellSize);
        return this.getIndex(x, y);
    }
    
    getIndex(x, y) {
        if(this.outOfBounds(x, y)) {
            return -1;
        }
        let index = y * this.sizeX + x;
        return index;
    }
    
    outOfBounds(x, y) {
        return x < 0 || x >= this.sizeX || y < 0 || y >= this.sizeY; 
    }
}