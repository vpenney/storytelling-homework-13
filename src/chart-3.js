import * as d3 from 'd3'

// Create your margins and height/width
var margin = { top: 20, left: 40, right: 20, bottom: 30 }
var height = 225 - margin.top - margin.bottom
var width = 160 - margin.top - margin.bottom

// I'll give you this part!
var container = d3.select('#chart-3')

// Create your scales
var xPositionScale = d3
  .scaleLinear()
  .domain([1980, 2010])
  .range([0, width])

var yPositionScale = d3
  .scaleLinear()
  .domain([0, 20000])
  .range([height, 0])

// Create your line generator
var incomeLine = d3
  .line()
  .x(d => xPositionScale(d.year))
  .y(d => yPositionScale(d.income))

// Read in your data
Promise.all([
  d3.csv(require('./middle-class-income-usa.csv')),
  d3.csv(require('./middle-class-income.csv'))
]).then(ready)

// Create your ready function
function ready([usData, nonusData]) {
  console.log(usData, nonusData)

  var nested = d3
    .nest()
    .key(d => d.country)
    .entries(nonusData)

  container
    .selectAll('.income-graph')
    .data(nested)
    .enter()
    .append('svg')
    .attr('class', 'income-graph')
    .attr('height', height + margin.top + margin.bottom)
    .attr('width', width + margin.left + margin.right)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .each(function(d) {
      var svg = d3.select(this)

      // US income line
      svg
        .append('path')
        .datum(usData)
        .attr('d', incomeLine)
        .attr('stroke', 'grey')
        .attr('fill', 'none')
        .attr('stroke-width', 1.5)

      // Other country income line
      svg
        .append('path')
        .datum(d.values)
        .attr('class', 'non-us-line')
        .attr('d', incomeLine)
        .attr('stroke', '#9e4b6c')
        .attr('stroke-width', 1.5)
        .attr('fill', 'none')

      // USA text
      svg
        .append('text')
        .text('USA')
        .attr('x', 10)
        .attr('y', 25)
        .attr('fill', 'grey')
        .attr('font-size', 10)

      // Chart titles
      svg
        .append('text')
        .text(d.key)
        .attr('x', width / 2)
        .attr('y', 0)
        .attr('dy', -10)
        .attr('fill', '#9e4b6c')
        .attr('text-anchor', 'middle')
        .attr('font-weight', 'bold')
        .attr('font-size', 11)

      // Axes
      var xAxis = d3
        .axisBottom(xPositionScale)
        .ticks(4)
        .tickSize(-height)
        .tickFormat(d3.format('d'))
      svg
        .append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis)
      svg
        .selectAll('.x-axis line')
        .attr('stroke-dasharray', '2 2')
        .attr('stroke-linecap', 'round')
      svg.selectAll('.domain').remove()

      var yAxis = d3
        .axisLeft(yPositionScale)
        .tickValues([5000, 10000, 15000, 20000])
        .tickSize(-width)
        .tickFormat(d3.format('$,d'))
      svg
        .append('g')
        .attr('class', 'axis y-axis')
        .call(yAxis)
      svg
        .selectAll('.y-axis line')
        .attr('stroke-dasharray', '2 2')
        .attr('stroke-linecap', 'round')
      svg.selectAll('.domain').remove()
    })
}

export { xPositionScale, yPositionScale, incomeLine, width, height }
