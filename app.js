import { hexbin } from 'd3-hexbin'

let errorInputElement = document.querySelector('input#error');

errorInputElement.addEventListener('click', () => {
  console.log(errorInputElement.value)
  start()
});

function start() {
  let hexRadius = errorInputElement.value
  const geoData = d3.json(
    'https://raw.githubusercontent.com/addu390/population-cartogram/master/data/population/2018/geo.json'
  );
  Promise.all([geoData]).then(res => {
    let [geoData] = res;

    plot_map(geoData, hexRadius);
  });
}

function plot_map(geo, hexRadius) {

  const margin = { top: 30, right: 30, bottom: 30, left: 30 },
    width = 1250 - margin.left - margin.right,
    height = 750 - margin.top - margin.bottom;

  let hexDistance = hexRadius * 1.5
  let cols = width / hexDistance

  let new_projection = d3.geoNaturalEarth1().fitExtent([[0, height * 0.05], [width, height * 0.95]], geo)

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
    features[i] = []
    if (geo.features[i].geometry.type == "MultiPolygon") {
      for (let j = 0; j < geo.features[i].geometry.coordinates.length; j++) {
        features[i] = features[i].concat(geo.features[i].geometry.coordinates[j][0])
      }
    }

    else if (geo.features[i].geometry.type == "Polygon") {
      features[i] = features[i].concat(geo.features[i].geometry.coordinates[0])
    }
  }

  d3.select('#container').selectAll("*").remove()

  let new_hexbin = hexbin()
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
    .data(new_hexbin(pointGrid))
    .enter().append('path')
    .attr('class', 'hex')
    .attr('transform', function (d) { return 'translate(' + d.x + ', ' + d.y + ')'; })
    .attr('d', new_hexbin.hexagon())
    .style('fill', '#fff')
    .style('stroke', '#e0e0e0')
    .style('stroke-width', 1);

  let colors = ['#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e', '#16a085', '#27ae60', '#2980b9', '#8e44ad', '#2c3e50',
    '#f1c40f', '#e67e22', '#e74c3c', '#ecf0f1', '#95a5a6', '#f39c12', '#d35400', '#c0392b', '#bdc3c7', '#7f8c8d']

  for (let i = 0; i < features.length; i++) {
    let polygonPoints = features[i].map(el => new_projection(el));

    let usPoints = pointGrid.reduce(function (arr, el) {
      if (d3.polygonContains(polygonPoints, [el.x, el.y])) arr.push(el);
      return arr;
    }, [])

    let hexPoints = new_hexbin(usPoints)

    svg.append('g').attr('id', 'hexes')
      .selectAll('.hex')
      .data(hexPoints)
      .enter().append('path')
      .attr('class', 'hex')
      .attr('transform', function (d) { return 'translate(' + d.x + ', ' + d.y + ')'; })
      .attr('d', new_hexbin.hexagon())
      .style('fill', colors[i % 19])
      .style('stroke', '#000')
      .style('stroke-width', 1)
      .on("mouseover", mover)
      .on("mouseout", mout);
  }
}

function mover(d) {
  var el = d3.select(this)
    .transition()
    .duration(10)
    .style("fill-opacity", 0.6);
}

function mout(d) {
  var el = d3.select(this)
    .transition()
    .duration(1000)
    .style("fill-opacity", 1);
}

start()