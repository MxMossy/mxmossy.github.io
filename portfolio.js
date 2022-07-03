window.onload = function() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '';
    ctx.fillRect(0, 0, canvas.width, canvas.height);


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
        ctx.beginPath();
        ctx.moveto(0, 0);
        ctx.lineTo(canvas.width, canvas.height);
        ctx.stroke();

    //     for (let i = 0; i < 6; i++) {
    //         for (let j = 0; j < 6; j++) {
    //         ctx.strokeStyle = 'rgb(0, ' + Math.floor(255 - 42.5 * i) + ', ' +
    //                                 Math.floor(255 - 42.5 * j) + ')';
    //         ctx.beginPath();
    //         ctx.arc(12.5 + j * 25, 12.5 + i * 25, 10, 0, Math.PI * 2, true);
    //         ctx.stroke();
    //   }

    //     var i, j;
    //     for (j = 0; j <= 140; j += 10) {
    //         for (i = 0; i <= 140; i += 10) {
    //             r = Math.floor(Math.random() * 2);
    //             ctx.beginPath();
    //             if (r == 0) {
    //                 ctx.moveTo(i, j);
    //                 ctx.lineTo(i + 10, j + 10);
    //                 ctx.stroke();
    //             }
    //             else {
    //                 ctx.moveTo(i, j + 10);
    //                 ctx.lineTo(i + 10, j);
    //                 ctx.stroke();
    //             }
    //             ctx.closePath();
    //         }
    //         ctx.beginPath();
        }
    }

    draw();

}