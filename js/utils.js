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

// https://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
export function createCSVData(columns, dataRows) {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add column names
    csvContent += columns.join(',') + "\r\n";
    
    // Add row data
    for(let row of dataRows) {
        csvContent += row.join(',') + "\r\n";
    }
    return csvContent;
}

export function promptFileDownload(fileName, text) {
    const encodedURI = encodeURI(text);
    const link = document.createElement("a");
    link.setAttribute("href", encodedURI);
    link.setAttribute("download", fileName);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// https://stackoverflow.com/questions/44484882/download-with-current-user-time-as-filename
export function getFormattedTime() {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth() + 1; // JavaScript months are 0-based.
    const d = today.getDate();
    const h = String(today.getHours()).padStart(2, '0');
    const mi = String(today.getMinutes()).padStart(2, '0');
    const s = String(today.getSeconds()).padStart(2, '0');
    return m + "-" + d + "-" + y + "-" + h + mi + s;
}