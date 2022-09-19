window.onload = function() {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  const start = new Date();
  const animTime = 3000;

  var grid = [];
  var cellSize;
  var colorStep;

  function prepare() {

    console.log("prepare");

    canvas.width = document.body.clientWidth;
    canvas.height = document.getElementsByTagName('header')[0].clientHeight;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    cellSize = canvas.width / 20;
    colorStep = 255 / (canvas.width / cellSize);

    for (var j = 0; j < canvas.height / cellSize; j += 1) {
      if (grid[j] === undefined) {
        var row = [];
        for (var i = 0; i < canvas.width / cellSize; i += 1) {
          row.push(Math.floor(Math.random() * 2));
        };

        grid.push(row);
      }
    }

    draw();

  };


  function draw() {

    // console.log(grid);
    const now = new Date();

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var i, j;
    for (j = 0; j <= canvas.height / cellSize; j += 1) {
      for (i = 0; i <= canvas.width / cellSize; i += 1) {

        ctx.strokeStyle = 'rgb(0, ' + Math.floor(0 + colorStep * i) + ', ' +
          Math.floor(0 + colorStep * i) + ')';
        ctx.beginPath();
        if (grid[j][i] == 0) {
          ctx.moveTo(i * cellSize, j * cellSize);
          ctx.lineTo((i + 1) * cellSize, (j + 1) * cellSize);
          ctx.stroke();
        }
        else {
          ctx.moveTo(i * cellSize, (j + 1) * cellSize);
          ctx.lineTo(i * cellSize + cellSize, j * cellSize);
          ctx.stroke();
        }
        ctx.closePath();
      }
    }
    var elapsed = now - start;
    // console.log("milliseconds", elapsed);

    var gradx_0 = Math.min(canvas.width * (elapsed / animTime), canvas.width);
    var gradx_1 = gradx_0 + canvas.width;
    var grd = ctx.createLinearGradient(gradx_0, 0, gradx_1, 0);
    grd.addColorStop(0, "transparent");
    grd.addColorStop(1, 'black');

    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    if (gradx_0 < canvas.width) {
      window.requestAnimationFrame(draw);
    }
  }

  prepare();
  // window.requestAnimationFrame(draw);

  window.addEventListener('resize', prepare, false);

}
