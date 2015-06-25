!function t(e,n,r){function a(i,l){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!l&&c)return c(i,!0);if(o)return o(i,!0);var s=new Error("Cannot find module '"+i+"'");throw s.code="MODULE_NOT_FOUND",s}var u=n[i]={exports:{}};e[i][0].call(u.exports,function(t){var n=e[i][1][t];return a(n?n:t)},u,u.exports,t,e,n,r)}return n[i].exports}for(var o="function"==typeof require&&require,i=0;i<r.length;i++)a(r[i]);return a}({1:[function(t,e,n){"use strict";var r=t("./eventDrops");"function"==typeof define&&define.amd?define("d3.chart.eventDrops",["d3"],function(t){t.chart=t.chart||{},t.chart.eventDrops=r(t)}):window?(window.d3.chart=window.d3.chart||{},window.d3.chart.eventDrops=r(window.d3)):e.exports=r},{"./eventDrops":3}],2:[function(t,e,n){"use strict";var r=t("./util/configurable"),a={xScale:null,dateFormat:null};e.exports=function(t){return function(e){function n(n){n.each(function(n){t.select(this).selectAll("text").remove();var r=e.xScale.domain();t.select(this).append("text").text(function(){return e.dateFormat(r[0])}).classed("start",!0),t.select(this).append("text").text(function(){return e.dateFormat(r[1])}).attr("text-anchor","end").attr("transform","translate("+e.xScale.range()[1]+")").classed("end",!0)})}e=e||{};for(var o in a)e[o]=e[o]||a[o];return r(n,e),n}}},{"./util/configurable":6}],3:[function(t,e,n){"use strict";var r=t("./util/configurable");e.exports=function(e){var n=t("./eventLine")(e),a=t("./delimiter")(e),o={start:new Date(0),end:new Date,minScale:0,maxScale:1/0,width:1e3,margin:{top:60,left:200,bottom:40,right:50},locale:null,axisFormat:null,tickFormat:[[".%L",function(t){return t.getMilliseconds()}],[":%S",function(t){return t.getSeconds()}],["%I:%M",function(t){return t.getMinutes()}],["%I %p",function(t){return t.getHours()}],["%a %d",function(t){return t.getDay()&&1!=t.getDate()}],["%b %d",function(t){return 1!=t.getDate()}],["%B",function(t){return t.getMonth()}],["%Y",function(){return!0}]],eventHover:null,eventZoom:null,eventClick:null,hasDelimiter:!0,hasTopAxis:!0,hasBottomAxis:function(t){return t.length>=10},eventLineColor:"black",eventColor:null};return function(t){function i(r){r.each(function(r){function o(){e.event.sourceEvent||"[object MouseEvent]"!==e.event.sourceEvent.toString()||m.translate([e.event.translate[0],0]),e.event.sourceEvent||"[object WheelEvent]"!==e.event.sourceEvent.toString()||m.scale(e.event.scale),f()}function i(){h.select(".delimiter").remove();h.append("g").classed("delimiter",!0).attr("width",v).attr("height",10).attr("transform","translate("+t.margin.left+", "+(t.margin.top-45)+")").call(a({xScale:l,dateFormat:t.locale?t.locale.timeFormat("%d %B %Y"):e.time.format("%d %B %Y")}))}function s(){t.eventZoom&&t.eventZoom(l),t.hasDelimiter&&i()}function u(n){var r=[];t.tickFormat.forEach(function(t){var e=t.slice(0);r.push(e)});var a=t.locale?t.locale.timeFormat.multi(r):e.time.format.multi(r),o=e.svg.axis().scale(l).orient(n).tickFormat(a);"function"==typeof t.axisFormat&&t.axisFormat(o);var i=("bottom"==n?parseInt(d):0)+t.margin.top-40;g.select(".x-axis."+n).remove();g.append("g").classed("x-axis",!0).classed(n,!0).attr("transform","translate("+t.margin.left+", "+i+")").call(o)}function f(){var e="function"==typeof t.hasTopAxis?t.hasTopAxis(r):t.hasTopAxis;e&&u("top");var a="function"==typeof t.hasBottomAxis?t.hasBottomAxis(r):t.hasBottomAxis;a&&u("bottom"),m.size([t.width,p]),g.select(".graph-body").remove();var o=g.append("g").classed("graph-body",!0).attr("transform","translate("+t.margin.left+", "+(t.margin.top-15)+")"),i=o.selectAll("g").data(r);i.enter().append("g").classed("line",!0).attr("transform",function(t){return"translate(0,"+c(t.name)+")"}).style("fill",t.eventLineColor).call(n({xScale:l,eventColor:t.eventColor})),i.exit().remove()}var m=e.behavior.zoom().center(null).scaleExtent([t.minScale,t.maxScale]).on("zoom",o);m.on("zoomend",s);var v=t.width-t.margin.right-t.margin.left,d=40*r.length,p=d+t.margin.top+t.margin.bottom;e.select(this).select("svg").remove();var h=e.select(this).append("svg").attr("width",t.width).attr("height",p),g=h.append("g").attr("transform","translate(0, 25)"),x=[],w=[];r.forEach(function(t,e){x.push(t.name),w.push(40*e)}),c.domain(x).range(w);var y=g.append("g").classed("y-axis",!0).attr("transform","translate(0, 60)"),b=y.append("g").selectAll("g").data(x);b.enter().append("g").attr("transform",function(t){return"translate(0, "+c(t)+")"}).append("line").classed("y-tick",!0).attr("x1",t.margin.left).attr("x2",t.margin.left+v),b.exit().remove();var S,D,F=h.append("rect").call(m).classed("zoom",!0).attr("width",v).attr("height",p).attr("transform","translate("+t.margin.left+", 35)");"function"==typeof t.eventHover&&F.on("mousemove",function(n,r){var a=e.event;if(S!=a.clientX||D!=a.clientY){S=a.clientX,D=a.clientY,F.attr("display","none");var o=document.elementFromPoint(e.event.clientX,e.event.clientY);F.attr("display","block"),"circle"===o.tagName&&t.eventHover(o)}}),"function"==typeof t.eventClick&&F.on("click",function(){F.attr("display","none");var n=document.elementFromPoint(e.event.clientX,e.event.clientY);F.attr("display","block"),"circle"===n.tagName&&t.eventClick(n)}),l.range([0,v]).domain([t.start,t.end]),m.x(l),f(),t.hasDelimiter&&i(),t.eventZoom&&t.eventZoom(l)})}var l=e.time.scale(),c=e.scale.ordinal();t=t||{};for(var s in o)t[s]=t[s]||o[s];return r(i,t),i}}},{"./delimiter":2,"./eventLine":4,"./util/configurable":6}],4:[function(t,e,n){"use strict";var r=t("./util/configurable"),a=t("./filterData"),o={xScale:null};e.exports=function(t){return function(e){e=e||{xScale:null,eventColor:null};for(var n in o)e[n]=e[n]||o[n];var i=function(n){n.each(function(n){t.select(this).selectAll("text").remove(),t.select(this).append("text").text(function(t){var n=a(t.dates,e.xScale).length;return t.name+(n>0?" ("+n+")":"")}).attr("text-anchor","end").attr("transform","translate(-20)").style("fill","black"),t.select(this).selectAll("circle").remove();var r=t.select(this).selectAll("circle").data(function(t){return a(t.dates,e.xScale)});r.enter().append("circle").attr("cx",function(t){return e.xScale(t)}).style("fill",e.eventColor).attr("cy",-5).attr("r",10),r.exit().remove()})};return r(i,e),i}}},{"./filterData":5,"./util/configurable":6}],5:[function(t,e,n){"use strict";e.exports=function(t,e){t=t||[];var n=[],r=e.range(),a=r[0],o=r[1];return t.forEach(function(t){var r=e(t);a>r||r>o||n.push(t)}),n}},{}],6:[function(t,e,n){e.exports=function(t,e,n){n=n||{};for(var r in e)!function(r){t[r]=function(a){return arguments.length?(e[r]=a,n.hasOwnProperty(r)&&n[r](a),t):e[r]}}(r)}},{}]},{},[1]);