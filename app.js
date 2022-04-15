import { hexbin } from 'd3-hexbin'
import * as topojson from "topojson-client";

document.querySelector('#loader').classList.add("hide");
let colors = ['#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e', '#16a085', '#27ae60', '#2980b9', '#8e44ad', '#2c3e50',
  '#f1c40f', '#e67e22', '#e74c3c', '#ecf0f1', '#95a5a6', '#f39c12', '#d35400', '#c0392b', '#bdc3c7', '#7f8c8d']

let radiusInput = document.querySelector('input#radius');

radiusInput.addEventListener('click', () => {
  document.querySelector('#loader').classList.remove("hide");
  startGeo()
});

const margin = { top: 25, right: 10, bottom: 35, left: 10 };
const width = 1250 - margin.left - margin.right;
const height = 750 - margin.top - margin.bottom;
const strokeWidth = 0.5

function startTopo() {
  let hexRadius = radiusInput.value
  const topoData = d3.json(
    'https://raw.githubusercontent.com/addu390/population-cartogram/master/data/test/topo.json'
  );
  Promise.all([topoData]).then(res => {
    let [topoData] = res;

    var geoData = topojson.feature(topoData, topoData.objects.tiles)

    plot_map(geoData, hexRadius, true);
    document.querySelector('#loader').classList.add("hide");
  });
}

function startGeo() {
  let hexRadius = radiusInput.value
  const geoData = d3.json(
    'https://raw.githubusercontent.com/addu390/population-cartogram/master/data/population/2018/geo.json'
  );
  Promise.all([geoData]).then(res => {
    let [geoData] = res;

    plot_map(geoData, hexRadius, false);
    document.querySelector('#loader').classList.add("hide");
  });
}

function plot_map(geo, hexRadius, isProjected) {
  let hexDistance = hexRadius * 1.5
  let cols = width / hexDistance
  let newProjection = d3.geoNaturalEarth1().fitExtent([[0, height * 0.05], [width, height * 0.95]], geo)
  let rows = Math.ceil(height / hexDistance);
  let pointGrid = d3.range(rows * cols).map(function (el, i) {
    return {
      x: Math.floor(i % cols) * hexDistance,
      y: Math.floor(i / cols) * hexDistance,
      datapoint: 0
    };
  });

  let features = []
  for (let i = 0; i < geo.features.length; i++) {
    var tempFeatures = []
    if (geo.features[i].geometry.type == "MultiPolygon") {
      for (let j = 0; j < geo.features[i].geometry.coordinates.length; j++) {
        tempFeatures = tempFeatures.concat(geo.features[i].geometry.coordinates[j][0])
      }
    }
    else if (geo.features[i].geometry.type == "Polygon") {
      tempFeatures = tempFeatures.concat(geo.features[i].geometry.coordinates[0])
    }
    features[i] = {
      "coordinates": tempFeatures,
      "properties": geo.features[i].properties
    }
  }

  d3.select('#container').selectAll("*").remove()

  let newHexbin = hexbin()
    .radius(hexRadius)
    .x(function (d) { return d.x; })
    .y(function (d) { return d.y; })

  const svg = d3.select('#container')
    .append('svg')
    .attr('width', width + margin.left + margin.top)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left} ${margin.top})`);

  svg.append('g').attr('id', 'hexes')
    .selectAll('.hex')
    .data(newHexbin(pointGrid))
    .enter().append('path')
    .attr('class', 'hex')
    .attr('transform', function (d) { return 'translate(' + d.x + ', ' + d.y + ')'; })
    .attr('d', newHexbin.hexagon())
    .style('fill', '#fff')
    .style('stroke', '#e0e0e0')
    .style('stroke-width', strokeWidth)
    .on("click", mclickBase);

  for (let i = 0; i < features.length; i++) {
    var polygonPoints;
    if (isProjected) {
      polygonPoints = features[i].coordinates;
    } else {
      polygonPoints = features[i].coordinates.map(el => newProjection(el));
    }

    let usPoints = pointGrid.reduce(function (arr, el) {
      if (d3.polygonContains(polygonPoints, [el.x, el.y])) arr.push(el);
      return arr;
    }, [])

    let hexPoints = newHexbin(usPoints)

    svg.append('g')
      .attr('id', 'hexes')
      .selectAll('.hex')
      .data(hexPoints)
      .enter().append('path')
      .attr('class', 'hex' + features[i].properties.id)
      .attr('transform', function (d) { return 'translate(' + d.x + ', ' + d.y + ')'; })
      .attr("x", function (d) { return d.x; })
      .attr("y", function (d) { return d.y; })
      .attr('d', newHexbin.hexagon())
      .style('fill', colors[i % 19])
      .style('stroke', '#000')
      .style('stroke-width', strokeWidth)
      .on("click", mclick)
      .on("mouseover", mover)
      .on("mouseout", mout)
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));
  }
}

function mover(d) {
  klass = d3.select(this).attr("class")
  d3.selectAll("." + klass);
  d3.select(this)
    .transition()
    .duration(10)
    .style("fill-opacity", 0.9);
}

function mclickBase(d) {
  let selectElement = document.querySelector('#label-option');
  if (selectElement.value == "Remove") {
    d3.select(this)
      .style('fill', '#fff')
      .style('stroke', '#e0e0e0')
      .style('stroke-width', strokeWidth)
      .lower();
  } else {
    let colorElement = document.querySelector('#color-option');
    d3.select(this)
      .style('stroke-width', strokeWidth)
      .style('fill', colorElement.value)
      .style('stroke', '#000')
      .on("mouseover", mover)
      .on("mouseout", mout)
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))
      .raise();
  }
}

function mclick(d) {
  let selectElement = document.querySelector('#label-option');
  if (selectElement.value == "Remove") {
    d3.select(this)
      .remove()
  } else {
    let colorElement = document.querySelector('#color-option');
    d3.select(this)
      .style('stroke-width', strokeWidth)
      .style('fill', colorElement.value)
      .style('stroke', '#000')
      .on("mouseover", mover)
      .on("mouseout", mout)
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))
      .raise();
  }
}

function mout(d) {
  d3.select(this)
    .transition()
    .duration(10)
    .style("fill-opacity", 1);
}

function dragstarted(event, d) {
  d.fixed = false
  d3.select(this).raise()
    .style('stroke-width', 1)
    .style('stroke', '#000');
}

function dragged(event, d) {
  let hexRadius = radiusInput.value
  var x = event.x
  var y = event.y
  var grids = round(x, y, hexRadius);
  d3.select(this)
    .attr("x", d.x = grids[0])
    .attr("y", d.y = grids[1])
    .attr('transform', function (d) { return 'translate(' + d.x + ', ' + d.y + ')'; })
}

function dragended(event, d) {
  d.fixed = true
  d3.select(this)
    .style('stroke-width', strokeWidth)
    .style('stroke', '#000');
}

function round(x, y, n) {
  var gridx
  var gridy
  var factor = Math.sqrt(3) / 2
  var d = n * 2
  var sx = d * factor
  var sy = n * 3
  if (y % sy < n) {
    gridy = y - (y % sy)
    gridx = x - (x % sx)
  } else {
    gridy = y + (d - (n * factor) / 2) - (y % sy);
    gridx = x + (n * factor) - (x % sx);
  }
  return [gridx, gridy]
}

startGeo()