// ========================================
// Define dimensions, units and file with data
// ========================================
const 
  width = 800,            // SVG width - Compare with "container" in .css file
  height = 420,           // SVG height - Compare with "container  in .css file
  hMargin = 70,           // Horizontal margin - Compare with "width" and "container"
  vMargin = 60,           // Vertical margin - compare with "height" and "container"
  tipWidth = 150,         // Tooltip box size
  tipHeight = 50,         // Tooltip box size
  xLabel = "YEAR",        // Horizontal Axis label
  yLabel = "Billion USD", // Vertical Axis label
  yUnits = "B.USD",       // Units to show in the tooltip
  
  // Option 1: complete path of the data file
  dataFile = 'https://raw.githubusercontent.com/Cimanes/JS-Barchart/main/data.json';

  // Option 2: when file is in the same folder / Repository:
  // dataFile = 'data.json';

// ========================================
// Create SVG element within visHolder and define dimensions
// ========================================
// eslint-disable-next-line no-undef
const svgContainer = d3.select('.visHolder')
  .append('svg')
    .attr('width', width + hMargin)
    .attr('height', height + vMargin);

// ========================================
// Add text in the horizontal axis
// ========================================
svgContainer
  .append('text')
    .attr('x', width / 2 + 40 )
    .attr('y', height + 60)
    .text(xLabel)
    .attr('class', 'Label');

// ========================================
// Add text in the vertical axis:
// ========================================
svgContainer
  .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -height/2 - 40)
    .attr('y', 20)
    .text(yLabel)
    .attr('class', 'Label');

// ========================================
// Define the tooltip that will show when mouse is on a bar:
// ========================================
const tooltip = d3.select('.tooltip')
    .attr('id', 'tooltip')
    .style('opacity', 0);

// ========================================
// Define the frame that will hold the tooltip
// ========================================
const overlay = d3.select('.visHolder')
  .append('div')
    .attr('class', 'overlay')
    .style('opacity', 0);


 /**======================================== 
 * Retrieve data from external file to be used in the graph:  
 * ======================================== 
 * 
 * OPTION 1: XML HTTP REQUEST:    
 * const req = new XMLHttpRequest();            // Create an XMLHttpRequest object:
 * // Specify the request: type = GET, path of the file, asynchronous = TRUE:
 * req.open("GET",'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json',true);     
 * req.onload = function(){                     // When the file is loaded, perform this function 
 *   const json = JSON.parse(req.responseText); // Create a JSON object from the text of the response 
 *   const data = json.data;                    // Define the constant "data" from the "data" property in the object. 
 *   --------     use the data here       --------------------- 
 * }; 
 * req.send(); 
 * 
 * ---------------- OPTION 2: FETCH
 * // Retrieve the remote file:
 * fetch('https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json')  
 * .then(response => response.json())     // Create a JSON object with the response 
 * .then(json => json.data)               // Select the "data" property in the object 
 * .then(data => { 
 *   --------     use the data here       --------------------- 
 *   } 
 * ); 
 * 
 * ---------------- OPTION 3: D3.JSON: 
 * // Create a JSON object from the remote file:
 * d3.json( 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json' )  
 * .then(json => json.data)               // Select the "data" property in the object 
 * .then(data => { 
 *   --------     use the data here       --------------------- 
 *   }
 */
fetch(dataFile)                                       // Retrieve the remote file
  .then(file => file.json())                          // Create a JSON object with the response
  .then(json => json.data)                            // Extract the "data" property from the object
  .then(data => {                                     // Select the "data" and use it in the following operations: 
    const barWidth = width / data.length;             // define individual width depending on number of lines
    const years = data.map(function (item) {          // 1D array with year and period of each item (i.e. from "1947-10-01" get "1947 Q4")
      const month = item[0].substring(5, 7);          // identify the month and select the corresponding period
      let period;                                     // variable to store the period
      if (month == '01') { period = 'Q1'; }                   
        else if (month == '04') { period = 'Q2'; } 
        else if (month == '07') { period = 'Q3'; } 
        else if (month == '10') { period = 'Q4'; }
      return item[0].substring(0, 4) + ' ' + period;  // the result for each item is the year and the period
    });


    // =====================
    // --- X Axis
    // =====================
    const date = data.map( item => new Date(item[0]) );   // 1D array with the date of each element
    const xMax = new Date(d3.max(date));                  // Last (newest) date using d3.max
      //const xMax = new Date(Math.max(...date));         // Optional:Last (newest) date using Math.max
    xMax.setMonth(xMax.getMonth() + 3);                   // Increase xMax by 3 months.
    const xScale = d3.scaleTime().domain([d3.min(date), xMax]).range([0, width]);   // Use scaleTime method for X axis. 

    svgContainer
      .append('g')                                        // append general element
        .call(d3.axisBottom(xScale))                      // the element is a "bottom axis" using the function xScale
        .attr('id', 'x-axis')                             // --------    User Story #2: id="x-axis"
        .attr('transform', 'translate(' + hMargin + ', ' + height  + ')')     // move it to the correct position.
        .selectAll('text')                                // Select the text in the axis
          .attr('transform', 'translate(-10, 0)');        // Move it left to avoid cutting the rightmost value


    // =====================
    // --- Y Axis
    // =====================
    const GDP = data.map(item => item[1]);              // 1D Array with the GDP of each element
    const gdpMax = d3.max(GDP);                         // Max value from the GDP array
    const yScale = d3.scaleLinear()                     // Function to scale Y axis (bottom upwards).
      .domain([0, gdpMax])
      .range([height, 0]);  
    const barScale = d3.scaleLinear()                   // Function to scale the bars in the graph.
      .domain([0, gdpMax])
      .range([0, height]); 
    const scaledGDP = GDP.map(item => barScale(item));  // 1D Array with the scaled length of the bars.

    svgContainer
      .append('g')                                            // Add general element
        .call(d3.axisLeft(yScale))                            // Element will be the left axis scaled by "yScale"
        .attr('id', 'y-axis')                                 // --------    User Story #3: id="y-axis"
        .attr('transform', 'translate(' + hMargin + ', 0)')   // Move the origin
        .selectAll('text')                                    // Select the text in the axis
          .attr('transform', 'translate(0, 5)');              // Move it down to avoid cutting the top value


    // =====================
    // DATA
    // =====================
      d3.select('svg')
        .selectAll('rect')
        .data(scaledGDP)
        .enter()
        .append('rect')
          .attr('class', 'bar')                         // --------    User Story #5: class="bar"
          .attr('data-date', (d, i) => data[i][0] )        // --------    User Stories #6 and #10: property data-date 
          .attr('data-gdp',  (d, i) => data[i][1] )         // --------    User Stories #6 and #11: property data-gdp
          .attr('x', function (d, i) { return xScale(date[i]); })
          .attr('y', (d) => height - d )
          .attr('width', barWidth)
          .attr('height', d => d)                       // --------    User Story #9: bar height = scaleGDP
          .attr('index', (d, i) => i)
          .attr('transform', 'translate(' + hMargin + ', 0)')

        // =============================================================
        // Define what will happen when mouse is on a bar (show tooltip)
        // =============================================================
        .on('mouseover', function (event, d) {    // d or datum is the height of the current bar
          const i = this.getAttribute('index');

          overlay
            .transition()
            .duration(0)
            .style('height', d + 'px')
            .style('width', barWidth + 'px')
            .style('opacity', 0.9)
            .style('left', i * barWidth + 'px')
            .style('bottom', vMargin + 'px')
            .style('transform', 'translateX(' + hMargin + 'px)');

          tooltip
            .transition()
            .duration(0)
            .style('opacity', 0.8);

          /**
          * Text to be introduced in the tooltip in html: 
          * First line = years + new line
          * Second line: start with $ symbol
          * 
          * Option: convert number to a string: GDP[i].toString()
          * Option: convert number to string with one decimal: GDP[i].toFixed(1)
          * Option: GDP number including thousand separator "," using Regex
          *           If there is more than 3 digits, add "," before the three last ones:
          *        Two parts: 
          *        (\d) = first part with digits.
          *        (?=(\d{3})+\.)/g = second part is 3 digits + whatever          
          *    tooltip   
          *    .html( years[i] + '<br>' + '$' + 
          *         GDP[i].toString().replace(/(\d)(?=(\d{3})+\.)/g, '$1,') + ' ' + yUnits )
          */
          tooltip
            .html( years[i] + '<br>' + '$' + GDP[i] + ' ' + yUnits )
            .attr('data-date', data[i][0] )                    // --------    User Stories #13: property data-date
            .style('width', tipWidth)
            .style('left', event.pageX - tipWidth/2 + 'px')
            .style('top', event.pageY - 60  + 'px');
        })


        // =============================================================
        // Define what will happen when mouse is off the bar (hide tooltip again)
        // =============================================================
        .on('mouseout', function () {
          tooltip.transition().duration(500).style('opacity', 0);
          overlay.transition().duration(500).style('opacity', 0);
        });
  })
  .catch(e => console.log(e));