class GameBoard {

    constructor(rows, cols, tileSize=30, spawnArea=2) {

        this.rows = rows;
        this.cols = cols;
        this.tileSize = tileSize;
        this.spawnArea = spawnArea;

        this.boardHeight = (rows+this.spawnArea)*tileSize;   
        this.boardWidth = cols*tileSize;   

        this.playfield = new Playfield(this.rows, this.cols, this.tileSize, this.spawnArea);
        this.hold = new Hold(this.tileSize);
        this.queue = new Queue(this.tileSize);

        this.sketcher = new Sketcher(this.playfield, () => this.getActivePiece());
        this.history = new BoardHistory();

        this.activePiece =  null;
    }
    
    update(){
        this.queue.updateQueue();
        if(!this.activePiece || this.activePiece.name !== this.queue.getCurrent()){
            // this.activePiece = new Piece(this.queue.getCurrent());
            this.spawnPiece();
        }
    }

    getActivePiece() {
        return this.activePiece;
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

    // loadPlayfield(p) {
    //     this.playfield = p;
    //     this.sketcher = new Sketcher(thiskplayfield);
    // }

    setState(n){
        let state = this.history.getState(n);
        if(state){
            this.playfield.setField(state);
            this.queue = state.queue.copy();
            this.hold = state.hold.copy();
            this.spawnPiece(false);
            // this.activePiece = new Piece(this.queue.getCurrent());
            this.renderBoard();
        }
    }

    spawnPiece(newState=true, das=null) {
        let spawnX = Math.ceil(this.cols / 2) - 2;
        this.activePiece = new Piece(this.queue.getCurrent(), spawnX, 0);
        if(this.collisionCheck(this.activePiece, this.playfield)){
            this.activePiece = null;
            return false;
        };

        if(newState){
            this.history.addState(this.playfield.copy(), this.queue.copy(), this.hold.copy());
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
                this.queue.setCurrent(holdName);
                // console.log(holdName);
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

    setField(state){
        this.board = state.playfield.copy().board;
    }

    getAllTiles(){
        let tiles = [];
        for (let i = 0; i < this.rows+this.spawnArea; i++) {
            for (let j = 0; j < this.cols; j++) {
                tiles.push(this.board[i][j]);
            }
        }
        return tiles;
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
        this.ctx.setLineDash([this.tileSize*0.25, this.tileSize*0.5, this.tileSize*0.25, 0]);
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
                let tile = this.board[row][col]
                if(tile){
                    if(tile.selected) this.colorTile(tile, "purple");
                    else this.colorTile(tile);
                }
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

    colorTile(tile, color=tile.color) {
        if(tile.color && tile.active){
            this.ctx.fillStyle = "black";
            this.ctx.fillRect(tile.x*this.tileSize, tile.y*this.tileSize, this.tileSize, this.tileSize);
            this.ctx.fillStyle = color;
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
    shiftKey = false;

    drawColor = "gray";
    drawMode = false;
    drawRectStart;

    selected = [];
    selectMode = true;
    selectionOffsets = [];
    selectRectStart;
    unselectFlag;

    startDragTile;
    dragBounds = {};
    // dragBounds = {lowX: 0, 
    //     highX: this.playfield.cols-1, 
    //     lowY: 0,
    //     highY: this.playfield.rows-1
    // };

    mode = null;

    constructor(playfield, getActivePiece){
        this.playfield = playfield;
        this.canvas = this.playfield.canvas;
        this.getActivePiece = getActivePiece;

        // add listeners
        this.canvas.addEventListener('mousedown', (e) => {
            this.mouseDown = true;
            let tile = this.getTile(e.offsetX, e.offsetY);
            if(!tile) return;
            if(this.shiftKey) {
                this.mode = "select";
                this.selectMode = !tile.selected;
                if(e.which === 3){
                    this.selectRectStart = [tile.x, tile.y];
                    this.selectRect(this.selectRectStart,[tile.x, tile.y], this.selectMode);
                }
                
                else this.select(tile, this.selectMode);
            }
            else if(this.mode === "select"){
                // start drag
                if(tile.selected){
                    this.mode = "drag";
                    this.startDragTile = tile;
                    this.selected = this.playfield.getAllTiles().filter((t) => t.selected).map((t) => t.copy());
                    this.selectionOffsets = this.selected.map((t) => {return {x: t.x - this.startDragTile.x, y: t.y - this.startDragTile.y}}, this);


                    // compute bounds of drag
                    let lowerX = Math.min(...this.selected.map((t) => t.x));
                    let lowerY = Math.min(...this.selected.map((t) => t.y));
                    let higherX = Math.max(...this.selected.map((t) => t.x));
                    let higherY = Math.max(...this.selected.map((t) => t.y));

                    this.dragBounds = {lowX: this.startDragTile.x-lowerX, 
                        highX: this.startDragTile.x+(this.playfield.cols-1)-higherX, 
                        lowY: this.startDragTile.y-lowerY,
                        highY: this.startDragTile.y+(this.playfield.rows+this.playfield.spawnArea-1)-higherY
                    };

                    this.drag(tile);
                }
                else {
                    this.unselectFlag = true;
                }
            }
            else{ //draw
                this.mode = "draw";
                this.drawMode = !tile.active;
                tile.color = this.drawMode ? this.drawColor : null;
                if(e.which === 3){
                    this.drawRectStart = [tile.x, tile.y];
                    this.drawRect(this.drawRectStart,[tile.x, tile.y]);
                }
                else this.draw(tile);
            }
        });
        this.canvas.addEventListener('mousemove', (e) => {
            let tile = this.getTile(e.offsetX, e.offsetY);
            if(!tile) return;
            if(this.mode === "draw"){
                if(e.which === 3){
                    this.drawRect(this.drawRectStart,[tile.x, tile.y]);
                }
                else this.draw(tile);
            }
            else if (this.mode === "select"){
                if(e.which === 3){
                    this.selectRect(this.selectRectStart,[tile.x, tile.y], this.selectMode);
                }
                else this.select(tile, this.selectMode);
            }
            else if (this.mode === "drag") {
                this.drag(tile);
            }
        });
        this.canvas.addEventListener('mouseup', (e) =>{
            let tile = this.getTile(e.offsetX, e.offsetY);
            if(!tile) return;
            this.mouseDown = false;
            if(this.mode === "drag"){
                this.mode = "select";
            }
            if(this.mode === "select" && this.unselectFlag) {
                this.unselectAll();
                this.mode = null;
                this.unselectFlag = false;
            }
        });
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    getTile(xOffset,yOffset){
        let tileX = Math.floor(xOffset / (this.playfield.tileSize));
        let tileY = Math.floor(yOffset / (this.playfield.tileSize));

        tileX = Math.min(tileX, this.playfield.cols - 1);
        tileY = Math.min(tileY, (this.playfield.rows+this.playfield.spawnArea) - 1);

        return this.playfield.board[tileY][tileX];
    }

    isActive(t){
        let notActive = true;
        let active = this.getActivePiece();
        if(active){
            for(let i=0; i<active.tiles.length; i++){
                if(t.samePos(active.tiles[i])) return true;
            }
        }
        return false;
    }

    draw(tile){
        if(this.mouseDown && !this.isActive(tile)) {
            tile.active = this.drawMode;
            tile.selected = false;
            tile.color = this.drawMode ? this.drawColor : null;
        }
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
                tile.selected = false;
                tile.color = this.drawMode ? this.drawColor : null;
            }
        }
    }

    select(tile, state=true){
        if(tile.active && this.shiftKey && this.mouseDown){
            tile.selected = state;
        }
    }

    selectRect(startPos, mousePos, state){
        let startX = Math.min(startPos[0], mousePos[0]);
        let startY = Math.min(startPos[1], mousePos[1]);
        let endX = Math.max(startPos[0], mousePos[0]);
        let endY = Math.max(startPos[1], mousePos[1]);

        for(let row = startY; row<=endY; row++){
            for(let col = startX; col<=endX; col++){
                let tile = this.playfield.board[row][col];
                this.select(tile, state);
            }
        }
    }

    unselectAll(){
        let tiles = this.playfield.getAllTiles();
        for (let i=0; i<tiles.length; i++) {
            let t = tiles[i];
            t.selected = false;
        }
    }

    // inDragBounds(tile){
    //     return tile.x >= this.dragBounds.lowX 
    //         && tile.x <= this.dragBounds.highX 
    //         && tile.y >= this.dragBounds.lowY 
    //         && tile.y <= this.dragBounds.highY 
    // }

    drag(curTile){
        if(curTile !== this.startDragTile){
            // console.log(curTile.x, curTile.y);

            let clamp = (x,lower,higher) => Math.max(Math.min(x, higher), lower);
            let shiftX = clamp(curTile.x,  this.dragBounds.lowX, this.dragBounds.highX);
            let shiftY = clamp(curTile.y,  this.dragBounds.lowY, this.dragBounds.highY);

            // erase and update selected
            for(let i=0; i<this.selected.length; i++){
                let t = this.selected[i];
                this.playfield.board[t.y][t.x].active = false;
                this.playfield.board[t.y][t.x].selected = false;
            }

            for(let i=0; i<this.selected.length; i++){
                this.selected[i].x = shiftX + this.selectionOffsets[i].x;
                this.selected[i].y = shiftY + this.selectionOffsets[i].y;
                let copy = this.selected[i].copy();
                this.playfield.board[copy.y][copy.x] = copy;
            }
        }
    }
}


class Tile {
    constructor(x,y, active=false, color="gray") {
        this.x = x;
        this.y = y;
        this.active = active;
        this.color = color;
        this.selected = false;
    }

    samePos(t){
        return (this.x === t.x) && (this.y === t.y);
    }

    copy() {
        
        let copy = new Tile(this.x, this.y, this.active, this.color);
        copy.selected = this.selected;
        return copy;
    }
}

class Piece {
    constructor(p, x=0, y=0, rot=0){
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
            color : "#0ff"
        },
        j :{
            0 : [[0,0],[1,0],[1,1],[1,2]],
            1 : [[0,1],[0,2],[1,1],[2,1]],
            2 : [[1,0],[1,1],[1,2],[2,2]],
            3 : [[2,0],[2,1],[1,1],[0,1]],
            color : "#00f"
        },
        l :{
            0 : [[1,0],[1,1],[1,2],[0,2]],
            1 : [[0,1],[1,1],[2,1],[2,2]],
            2 : [[1,0],[1,1],[1,2],[2,0]],
            3 : [[0,0],[2,1],[1,1],[0,1]],
            color : "#f80"
        },
        o :{
            0 : [[0,1],[0,2],[1,1],[1,2]],
            1 : [[0,1],[0,2],[1,1],[1,2]],
            2 : [[0,1],[0,2],[1,1],[1,2]],
            3 : [[0,1],[0,2],[1,1],[1,2]],
            color : "#ff8"
        },
        s :{
            0 : [[1,0],[1,1],[0,1],[0,2]],
            1 : [[0,1],[1,1],[1,2],[2,2]],
            2 : [[2,0],[2,1],[1,1],[1,2]],
            3 : [[0,0],[1,0],[1,1],[2,1]],
            color : "#8f0"
        },
        t :{
            0 : [[0,1],[1,0],[1,1],[1,2]],
            1 : [[0,1],[1,1],[1,2],[2,1]],
            2 : [[1,0],[1,1],[1,2],[2,1]],
            3 : [[0,1],[1,0],[1,1],[2,1]],
            color : "#88f"
        },
        z :{
            0 : [[0,0],[0,1],[1,1],[1,2]],
            1 : [[0,2],[1,1],[1,2],[2,1]],
            2 : [[1,0],[1,1],[2,1],[2,2]],
            3 : [[0,1],[1,1],[1,0],[2,0]],
            color : "#f00"
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

    copy() {
        let copy = new Queue(this.tileSize);
        copy.queue = structuredClone(this.queue);
        copy.queueIndex = this.queueIndex;
        return copy;
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

    updateQueue(q=[]) {
        // console.log(q);
        // console.log(this.queue);
        //validate
        for(let i=0; i<q.length; i++){
            if(!this.pieces.includes(q[i])){
                return false;
            }
        }

        if(q.length > 0){
            this.queue = this.queue.slice(0,this.queueIndex);
            this.queue = [...this.queue, ...q];
        }

        while (this.queue.length-this.queueIndex <= 6) {
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
        return true;
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

    setCurrent(p){
        this.queue[this.queueIndex] = p; 
    }

    reset() {
        this.queue = [];
        this.queueIndex = 0;
        this.updateQueue();
    }

}


class Hold {
    pieceName;

    constructor(tileSize=30) {

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

    copy() {
        let copy = new Hold(this.tileSize);
        copy.pieceName = this.pieceName;
        return copy;
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
    }

}

class BoardHistory {
    states = []
    stateIndex = null;

    // constructor(playfield, queue, hold){
    //     this.playfield = playfield;
    //     this.queue = queue;
    //     this.hold = hold;
    // }

    addState(playfield, queue, hold){
        // overwrite states in front if in past
        if(this.stateIndex < this.states.length-1){
            this.states = this.states.slice(0,this.stateIndex+1);
        }

        let state = {playfield: playfield, 
                    queue: queue,
                    hold: hold}
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

    // Max's settings
    // das = 100;
    // arr = 0;
    // softDrop = 0;
    // keybinds = {
    //     leftKey: 's',
    //     rightKey: 'f',
    //     softKey: 'd',
    //     hardKey: 'j',
    //     holdKey: 'e',
    //     crKey: 'l',
    //     ccrKey: 'k',
    //     r180Key: ';',
    //     restartKey: 'r',
    //     undoKey: 'z',
    //     redoKey: 'a',
    // };

    // Default Settings
    das = 130;
    arr = 50;
    softDrop = 20;
    keybinds = {
        leftKey: 'ArrowLeft',
        rightKey: 'ArrowRight',
        softKey: 'ArrowDown',
        hardKey: ' ',
        holdKey: 'c',
        crKey: 'ArrowUp',
        ccrKey: 'z',
        r180Key: 'a',
        restartKey: 'r',
        undoKey: 'q',
        redoKey: 'w',
        // spinKey: 'a',
    };

    constructor(input, pauseInput, resumeInput, board){
        this.input = input;
        this.pause = pauseInput;
        this.resume = resumeInput;
        this.board = board;

        this.loadSettings();

        document.getElementById("settings").innerHTML = "";

        let html = "";
        html += "<button onclick=\"game.startGame()\"> New game </button>";

        // queue
        html += "<div class=\"setting\"><p>update queue</p><input id=\"queueUpdate\"></input></div>";

        // timing
        html += "<div id=\"timing\">"
        for(const [k, v] of Object.entries(this)){
            if(k === "das" || k === "arr" || k === "softDrop"){
                html += "<div class=\"setting\">";
                html += "<p id=\"" + k + "Text" + "\">" + k + " (ms)" +  " : " + v + "</p>";
                html += "<input id=\"" + k + "Field" + "\">" + "</input>";
                html += "</div>";
            }
        }
        html += "</div>"

        html += "<div id=\"keyBinds\">"
        html += "<button id=\"changeAll\"> Change All Keybinds</button>"
        for(const [k, v] of Object.entries(this.keybinds)){
            html += "<div class=\"setting\">";
            html += "<p id=\"" + k + "Text" + "\" >" + k + " : </p>"
            html += "<p id=\"" + k + "\">" + (v === " " ? "Space" : v) + "</p>";
            html += "<button id =\"" + k + "Button\">change</button>"
            html += "</div>";
        }
        html += "</div>"
        document.getElementById("settings").innerHTML += html;

        // add listeners
        document.getElementById("queueUpdate").addEventListener("keyup", (e) => {
            if(e.key === "Enter"){
                let newQ = document.getElementById("queueUpdate").value;
                this.board.queue.updateQueue(newQ.split(""));
                document.getElementById("queueUpdate").value = "";
                document.getElementById("queueUpdate").blur();
            }
        })


        for(const [k, v] of Object.entries(this)){
            if(k === "das" || k === "arr" || k === "softDrop"){
                document.getElementById(k + "Field").addEventListener("keyup", (e) => {
                    if(e.key === "Enter"){
                        this.update(k, document.getElementById(k+"Field").value);
                        document.getElementById(k+"Field").value = "";
                        document.getElementById(k+"Field").blur();
                    }
                })
            }
        }

        document.getElementById("changeAll").addEventListener("click", (e) => this.changeAllKeys());

        for(const [k, v] of Object.entries(this.keybinds)){
            document.getElementById(k+"Button").addEventListener("click", (e) => {
                console.log("click");
                document.getElementById(k+"Button").blur(); // needed to make sure spacebar doesn't retrigger button
                this.updateKey(k);
            })
        }

    }
    
    loadSettings() {
        // let cookieSettings = JSON.parse(document.cookie.split("; ").find((row) => row.startsWith("settings="))?.split("=")[1]);
        let cookieSettings = JSON.parse(decodeURIComponent(document.cookie).split("; ").find((row) => row.startsWith("settings="))?.split("=")[1]);
        if(cookieSettings != {}){
            this.das = cookieSettings.das;
            this.arr = cookieSettings.arr;
            this.softDrop = cookieSettings.softDrop;
            this.keybinds = cookieSettings.keybinds;
        }
    }

    saveSettings() {
        let cookie = {
            das : this.das,
            arr : this.arr,
            softDrop : this.softDrop,
            keybinds : this.keybinds
        }
        
        document.cookie = "settings=" + encodeURIComponent(JSON.stringify(cookie)) //.replace(/;/, "%3B")
        // document.cookie = "test=test"
        // console.log(cookie);
        // console.log(JSON.stringify(cookie));
        // document.cookie = ""
    }

    removeFocus() {
        document.getElementById("queueUpdate").blur();
    }

    updateDisplay(){
        for(const [k, v] of Object.entries(this)){
            if(k === "das" || k === "arr" || k === "softDrop"){
                document.getElementById(k+"Text").innerHTML = k + " (ms) : " + v;
            }
        }

        for(const [k, v] of Object.entries(this.keybinds)){
            document.getElementById(k).innerHTML = (v === " " ? "Space" : v);
        }

        this.saveSettings();
    }

    async changeAllKeys(){
        this.pause();
        document.getElementById("changeAll").blur(); // needed to make sure spacebar doesn't retrigger button
        for(const [k, v] of Object.entries(this.keybinds)){
            // document.getElementById(k+"Text").innerHTML = k + " : " + "Waiting...";
            document.getElementById(k).innerHTML = "Waiting...";
            let newKey = await this.awaitKey();
            this.keybinds[k] = newKey;
            this.updateDisplay();
        }
        this.resume();
    }

    update(s, newVal){
        this[s] = parseInt(newVal);
        this.updateDisplay();
    }

    async updateKey(k){
        this.pause();
        document.getElementById(k).innerHTML = "Waiting...";

        let newKey = await this.awaitKey();
        this.keybinds[k] = newKey;

        this.resume();
        this.updateDisplay();
    }

    awaitKey() {
        let waitKey = new Promise((resolve) => {
            document.addEventListener("keydown", (e) => {
                resolve(e.key);
                }, {once: true}
            )
        })
        return waitKey;
    }
}

class Game {
    start = true;
    startTime;
    takingInput = true;

    curDir;
    dasFired = false;
    softDrop = false;
    dasCancel;
    arrCancel;
    softCancel;

    constructor() {

        this.input = new InputManager((key, state) => this.handleInput(key, state));
        this.board = new GameBoard(20, 10, 30);
        this.settings = new Settings(this.input, () => this.pauseInput(), () => this.resumeInput(), this.board);

        this.lastTick = performance.now();
        this.lastRender = this.lastTick;
        this.tickLength = 50;
    }


    update() {
        // game logic
        if(this.start){
            this.board.update();
            // this.board.activePiece = this.board.queue.getCurrent();
            if(this.dasFired && this.settings.arr === 0){
                this.board.shiftInstant(this.curDir);
            }
            // // spawn piece
            // if(!this.board.activePiece){
            //     // stop game if can't spawn
            //     if(!this.board.spawnPiece()) {
            //         this.start = false;
            //     }
            // }
            // else{
            // }
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
        if(this.takingInput){
            if(key === "Shift"){
                if(state) this.board.sketcher.shiftKey = true;
                else this.board.sketcher.shiftKey = false;
            }
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

        }
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

    pauseInput(){
        this.takingInput = false;
        console.log("pause");
    }

    resumeInput(){
        this.takingInput = true;
        console.log("resume");
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


