"use strict";
/* global require, module */

var defaultConfig = {
  xScale: null
};

module.exports = function (d3, document, config) {
  return function (config) {

    config = config || {
      xScale: null,
      eventColor: null
    };
    for (var key in defaultConfig) {
     config[key] = config[key] || defaultConfig[key];
    }
    var canvasHandler = function () {
      var graphWidth = config.width - config.margin.right - config.margin.left;
      var graphHeight = data.length * 40;
      var ctx = (canvas.node()).getContext('2d');
      var mouseDown = 0;
    }

      this.init = function () {
        d3.select(this).select('canvas').remove();
        var canvas = d3.select(this)
         .append('canvas')
         .attr('id', "mon_canvas")
          .attr('width', graphWidth)
          .attr('height', graphHeight)
          ;

        return canvas;
      }

      this.draw = function(){
        // Clear the entire canvas
        var topX = 0;
        var topY = 0;
        ctx.clearRect(topX, topY, topX + canvas.node().width, topY + canvas.node().height);

        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Toto",750/2,35);
        ctx.fillText("Toto",750/2,75);
        ctx.fillText("Toto",750/2,115);
        ctx.fillText("Toto",750/2,155);
      }

      this.mouseDownHandler = function(evt){
        // permits compatibility with every browser
        document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
        //lastX = evt.offsetX || (evt.pageX - canvas.node().offsetLeft);
        lastX = evt.clientX;
        //alert(lastX);
        dragStart = {
          x : lastX,
          y : lastY
        };
        dragged = false;
        mouseDown++;

        canvas.node().addEventListener('mousemove', c.mouseMoveHandler,false);
        canvas.node().addEventListener('mouseup', c.mouseUpHandler,false);
      }

      this.mouseMoveHandler = function(evt){
        //lastX = evt.offsetX || (evt.pageX - canvas.node().offsetLeft);
        lastX = evt.clientX;
        dragged = true;
        if (dragStart && mouseDown){
          ctx.translate(lastX-dragStart.x, lastY-dragStart.y);
          //ctx.translate([d3.event.translate[0], 0]);
          drawAgain();
        }
      }

      this.mouseUpHandler = function(evt){
        canvas.node().addEventListener('mousemove', c.mouseMoveHandler,false);
        canvas.node().addEventListener('mousedown', c.mouseDownHandler,false);

        dragStart = null;
        mouseDown--;
        if (!dragged) zoom(evt.shiftKey ? -1 : 1 );
      }

  }
}
