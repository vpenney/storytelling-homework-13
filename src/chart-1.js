import * as d3 from 'd3'

// Set up margin/height/width
var margin = { top: 50, left: 30, right: 120, bottom: 30 }

var height = 800 - margin.top - margin.bottom

var width = 600 - margin.left - margin.right

// Add your svg
var svg = d3
  .select('#chart-1')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

// Create a time parser (see hints)
let parseTime = d3.timeParse('%B-%y')

// Create your scales
var xPositionScale = d3.scaleLinear().range([0, width])

var yPositionScale = d3.scaleLinear().range([height, 0])

var colorScale = d3
  .scaleOrdinal()
  .range([
    '#9e0142',
    '#d53e4f',
    '#f46d43',
    '#fdae61',
    '#fee08b',
    '#e6f598',
    '#abdda4',
    '#66c2a5',
    '#3288bd',
    '#5e4fa2'
  ])

// Create a d3.line function that uses your scales
var line = d3
  .line()
  .y(d => yPositionScale(d.price))
  .x(d => xPositionScale(d.datetime))

// Read in your housing price data
d3.csv(require('./housing-prices.csv'))
  .then(ready)
  .catch(err => {
    console.log(err)
  })

// Write your ready function
function ready(datapoints) {
  // console.log('Data is', datapoints)

  // Find max and min price for yPositionScale
  var maxPop = d3.max(datapoints, function(d) {
    return d.price
  })
  var minPop = d3.min(datapoints, function(d) {
    return d.price
  })

  // Define domain for yPositionScale
  yPositionScale.domain([minPop, maxPop])

  // Convert your months to dates
  datapoints.forEach(d => {
    d.datetime = parseTime(d.month)
  })

  // Get a list of dates and a list of prices
  let dates = datapoints.map(d => +d.datetime)
  let price = datapoints.map(d => +d.price)

  // Define domain for xPositionScale
  xPositionScale.domain(d3.extent(dates))

  // Group your data together
  var nested = d3
    .nest()
    .key(d => d.region)
    .entries(datapoints)

  // console.log(nested)

  // Draw your lines
  svg
    .selectAll('.region-line')
    .data(nested)
    .enter()
    .append('path')
    .attr('class', 'region-line')
    .attr('d', d => {
      return line(d.values)
    })
    .attr('stroke', d => {
      return colorScale(d.key)
    })
    .attr('stroke-width', 2)
    .attr('fill', 'none')
    .lower()

  // Add your text on the right-hand side
  svg
    .selectAll('.region-label')
    .data(nested)
    .enter()
    .append('text')
    .attr('class', 'region-label')
    // Use July 17 datetime for x position of text
    .attr('x', function(d) {
      var julData = d.values.find(function(d) {
        return d.month === 'July-17'
      })
      return xPositionScale(julData.datetime)
    })
    // Use July 17 prices for y position of text
    .attr('y', function(d) {
      var julData = d.values.find(function(d) {
        return d.month === 'July-17'
      })
      // 	console.log(julData)
      return yPositionScale(julData.price)
    })
    .text(d => d.key)
    .attr('font-size', 12)
    .attr('dx', 10)
    // Add spacing for cramped labels
    .attr('alignment-baseline', 'middle')
    .attr('dy', d => {
      if (d.key === 'West North Central') {
        return 4
      } else {
        return 0
      }
    })

  // Add points to accompany text
  svg
    .selectAll('.label-circle')
    .data(nested)
    .enter()
    .append('circle')
    .attr('class', '.label-circle')
    .attr('r', 4)
    // Use July 17 datetime for x position of text
    .attr('cx', function(d) {
      var julData = d.values.find(function(d) {
        return d.month === 'July-17'
      })
      return xPositionScale(julData.datetime)
    })
    // Use July 17 prices for y position of text
    .attr('cy', function(d) {
      var julData = d.values.find(function(d) {
        return d.month === 'July-17'
      })
      return yPositionScale(julData.price)
    })
    .attr('fill', d => {
      return colorScale(d.key)
    })

  // Add your title
  svg
    .append('text')
    .text('U.S. housing prices fall in winter')
    .attr('x', width / 2)
    .attr('y', 0)
    .attr('font-size', 24)
    .attr('dy', -25)
    .attr('text-anchor', 'middle')

  // Add the shaded rectangle
  svg
    .append('rect')
    // Use July 17 datetime for x position of text
    .attr('x', xPositionScale(parseTime('December-16')))
    .attr('y', 0)
    .attr(
      'width',
      xPositionScale(parseTime('February-17')) -
        xPositionScale(parseTime('December-16'))
    )
    .attr('height', height)
    .attr('fill', '#f0f0f0')
    .lower()

  // Add your axes
  var xAxis = d3.axisBottom(xPositionScale).tickFormat(d3.timeFormat('%b %y'))
  svg
    .append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)

  var yAxis = d3.axisLeft(yPositionScale)
  svg
    .append('g')
    .attr('class', 'axis y-axis')
    .call(yAxis)
}

export {
  xPositionScale,
  yPositionScale,
  colorScale,
  line,
  width,
  height,
  parseTime
}
