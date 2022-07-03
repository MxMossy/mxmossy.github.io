window.onload = function() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    window.addEventListener('resize', resizeCanvas, false);
    
    function resizeCanvas() {
        canvas.width = document.body.clientWidth;
        canvas.height = document.getElementsByTagName('header')[0].clientHeight;

        draw();
    };

    resizeCanvas();


    function draw() {

        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = 'white';
        var cellSize = canvas.width / 20;
        var colorStep = 255 / (canvas.width / cellSize);
        var i, j;
        for (j = 0; j <= canvas.height; j += cellSize) {
            for (i = 0; i <= canvas.width; i += cellSize) {

                ctx.strokeStyle = 'rgb(0, ' + Math.floor(0 + colorStep * i / cellSize) + ', ' +
                                            Math.floor(0 + colorStep * i / cellSize) + ')';
                r = Math.floor(Math.random() * 2);
                ctx.beginPath();
                if (r == 0) {
                    ctx.moveTo(i, j);
                    ctx.lineTo(i + cellSize, j + cellSize);
                    ctx.stroke();
                }
                else {
                    ctx.moveTo(i, j + cellSize);
                    ctx.lineTo(i + cellSize, j);
                    ctx.stroke();
                }
                ctx.closePath();
            }
        }
    }

    draw();

}