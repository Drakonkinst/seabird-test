function hexToInt(hexColor) {
    return parseInt(hexColor.substring(1), 16);
}

function intToHex(i) {
    let bbggrr = ("000000" + i.toString(16)).slice(-6);
    let rrggbb = bbggrr.substr(4, 2) + bbggrr.substr(2, 2) + bbggrr.substr(0, 2);
    return "#" + rrggbb;
}

export class ImageHandler {
    constructor(srcPath, unitsPerPixel, callback, legend) {
        this.loadPixelData(srcPath, unitsPerPixel, callback);
        this.loadMapLegend(legend);
    }
    
    loadPixelData(srcPath, unitsPerPixel, callback) {
        let img = document.createElement("img");
        let self = this;
        img.onload = () => self.onImageLoad(callback, unitsPerPixel, img);
        img.src = srcPath;
        console.log("Image loading...");
    }
    
    onImageLoad(callback, unitsPerPixel, img) {
        console.log("Image loaded!");
        let canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        this.imgWidth = img.width;
        this.imgHeight = img.height;
        this.worldWidth = this.imgWidth * unitsPerPixel;
        this.worldHeight = this.imgHeight * unitsPerPixel;
        this.unitsPerPixel = unitsPerPixel;
        canvas.getContext("2d").drawImage(img, 0, 0, img.width, img.height);
        let pixelData = canvas.getContext("2d").getImageData(0, 0, img.width, img.height).data;
        this.processColors(pixelData);
        callback();
    }
    
    processColors(pixelData) {
        this.colorData = [];
        for(let i = 0; i < pixelData.length; i += 4) {
            const red = pixelData[i];
            const green = pixelData[i + 1];
            const blue = pixelData[i + 2];
            // Go forth o mighty bitwise operations, and bring us victory
            let rgb = (red << 16) + (green << 8) + blue;
            this.colorData.push(rgb);
        }
    }
    
    loadMapLegend(legend) {
        this.legend = {};
        for(let k in legend) {
            if(legend.hasOwnProperty(k)) {
                this.legend[hexToInt(k)] = legend[k];
            }
        }
    }
    
    getRegionAtPixel(mapX, mapY) {
        if(mapX < 0 || mapX >= this.imgWidth || mapY < 0 || mapY >= this.imgHeight) {
            return null;
        }
        const index = mapY * this.imgWidth + mapX;
        return this.getRegionAtIndex(index);
    }
    
    getRegionAtIndex(index) {
        const color = this.colorData[index];
        if(this.legend.hasOwnProperty(color)) {
            return this.legend[color];
        }
        throw new Error("Legend has no definition for color " + intToHex(color));
    }
    
    getRegionAtPos(vector) {
        return this.getRegionAtPoint(vector.x, vector.y);
    }
    
    getRegionAtPoint(x, y) {
        const mapX = Math.floor(x / this.unitsPerPixel);
        const mapY = Math.floor(y / this.unitsPerPixel);
        return this.getRegionAtPixel(mapX, mapY);
    }
}