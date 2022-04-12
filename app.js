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
    width = 1200 - margin.left - margin.right,
    height = 650 - margin.top - margin.bottom;

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

  const svg = d3.select('#container')
    .append('svg')
    .attr('width', width + margin.left + margin.top)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left} ${margin.top})`);

  for (let i = 0; i < features.length; i++) {
    let polygonPoints = features[i].map(el => new_projection(el));

    let usPoints = pointGrid.reduce(function (arr, el) {
      if (d3.polygonContains(polygonPoints, [el.x, el.y])) arr.push(el);
      return arr;
    }, [])

    let new_hexbin = hexbin()
      .radius(hexRadius)
      .x(function (d) { return d.x; })
      .y(function (d) { return d.y; })

    let hexPoints = new_hexbin(usPoints)

    svg.append('g').attr('id', 'hexes')
      .selectAll('.hex')
      .data(hexPoints)
      .enter().append('path')
      .attr('class', 'hex')
      .attr('transform', function (d) { return 'translate(' + d.x + ', ' + d.y + ')'; })
      .attr('d', new_hexbin.hexagon())
      .style('fill', '#' + Math.floor(Math.random() * 16777215).toString(16))
      .style('stroke', '#000')
      .style('stroke-width', 1);
  }


}

start()