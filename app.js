function ready(geo, userData) {
  // Container SVG.
  const margin = { top: 30, right: 30, bottom: 30, left: 30 },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  const svg = d3.select('#container')
    .append('svg')
    .attr('width', width + margin.left + margin.top)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left} ${margin.top})`);

  // Projection and path.
  const projection = d3.geoAlbers().fitSize([width, height], geo);
  const geoPath = d3.geoPath().projection(projection);

  // Prep user data.
  userData.forEach(site => {
    const coords = projection([+site.lng, +site.lat]);
    site.x = coords[0];
    site.y = coords[1];
  });

  // Create a hexgrid generator.
  const hexgrid = d3.hexgrid()
    .extent([width, height])
    .geography(geo)
    .pathGenerator(geoPath)
    .projection(projection)
    .hexRadius(5);

  // Instantiate the generator.
  const hex = hexgrid(userData);

  // Create exponential colorScale.
  const colourScale = d3
    .scaleSequential(function(t) {
      var tNew = Math.pow(t, 10);
      return d3.interpolateViridis(tNew);
    })
    .domain([...hex.grid.extentPointDensity].reverse());

  // Draw the hexes.
  svg
    .append('g')
    .selectAll('path')
    .data(hex.grid.layout)
    .enter()
    .append('path')
    .attr('d', hex.hexagon())
    .attr('transform', d => `translate(${d.x} ${d.y})`)
    .style(
      'fill',
      d => (!d.pointDensity ? '#fff' : colourScale(d.pointDensity))
    )
    .style('stroke', '#F4EB9F');
}

// Data load.
const geoData = d3.json(
  'https://raw.githubusercontent.com/mattdzugan/World-Population-Cartogram/master/data/year_2018__cell_500k/squares/geo.json'
);
const points = d3.json(
  './markets.json'
);

Promise.all([geoData, points]).then(res => {
  let [geoData, userData] = res;

  ready(geoData, userData);
});