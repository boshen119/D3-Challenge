// @TODO: YOUR CODE HERE!

// Section 1: pre-data setup

// Grab width of the containing box

var width = parseInt(d3.select("#scatter").style("width"));

// Designate the measurements of the graph
var height = width - width / 3.9;

var margin = 20;

// spacing for placing words
var labelArea = 110;
// padding for text at bottom + left axis
var tPadBottom = 40;
var tPadLeft = 40;

var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "chart")

var circRadius ;
function crGet(){
    if(width <= 530){
        circRadius = 5;
    }
    else {
        circRadius = 10;
    }
}
crGet();


svg.append("g").attr("class", "xText");

//xText will allow us to select the group without excess code
var xText = d3.select(".xText");

function xTextRefresh(){
    xText.attr(
        "transform",
        "translate(" +
        ((width - labelArea) / 2 + labelArea) +
        ", " +
        (height - margin - tPadBottom) +
        ")"
    )
}
xTextRefresh()

xText
    .append("text")
    .attr("y", -26)
    .attr("data-name", "poverty")
    .attr("data-axis", "x")
    .attr("class", "aText active x")
    .text("In Poverty (%)")

xText
    .append("text")
    .attr("y", 0)
    .attr("data-name", "age")
    .attr("data-axis", "x")
    .attr("class", "aText inactive x")
    .text("Age (Median)")

    xText
    .append("text")
    .attr("y", 26)
    .attr("data-name", "income")
    .attr("data-axis", "x")
    .attr("class", "aText inactive x")
    .text("Household Income (Median)")

// B) Left Axis
var leftTextX = margin + tPadLeft;
var leftTextY = (height + labelArea) / 2 - labelArea;

// We add a second label group this time for axis left of the chart
svg.append("g").attr("class", "yText");

var yText = d3.select(".yText");

function yTextRefresh(){
    yText.attr(
        "transform",
        `translate(${leftTextX}, ${leftTextY}) rotate(-90)`
    )
}
yTextRefresh();

yText
    .append("text")
    .attr("y", -26)
    .attr("data-name", "obesity")
    .attr("data-axis", "y")
    .attr("class", "aText active y")
    .text("Obese (%)")

    yText
    .append("text")
    .attr("y", 0)
    .attr("data-name", "smokes")
    .attr("data-axis", "y")
    .attr("class", "aText inactive y")
    .text("Smokes (%)")

    yText
    .append("text")
    .attr("y", 26)
    .attr("data-name", "healthcare")
    .attr("data-axis", "y")
    .attr("class", "aText inactive y")
    .text("Lack Healthcare (%)")

// Import our data and scalers .csv files
d3.csv("assets/data/data.csv").then(function(data){
    console.log(data);
    visualize(data);
})

// Create a function to chart or visualize data
function visualize(data){
    var currentX = "poverty";
    var currentY = "obesity";

    var xMin;
    var xMax;
    var yMin;
    var yMax;

    var toolTip = d3
        .tip()
        .attr("class", "d3-tip")
        .offset([40, -60])
        .html(function(d){
            var theX;
            var theState = `<div>${d.state}</div>`;
            var theY = `<div>${currentY}: ${d[currentY]}%</div>`

            if(currentX === "poverty"){
                theX = `<div> ${currentX}: ${d[currentX]}% </div>`
            }
            else {
                theX = `<div> ${currentX}: ${parseFloat(d[currentX]).toLocaleString("en")}</div>`
            }
            return theState + theX + theY;
        })
        svg.call(toolTip);

        // Part 2
        function xMinMax(){
            xMin = d3.min(data, function(d){
                return parseFloat(data[currentX]) * 0.90;
            })
            xMax = d3.max(data, function(d){
                return parseFloat(d[currentX]) * 1.10;
            })
        }

        function yMinMax(){
            yMin = d3.min(data,function(d){
                return parseFloat(d[currentY]) * 0.90;
            })
            yMax = d3.min(data,function(d){
                return parseFloat(d[currentY]) * 1.10;
            })
        }

        // Change classes and appearances of label text when clicked
        function labelChange(axis, clickedText){
            d3.selectAll(".aText")
            .filter("." + axis)
            .filter(".active")
            .classed("active", false)
            .classed("inactive", true);

            clickedText.classed("inactive", false).classed("active", true);
        }

        // First grab the min and max values of x and y
        xMinMax()
        yMinMax();


        //CHECK FOR NAN IN CIRCLE GRAPH
        var xScale = d3
            .scaleLinear()
            .domain([xMin, xMax])
            .range([margin + labelArea, width - margin])
        var yScale = d3
            .scaleLinear()
            .domain([yMin, yMax])
            .range([height - margin - labelArea, margin])
        
        var xAxis = d3.axisBottom(xScale);
        var yAxis = d3.axisLeft(yScale);

        function tickCount(){
            if(width <= 500){
                xAxis.ticks(5);
                yAxis.ticks(5);
            }
            else {
                xAxis.ticks(10);
                yAxis.ticks(10);
            }
        }
        tickCount();

        //X-TICK NOT WORKING FOR SOME REASON
        svg
            .append("g")
            .call(xAxis)
            .attr("class", "xAxis")
            .attr("transform", `translate(0, ${height - margin - labelArea})`)

        svg
            .append("g")
            .call(yAxis)
            .attr("class", "yAxis")
            .attr("transform", `translate(${margin + labelArea}, 0)`)
        
        var theCircles = svg.selectAll("g theCircles").data(data).enter()


        // Error: <circle> attribute cx: Expected length, "NaN".
        theCircles.append("circle")
            .attr("cx", function(d){
                return xScale(d[currentX]);
            })
            .attr("cy", function(d){
                return yScale(d[currentY]);
            })
            .attr("r", circRadius)
            .attr("class", function(d){
                return `stateCircle ${d.abbr}`
            })
            .on("mouseover", function(d){
                toolTip.show(d, this);
                d3.select(this).style("stroke", "#323232");
            })
            .on("mouseout", function(d){
                toolTip.hide(d)
                d3.select(this).style("stroke", "#e3e3e3");
            })

        theCircles
            .append("text")
            .text(function(d){
                return d.abbr
            }).attr("dx", function(d){
                return xScale(d[currentX])
            })
            .attr("dy", function(d){
                return yScale(d[currentY]) + (circRadius / 2.5)
            })
            .attr("font-size", circRadius)
}
