module.exports = function (x, y, width, height) {

  var coorX = x + (width/2);
  var coorY = y - (height/2);

  return {x: coorX, y: coorY};
};
