var lat = 0;
var lon = 0;
var zoom = 1;

var ww = 1024
var hh = 512

function preload() {
    // mapbox://styles/mxmoss/ck7dr7n3v1nmo1jmo212z0n8n
    mapimg = loadImage("https://api.mapbox.com/styles/v1/mxmoss/ck7dr7n3v1nmo1jmo212z0n8n/static/"
        + lat + ","
        + lon + ","
        + zoom + "/" 
        + ww + "x"
        + hh + 
        "?access_token=pk.eyJ1IjoibXhtb3NzIiwiYSI6ImNrN2RxbTh5NDAweDUzbXBqdGk4Y3Q3MG4ifQ.uBvsy989d4CXwYafGzkVGQ") }

function setup() {
    createCanvas(ww, hh);
    image(mapimg, 0, 0);
}

