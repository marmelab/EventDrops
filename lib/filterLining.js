"use strict";
/* global require, module */

module.exports = function (ctx, width, height) {

  var Filters = {};
  Filters.getPixels = function(ctx) {
    return ctx.getImageData(0,0,width,height);
  };

  Filters.filterImage = function(filter, ctx, var_args) {
    var args = [this.getPixels(ctx)];
    for (var i=2; i<arguments.length; i++) {
      args.push(arguments[i]);
    }
    return filter.apply(null, args);
  };

  Filters.createImageData = function(w,h) {
    return ctx.createImageData(w,h);
  };

  Filters.convolute = function(pixels, weights, opaque) {
    var side = Math.round(Math.sqrt(weights.length));
    var halfSide = Math.floor(side/2);
    var src = pixels.data;
    var sw = pixels.width;
    var sh = pixels.height;
    // pad output by the convolution matrix
    var w = sw;
    var h = sh;
    var x, y, sx, sy, cx, cy, scy, scx, dstOff, srcOff, wt, r, g, b, a;
    var output = Filters.createImageData(width, height);
    var dst = output.data;
    // go through the destination image pixels
    for (y=0; y<h; y++) {
      for (x=0; x<w; x++) {
        sy = y;
        sx = x;
        dstOff = (y*w+x)*4;
        // calculate the weighed sum of the source image pixels that
        // fall under the convolution matrix
        r=0, g=0, b=0, a=0;
        for (cy=0; cy<side; cy++) {
          for (cx=0; cx<side; cx++) {
            scy = sy + cy - halfSide;
            scx = sx + cx - halfSide;
            if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
              srcOff = (scy*sw+scx)*4;
              wt = weights[cy*side+cx];
              r += src[srcOff] * wt;
              g += src[srcOff+1] * wt;
              b += src[srcOff+2] * wt;
              a += src[srcOff+3] * wt;
            }
          }
        }
        dst[dstOff] = r;
        dst[dstOff+1] = g;
        dst[dstOff+2] = b;
        dst[dstOff+3] = a;
      }
    }
    return output;
  };

  var filter = function filter() {
    var result = Filters.filterImage(Filters.convolute, ctx,
    [ 1/9, 1/9, 1/9,
      1/9, 1/9, 1/9,
      1/9, 1/9, 1/9 ]
    );

    ctx.putImageData(result, 0, 0);
  };

  return {
    filter: filter
  };
};
