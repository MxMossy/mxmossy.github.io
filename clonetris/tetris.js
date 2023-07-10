
class GameBoard {

    constructor(rows, cols, tileSize=40, spawnArea=2) {

        this.rows = rows;
        this.cols = cols;
        this.tileSize = tileSize;
        this.spawnArea = spawnArea;

        this.boardHeight = (rows+this.spawnArea)*tileSize;   
        this.boardWidth = cols*tileSize;   

        this.playfield = new Playfield(this.rows, this.cols, this.tileSize, this.spawnArea);
        this.sketcher = new Sketcher(this.playfield);
        this.hold = new Hold();
        this.queue = new Queue();
        this.history = new BoardHistory(this.board, this.queue, this.hold);

        this.activePiece =  null;

        this.renderBoard();
    }

    renderBoard(){
        this.playfield.render();
        this.queue.renderQueue();
        this.hold.renderHold();
        this.renderActive();
    }

    renderActive(){
        if(this.activePiece){
            // draw ghost first
            let ghost = this.activePiece.copy();
            ghost.color = "rgba(161, 161, 161, 0.2)"; 
            this.shiftInstant("down",false, ghost);

            for (let i = 0; i < ghost.tiles.length; i++) {
                this.playfield.colorTile(ghost.tiles[i]);
            }

            // activePiece
            for (let i = 0; i < this.activePiece.tiles.length; i++) {
                this.playfield.colorTile(this.activePiece.tiles[i]);
            }
        }
    }

    loadPlayfield(p) {
        this.playfield = p;
        this.sketcher = new Sketcher(this.playfield);
    }

    setState(n){
        let state = this.history.getState(n);
        if(state){
            this.loadPlayfield(state.playfield.copy());
            this.queue.setQueueIndex(state.queueIndex);
            this.hold.setHold(state.holdPiece);
            this.spawnPiece(false);
            // this.activePiece = new Piece(this.queue.getCurrent());
            this.renderBoard();
        }
    }

    spawnPiece(newState=true, das=null) {
        this.activePiece = new Piece(this.queue.getCurrent());
        if(this.collisionCheck(this.activePiece, this.playfield)){
            this.activePiece = null;
            return false;
        };

        if(newState){
            this.history.addState(this.playfield.copy(), this.queue.queueIndex, this.hold.pieceName);
        }

        if(das === 'r') this.shiftInstant('right');
        else if(das === 'l') this.shiftInstant('left');

        return true;
    }

    holdPiece(){
        if(this.activePiece){
            if(this.hold.pieceName){
                let holdName = this.hold.getHold();
                this.hold.setHold(this.activePiece.name); 
                this.activePiece = new Piece(holdName);
            }
            else{
                this.hold.setHold(this.activePiece.name);
                this.queue.queueStep();
                this.spawnPiece();
            }
        }

    }

    collisionCheck(piece, playfield) {
        for (let i = 0; i < piece.tiles.length; i++) {
            let tile = piece.tiles[i];
            if(tile.y < 0 || tile.x < 0  
                || tile.y > (this.rows+this.spawnArea) - 1
                || tile.x > this.cols - 1              
                || playfield.board[tile.y][tile.x].active){
                    return true;
            }
        }
        return false;
    }

    shiftPiece(dir, p=this.activePiece){
        if(p){
            // try update
            if(dir === "left") p.move(0,-1);
            else if(dir === "right") p.move(0,1);
            else if(dir === "down") p.move(1,0);

            if(!this.collisionCheck(p, this.playfield)){
                return true;
            }

            //revert
            if(dir === "left") p.move(0,1);
            else if(dir === "right") p.move(0,-1);
            else if(dir === "down") p.move(-1,0);
        }
        return false;
    }

    shiftInstant(dir, drop=false, p=this.activePiece){
        if(p){
            if(dir === "left") while(this.shiftPiece("left", p)){
                if(drop) this.shiftInstant("down", drop, p);
            }
            else if(dir === "right") while(this.shiftPiece("right", p)){
                if(drop) this.shiftInstant("down", drop, p);
            }
            else if(dir === "down") while(this.shiftPiece("down", p)){}
        }
    }

    rotateActive(x){
        if(this.activePiece){
            let oldRot = this.activePiece.rot;
            let mod = (n, m) => ((n % m) + m) % m;
            let newRot = mod(this.activePiece.rot + x, 4);
            this.activePiece.rotate(newRot);

            let kicks;
            if(this.activePiece.name === "i") kicks = this.kickTable.i[oldRot][newRot];
            else kicks = this.kickTable.n[oldRot][newRot]; 

            // TODO null check
            if(kicks){
                // try all kicks;
                for (let i = 0; i < kicks.length; i++) {
                    let kick = kicks[i];
                    this.activePiece.move(-kick[1], kick[0]);

                    if(!this.collisionCheck(this.activePiece, this.playfield)){
                        return true;
                    }

                    // revert
                    this.activePiece.move(kick[1], -kick[0]);
                }
            };

            // revert
            this.activePiece.rotate(oldRot);
        }
        return false;
    }

    hardDrop(p=this.activePiece) {
        if(p){
            while(this.shiftPiece("down", p)){}

            this.playfield.write(this.activePiece)
            this.playfield.clearLines();
            this.queue.queueStep();
            this.spawnPiece();
        }
    }

    resetBoard() {
        this.playfield.reset();
        this.hold.setHold("");
        this.queue.reset();
        this.history.reset();
        this.spawnPiece();
        // this.activePiece = new Piece(this.queue.getCurrent());
    }

    kickTable = {
        // srs+ -- uses tetrio 180 kicks
        n :{
            0 : {
                0 : [[0,0]],
                1 : [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
                2 : [[0,0],[0,1],[1,1],[-1,1],[1,0],[-1,0]],
                3 : [[0,0],[1,0],[1,1],[0,-2],[1,-2]],
            },
            1 : {
                0 : [[0,0],[1,0],[1,-1],[0,2],[1,2]],
                1 : [[0,0]],
                2 : [[0,0],[1,0],[1,-1],[0,2],[1,2]],
                3 : [[0,0],[1,0],[1,2],[1,1],[0,2],[0,1]],
            },
            2 : {
                0 : [[0,0],[0,-1],[-1,-1],[1,-1],[-1,0],[1,0]],
                1 : [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
                2 : [[0,0]],
                3 : [[0,0],[1,0],[1,1],[0,-2],[1,-2]],
            },
            3 : {
                0 : [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
                1 : [[0,0],[-1,0],[-1,2],[-1,1],[0,2],[0,1]],
                2 : [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
                3 : [[0,0]],
            },
        },
        // TODO: use better i kicks? check the wiki
        i : {
            0 : {
                0 : [[0,0]],
                1 : [[0,0],[-2,0],[1,0],[-2,-1],[1,2]],
                2 : [[0,0]],
                3 : [[0,0],[-1,0],[2,0],[-1,2],[2,-1]],
            },
            1 : {
                0 : [[0,0],[2,0],[-1,0],[2,1],[-1,-2]],
                1 : [[0,0]],
                2 : [[0,0],[-1,0],[2,0],[-1,2],[2,-1]],
                3 : [[0,0]],
            },
            2 : {
                0 : [[0,0]],
                1 : [[0,0],[1,0],[-2,0],[1,-2],[-2,1]],
                2 : [[0,0]],
                3 : [[0,0],[2,0],[-1,0],[2,1],[-1,-2]],
            },
            3 : {
                0 : [[0,0],[1,0],[-2,0],[1,-2],[-2,1]],
                1 : [[0,0]],
                2 : [[0,0],[-2,0],[1,0],[-2,-1],[1,2]],
                3 : [[0,0]],
            },

        }
    }

}

class Playfield {
    constructor(rows, cols, tileSize, spawnArea){
        this.rows = rows;
        this.cols = cols;
        this.tileSize = tileSize;
        this.spawnArea = spawnArea;

        this.boardHeight = (rows+this.spawnArea)*tileSize;   
        this.boardWidth = cols*tileSize;   

        // initialize board
        this.board = [];
        for (let i = 0; i < this.rows+this.spawnArea; i++) {
            let row = [];
            for (let j = 0; j < this.cols; j++) {
                row.push(new Tile(j,i));
            }
            this.board.push(row);
        }

        this.canvas = document.getElementById("playfield");
        this.ctx = this.canvas.getContext("2d");
    }

    render(){
        this.canvas.width = this.boardWidth;
        this.canvas.height = this.boardHeight;
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);

        // background
        this.ctx.strokeStyle = "black";
        this.ctx.globalAlpha = 0.6;
        this.ctx.fillRect(0,0,this.canvas.width,this.spawnArea*this.tileSize);

        //spawn area
        this.ctx.globalAlpha = 1;
        this.ctx.fillRect(0,this.spawnArea*this.tileSize,this.canvas.width,this.canvas.height);

        // grid lines
        this.ctx.strokeStyle = "gray";
        this.ctx.globalAlpha = 0.25;
        this.ctx.setLineDash([10, 20, 10, 0]);
        for (let i=this.spawnArea; i < this.rows+3; i++){
            this.ctx.lineWidth = (i === this.spawnArea || i === this.rows+this.spawnArea) ? 1 : 2;
            this.ctx.beginPath();
            this.ctx.moveTo(0, i*(this.tileSize) )
            this.ctx.lineTo(this.boardWidth, i*(this.tileSize));
            this.ctx.stroke();
        }
        for (let i=0; i < this.cols+1; i++){
            this.ctx.lineWidth = (i === 0 || i === this.cols) ? 1 : 2;
            this.ctx.beginPath();
            this.ctx.moveTo(i*(this.tileSize), this.spawnArea*this.tileSize)
            this.ctx.lineTo(i*(this.tileSize), this.boardHeight);
            this.ctx.stroke();
        }
        this.ctx.globalAlpha = 1;

        // color board tiles
        for (let row = 0; row < this.board.length; row++) {
            for (let col = 0; col < this.board[row].length; col++) {
                this.colorTile(this.board[row][col]);
            }
        }
    }

    write(p){
        // write piece to board
        for (let i = 0; i < p.tiles.length; i++) {
            let tile = p.tiles[i];
            this.board[tile.y][tile.x].active = true;
            this.board[tile.y][tile.x].color = p.color;
        }
    }

    colorTile(tile) {
        if(tile.color && tile.active){
            this.ctx.fillStyle = "black";
            this.ctx.fillRect(tile.x*this.tileSize, tile.y*this.tileSize, this.tileSize, this.tileSize);
            this.ctx.fillStyle = tile.color;
            this.ctx.fillRect(tile.x*this.tileSize, tile.y*this.tileSize, this.tileSize, this.tileSize);
        }
    }

    isFull(row) {
        for (let i=0; i < row.length; i++) {
            if(!row[i].active) return false;
        }
        return true;
    }

    clearLines() {
        let newBoard = [];
        let cleared = 0;
        // check lines from bottom up and adjust 
        for(let i=this.board.length-1; i>=0; i--){
            let row = this.board[i];
            if(this.isFull(row)){
                cleared += 1;
            }
            else{
                for(let j=0; j<row.length; j++){
                    row[j].y += cleared;
                }
                newBoard.push(row)
            }
        }

        let newLines = [];
        for(let i=0; i<cleared; i++){
            let row = [];
            for (let j = 0; j < this.cols; j++) {
                row.push(new Tile(j,i));
            }
            newLines.push(row);
        }

        this.board = [...newLines, ...(newBoard.reverse())];
    }

    reset() {
        for (let row = 0; row < this.board.length; row++) {
            for (let col = 0; col < this.board[row].length; col++) {
                this.board[row][col].active = false;
            }
        }
    }

    copy(){
        let copy = new Playfield(this.rows, this.cols, this.tileSize, this.spawnArea);

        copy.board = [];
        for (let i = 0; i < this.rows+this.spawnArea; i++) {
            let row = [];
            for (let j = 0; j < this.cols; j++) {
                row.push(this.board[i][j].copy());
            }
            copy.board.push(row);
        }

        return copy;
    }

}

class Sketcher {
    mouseDown = false;
    drawMode = false;
    drawColor = "gray";
    drawRectStart;

    constructor(playfield){
        this.playfield = playfield;
        this.canvas = this.playfield.canvas;

        // add listeners
        this.canvas.addEventListener('mousedown', (e) => this.startDraw(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', (e) => this.stopDraw(e));
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    getTile(xOffset,yOffset){
        let tileX = Math.floor(xOffset / (this.playfield.tileSize));
        let tileY = Math.floor(yOffset / (this.playfield.tileSize));

        tileX = Math.min(tileX, this.playfield.cols - 1);
        tileY = Math.min(tileY, (this.playfield.rows+this.playfield.spawnArea) - 1);

        return this.playfield.board[tileY][tileX];
    }

    startDraw(e){
        let tile = this.getTile(e.offsetX, e.offsetY);

        if(tile){
            let notActive = true;
            if(this.playfield.activePiece){
                for(let i=0; i<this.playfield.activePiece.tiles.length; i++){
                    if(tile.samePos(this.playfield.activePiece.tiles[i])) notActive = false;
                }
            }
            if(notActive){
                this.drawMode = !tile.active; 
                tile.active = this.drawMode;
                tile.color = this.drawMode ? this.drawColor : null;
                this.mouseDown = true;
                if(e.which === 3){
                    this.drawRectStart = [tile.x, tile.y];
                }
                // this.renderBoard();
            }
        }
    }

    draw(e){
        if(this.mouseDown) {
            let tile = this.getTile(e.offsetX, e.offsetY);
            if(tile){
                if(e.which == 3){
                    this.drawRect(this.drawRectStart,[tile.x, tile.y]);
                }
                else{
                    //don't draw on active
                    let notActive = true;
                    if(this.playfield.activePiece){
                        for(let i=0; i<this.playfield.activePiece.tiles.length; i++){
                            if(tile.samePos(this.playfield.activePiece.tiles[i])) notActive = false;
                        }
                    }
                    if(notActive){
                        tile.active = this.drawMode;
                        tile.color = this.drawMode ? this.drawColor : null;
                    }
                }
            }
        }
        // this.renderBoard();
    }

    drawRect(startPos, mousePos){
        let startX = Math.min(startPos[0], mousePos[0]);
        let startY = Math.min(startPos[1], mousePos[1]);
        let endX = Math.max(startPos[0], mousePos[0]);
        let endY = Math.max(startPos[1], mousePos[1]);

        for(let row = startY; row<=endY; row++){
            for(let col = startX; col<=endX; col++){
                let tile = this.playfield.board[row][col];
                tile.active = this.drawMode;
                tile.color = this.drawMode ? this.drawColor : null;
            }
        }
    }

    stopDraw(e) {
        this.mouseDown = false;
    }

}


class Tile {
    constructor(x,y, active=false, color="gray") {
        this.x = x;
        this.y = y;
        this.active = active;
        this.color = color;
    }

    samePos(t){
        return (this.x === t.x) && (this.y === t.y);
    }

    copy() {
       return new Tile(this.x, this.y, this.active, this.color);
    }
}

class Piece {
    constructor(p, x=3, y=0, rot=0){
        this.name = p;
        this.pos = {x: x, y: y};
        this.rot = rot;
        this.offsets = this.pieces[this.name][this.rot];
        this.color = this.pieces[this.name].color;
        this.updateTiles();

    }

    copy() {
        return new Piece(this.name, this.pos.x, this.pos.y, this.rot);
    }

    move(y, x){
        this.pos.y += y;
        this.pos.x += x;
        this.updateTiles();
    }

    rotate(n){
        this.rot = n;
        this.offsets = this.pieces[this.name][this.rot];
        this.updateTiles();
    }

    updateTiles(){
        this.tiles = this.offsets.map((o) => {
            return new Tile(this.pos.x+o[1], this.pos.y+o[0], true, this.color);
        });
    }

    pieces = {
        i : {
            0 : [[1,0],[1,1],[1,2],[1,3]],
            1 : [[0,2],[1,2],[2,2],[3,2]],
            2 : [[2,0],[2,1],[2,2],[2,3]],
            3 : [[0,1],[1,1],[2,1],[3,1]],
            color : "cyan"
        },
        j :{
            0 : [[0,0],[1,0],[1,1],[1,2]],
            1 : [[0,1],[0,2],[1,1],[2,1]],
            2 : [[1,0],[1,1],[1,2],[2,2]],
            3 : [[2,0],[2,1],[1,1],[0,1]],
            color : "blue"
        },
        l :{
            0 : [[1,0],[1,1],[1,2],[0,2]],
            1 : [[0,1],[1,1],[2,1],[2,2]],
            2 : [[1,0],[1,1],[1,2],[2,0]],
            3 : [[0,0],[2,1],[1,1],[0,1]],
            color : "orange"
        },
        o :{
            0 : [[0,1],[0,2],[1,1],[1,2]],
            1 : [[0,1],[0,2],[1,1],[1,2]],
            2 : [[0,1],[0,2],[1,1],[1,2]],
            3 : [[0,1],[0,2],[1,1],[1,2]],
            color : "yellow"
        },
        s :{
            0 : [[1,0],[1,1],[0,1],[0,2]],
            1 : [[0,1],[1,1],[1,2],[2,2]],
            2 : [[2,0],[2,1],[1,1],[1,2]],
            3 : [[0,0],[1,0],[1,1],[2,1]],
            color : "green"
        },
        t :{
            0 : [[0,1],[1,0],[1,1],[1,2]],
            1 : [[0,1],[1,1],[1,2],[2,1]],
            2 : [[1,0],[1,1],[1,2],[2,1]],
            3 : [[0,1],[1,0],[1,1],[2,1]],
            color : "purple"
        },
        z :{
            0 : [[0,0],[0,1],[1,1],[1,2]],
            1 : [[0,2],[1,1],[1,2],[2,1]],
            2 : [[1,0],[1,1],[2,1],[2,2]],
            3 : [[0,1],[1,1],[1,0],[2,0]],
            color : "red"
        },
    }


}

class Queue {
    pieces = ["i", "j", "l", "t", "s", "z", "o"];
    queue = [];
    queueIndex = 0;

    slots = 6;
    slotSizeY = 4;
    slotSizeX = 6;
    showMax = 6;

    constructor(tileSize=25) {
        this.canvas = document.getElementById("queue");
        this.ctx = this.canvas.getContext("2d");
        this.tileSize = tileSize;

        this.queueHeight =  this.tileSize*this.slots*this.slotSizeY;
        this.queueWidth =  this.tileSize*this.slotSizeX;

        this.canvas.height = this.queueHeight;
        this.canvas.width = this.queueWidth;

        this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);

        this.updateQueue();
        this.renderQueue();
    }

    renderQueue() {
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
        for (let i = this.queueIndex+1; i < this.queueIndex+this.showMax; i++) {
            this.drawPiece(new Piece(this.queue[i]), this.tileSize, this.tileSize + (i-(this.queueIndex+1))*3*this.tileSize); // TODO better spacing ?
        }
    }

    drawPiece(p,x,y){

        for(let i=0; i<p.offsets.length; i++){
            let o = p.offsets[i];

            let p1x = x + o[1]*this.tileSize;
            let p1y = y + o[0]*this.tileSize;
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(p1x,p1y,this.tileSize,this.tileSize);
        }
    }

    updateQueue() {
        if (this.queue.length-this.queueIndex <= 7) {
            // Fisher Yates shuffle
            let shuffle = (arr) => {
                let copy = structuredClone(arr)
                for (let i = copy.length - 1; i > 0; i--) {
                    let j = Math.floor(Math.random() * (i + 1));
                    [copy[i], copy[j]] = [copy[j], copy[i]];
                }
                return copy
            }
            this.queue.push(...shuffle(this.pieces));
        }
    }

    setQueueIndex(i){
        this.queueIndex = i;
    }

    queueStep(){
        this.updateQueue();
        this.queueIndex += 1;
    }

    getCurrent(){
        return this.queue[this.queueIndex];
    }

    reset() {
        this.queue = [];
        this.queueIndex = 0;
        this.updateQueue();
    }

}


class Hold {
    pieceName;

    constructor(activePiece, tileSize=30) {
        this.activePiece = activePiece;

        this.canvas = document.getElementById("hold");
        this.ctx = this.canvas.getContext("2d");
        this.tileSize = tileSize;

        this.holdHeight =  this.tileSize*5;
        this.holdWidth =  this.tileSize*6;

        this.canvas.height = this.holdHeight;
        this.canvas.width = this.holdWidth;

        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);

        this.renderHold();
    }

    renderHold(){
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
        if(this.pieceName){
            this.drawPiece(new Piece(this.pieceName), this.tileSize, this.tileSize); //TODO better spacing 
        }
    }

    drawPiece(p,x,y){
        for(let i=0; i<p.offsets.length; i++){
            let o = p.offsets[i];
            let p1x = x + o[1]*this.tileSize;
            let p1y = y + o[0]*this.tileSize;
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(p1x,p1y,this.tileSize,this.tileSize);
        }
    }
    
    getHold(){
        return this.pieceName;
    }
    
    setHold(n){
        this.pieceName = n;
        this.renderHold();
    }

}

class BoardHistory {
    states = []
    stateIndex = null;

    addState(playfield, queueIndex, holdPiece){
        // overwrite states in front
        if(this.stateIndex < this.states.length-1){
            this.states = this.states.slice(0,this.stateIndex+1);
        }

        let state = {playfield, queueIndex, holdPiece}
        this.states.push(state);

        if(this.stateIndex !== null) {
            this.stateIndex += 1;
        }
        else this.stateIndex = 0;
    }

    getState(n){
        if(this.stateIndex !== null){
            this.stateIndex = Math.max(Math.min(this.stateIndex + n, this.states.length-1 ),0)  ;
            return this.states[this.stateIndex];
        }
    }

    reset() {
        this.states = [];
        this.stateIndex = null;
    }
}

class InputManager {
    keysDown = {};
    lastKey = null;

    settingsCallback;

    constructor(callback) {
        // this.timer = new Worker("timer.js");
        window.addEventListener("keydown", (e) => this.keyDown(e));
        window.addEventListener("keyup", (e) => this.keyUp(e));

        this.callback = callback;
    }

    keyDown(e) {
        if(!this.keysDown[e.key]) {
            this.keysDown[e.key] = performance.now();
            this.lastKey = e.key;
            this.callback(e.key, true);
        }
    }

    keyUp(e) {
        // console.log(e.key, performance.now() - this.keysDown[e.key])
        this.keysDown[e.key] = null;
        this.callback(e.key, false);
    }

}

class Settings{
    // gravity = 1000;
    das = 110;
    arr = 0;
    softDrop = 0;
    keybinds = {
        leftKey: 's',
        rightKey: 'f',
        softKey: 'd',
        hardKey: 'j',
        holdKey: 'e',
        crKey: 'l',
        ccrKey: 'k',
        r180Key: ';',
        restartKey: 'r',
        undoKey: 'z',
        redoKey: 'q',
        // spinKey: 'a',
    };

    constructor(input){
        this.input = input;

        document.getElementById("settings").innerHTML = "";

        let html = "";
        html += "<button onclick=\"game.startGame()\"> New game </button>";

        for(const [k, v] of Object.entries(this)){
            if(!(k === "keybinds" || k === "input")){
                html += "<div class=\"setting\">";
                html += "<p id=\"" + k + "Text" + "\">" + k + " : " + v + "</p>";
                html += "<input id=\"" + k + "Field" + "\">" + "</input>";
                html += "</div>";
            }
        }
        document.getElementById("settings").innerHTML += html;

        html = "<p id=\"Instructions\"><em>Press desired key and click change</em></p>"
        html += "<div id=\"keyBinds\">"
        for(const [k, v] of Object.entries(this.keybinds)){
            html += "<div class=\"setting\">";
            html += "<p id=\"" + k + "Text" + "\" >" + k + " : " + v + "</p>";
            html += "<button id =\"" + k + "\">change</button>"
            html += "</div>";
        }
        html += "</div>"
        document.getElementById("settings").innerHTML += html;


        for(const [k, v] of Object.entries(this)){
            if(!(k === "keybinds" || k === "input")){
                document.getElementById(k + "Field").addEventListener("keyup", (e) => {
                    if(e.key === "Enter"){
                        this.update(k, document.getElementById(k+"Field").value);
                    }
                })
            }
        }

        for(const [k, v] of Object.entries(this.keybinds)){
            document.getElementById(k).addEventListener("click", (e) => {
                this.updateKey(k);
            })

        }

    }

    updateDisplay(){
        for(const [k, v] of Object.entries(this)){
            if(!(k === "keybinds" || k === "input")){
                document.getElementById(k+"Text").innerHTML = k + " : " + v;
            }
        }

        for(const [k, v] of Object.entries(this.keybinds)){
            document.getElementById(k+"Text").innerHTML = k + " : " + v;
        }

        console.log("t")
    }

    update(s, newVal){
        this[s] = parseInt(newVal);
        // this.displaySettings();
        this.updateDisplay();
    }

    //TODO Fix
    updateKey(k){
        console.log("test");
        this.keybinds[k] = this.input.lastKey;
        this.updateDisplay();
        // this.displaySettings();
    }


}

class Game {
    start = false;
    startTime;

    curDir;
    dasFired = false;
    softDrop = false;
    dasCancel;
    arrCancel;
    softCancel;

    constructor() {

        this.input = new InputManager((key, state) => this.handleInput(key, state));
        this.board = new GameBoard(20, 10, 40);
        this.settings = new Settings(this.input);
        // this.history = new History(this.board, this.queue, this.hold);

        this.lastTick = performance.now();
        this.lastRender = this.lastTick;
        this.tickLength = 50;
    }


    update() {
        // game logic

        if(this.start){
            // spawn piece
            if(!this.board.activePiece){
                // restart game if can't spawn
                console.log("test");
                if(!this.board.spawnPiece()) {
                    this.startGame();
                }
            }
            else{
                if(this.dasFired && this.settings.arr === 0){
                    this.board.shiftInstant(this.curDir);
                }
            }
        }
    }

    initiateDas(key,dir) {
        this.cancelDas();
        this.curDir = dir;

        this.board.shiftPiece(dir);
        this.dasCancel = setTimeout( () => {
            this.dasFired = true;
            if(this.input.keysDown[key]) {
                if(this.settings.arr === 0) this.board.shiftInstant(dir, this.settings.softDrop === 0 && this.softDrop);
                else{
                    this.arrCancel = setInterval(() => {
                        if(this.input.keysDown[key]) this.board.shiftPiece(dir) 
                        else this.cancelDas();
                    }, this.settings.arr);
                }
            }
            else this.cancelDas();
        }, this.settings.das);
    }

    cancelDas() {
        if(this.dasCancel) clearTimeout(this.dasCancel);
        if(this.arrCancel) clearInterval(this.arrCancel);
        this.dasFired = false;
        this.dasCancel = null;
        this.arrCancel = null;
        this.curDir = null;
    }

    handleInput(key, state) {
        if(key === this.settings.keybinds.leftKey){
            if(state) this.initiateDas(key,"left");
            else if(this.curDir === "left") this.cancelDas();
        }
        else if(key === this.settings.keybinds.rightKey){
            if(state) this.initiateDas(key,"right");
            else if(this.curDir === "right") this.cancelDas();
        }
        else if(key === this.settings.keybinds.softKey){
            if(state){
                this.softDrop = true;
                if(this.settings.softDrop === 0) this.board.shiftInstant("down");
                this.softCancel = setInterval(() => {
                    if(this.input.keysDown[key]) this.board.shiftPiece("down");
                    else clearInterval(this.softCancel); 
                }, this.settings.softDrop);
            }
            else if(this.softDrop) {
                this.softDrop = false;
                clearInterval(this.softCancel);
            }
        }
        else if(state && key === this.settings.keybinds.hardKey){
            this.board.hardDrop();
            // this.queue.queueStep();
        }
        else if(state && key === this.settings.keybinds.holdKey){
            this.board.holdPiece();
        }
        else if(state && key === this.settings.keybinds.crKey){
            this.board.rotateActive(1);
        }
        else if(state && key === this.settings.keybinds.ccrKey){
            this.board.rotateActive(-1);
        }
        else if(state && key === this.settings.keybinds.r180Key){
            this.board.rotateActive(2);
        }
        else if(state && key === this.settings.keybinds.restartKey){
            this.startGame();
        }
        else if(state && key === this.settings.keybinds.undoKey){
            this.board.setState(-1);
        }
        else if(state && key === this.settings.keybinds.redoKey){
            this.board.setState(1);
        }
        // else if(state && key === this.settings.keybinds.spinKey){
        //     this.spinBoard();
        // }

    }

    // dumb
    spinBoard() {
        let gameBoard = document.getElementById("gameBoard");
        if(gsap.getProperty(gameBoard, "rotation") === 0){
            let tl = gsap.timeline();
            tl.to(gameBoard, {
                rotation: 360,
                duration: 2,
                repeat: -1,
                ease: "none",
            }).set(gameBoard, {rotation: 0});
        }
    }

    render() {
        this.board.renderBoard();
    }

    startGame() {
        this.startTime = performance.now();
        this.board.resetBoard();
        this.start = true;
    }

}


let game = new Game();
(() => {
    function main(tFrame){
        game.stopId = window.requestAnimationFrame(main);

        const nextTick = game.lastTick + game.tickLength;
        let numTicks = 0;

        if(tFrame > nextTick){
            const timeSinceTick = tFrame - game.lastTick;
            numTicks = Math.floor(timeSinceTick / game.tickLength);

        }

        for (let i = 0; i < numTicks; i++) {
            game.lastTick += game.tickLength;
            game.update(game.lastTick);
        }

        game.render();
    }

    main(performance.now());
})()


