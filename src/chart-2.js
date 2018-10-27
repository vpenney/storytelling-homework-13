import * as d3 from 'd3'

// Set up margin/height/width
var margin = { top: 20, left: 30, right: 5, bottom: 30 }
var height = 110 - margin.top - margin.bottom
var width = 85 - margin.top - margin.bottom

// I'll give you the container
var container = d3.select('#chart-2')

// Create your scales
var xPositionScale = d3
  .scaleLinear()
  .domain([12, 55])
  .range([0, width])

var yPositionScale = d3
  .scaleLinear()
  .domain([0, 0.3])
  .range([height, 0])

// Create a d3.line function that uses your scales
var japanArea = d3
  .area()
  .x(function(d) {
    return xPositionScale(d.Age)
  })
  .y1(function(d) {
    return yPositionScale(d.ASFR_jp)
  })
  .y0(d => yPositionScale(0))

var usArea = d3
  .area()
  .x(function(d) {
    return xPositionScale(d.Age)
  })
  .y1(function(d) {
    return yPositionScale(d.ASFR_us)
  })
  .y0(d => yPositionScale(0))

// Read in your data
d3.csv(require('./fertility.csv'))
  .then(ready)
  .catch(err => {
    console.log(err)
  })

// Build your ready function that draws lines, axes, etc
function ready(datapoints) {
  // console.log(datapoints)

  // Group some data by year
  var nested = d3
    .nest()
    .key(d => d.Year)
    .entries(datapoints)

  // Add an SVG for each year
  container
    .selectAll('.fertility-graph')
    .data(nested)
    .enter()
    .append('svg')
    .attr('class', 'fertility-graph')
    .attr('height', height + margin.top + margin.bottom)
    .attr('width', width + margin.left + margin.right)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .each(function(d) {
      var svg = d3.select(this)

      // Japan area chart
      svg
        .append('path')
        .datum(d.values)
        .attr('d', japanArea)
        .attr('stroke', '#F26144')
        .attr('fill', '#F26144')
        .attr('opacity', 0.4)

      // US area chart
      svg
        .append('path')
        .datum(d.values)
        .attr('d', usArea)
        .attr('stroke', '#15959F')
        .attr('fill', '#15959F')
        .attr('opacity', 0.4)
        .lower()

      // Title text for charts (year)
      svg
        .append('text')
        .text(d.key)
        .attr('x', width / 2)
        .attr('y', 0)
        .attr('dy', -10)
        .attr('font-size', 12)
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'middle')

      // Define summed birth rates per country
      var usSum = d3.sum(d.values, d => d.ASFR_us)
      var japanSum = d3.sum(d.values, d => d.ASFR_jp)

      // Append US birth rate labels
      svg
        .append('text')
        .attr('class', 'us-rate-label')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .text(usSum.toFixed(2))
        .attr('font-size', 7)
        .attr('dx', 5) // offset 5px to the right
        .attr('fill', '#15959F')
        .attr('alignment-baseline', 'middle')

      // Append Japan birth rate labels
      svg
        .append('text')
        .attr('class', 'japan-rate-label')
        .attr('x', width / 2)
        .attr('y', height / 3)
        .text(japanSum.toFixed(2))
        .attr('font-size', 7)
        .attr('fill', '#F26144')
        .attr('dx', 5) // offset 5px to the right
        .attr('alignment-baseline', 'middle')

      // Axes
      var xAxis = d3.axisBottom(xPositionScale).tickValues([15, 30, 45])
      svg
        .append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis)

      var yAxis = d3.axisLeft(yPositionScale).ticks(3)
      svg
        .append('g')
        .attr('class', 'axis y-axis')
        .call(yAxis)
    })
}

export { xPositionScale, yPositionScale, japanArea, usArea, width, height }
