import * as d3 from "d3";
import * as d3Collection from 'd3-collection';

export default function Progress(config = {}) {    
    var margin = config.margin || { top: 0, bottom: 0, left: 10, right: 10 },
        height = config.height,
        width = config.width,
        id = config.id || 'progress-viz',
        data = config.data ? config.data : [],
        svg,
        drawChart,
        backgroundRect,
        foregroundRect,
        x,
        chartArea,
        stage = 0,
        label,
        firstRender = true


    function chart(selection){
        selection.each(function() { 
            // Refer to the attached DOM element.
            var dom = d3.select(this);
            svg = dom.select('svg')
                .attr('id', id)
                .append('g')

            chartArea = svg.append('g').attr('id', 'bar-chart')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

            backgroundRect = chartArea.append('rect')
                .attr('id', 'bg-rect')
            foregroundRect = chartArea.append('rect')
                .attr('id', 'fg-rect')
            label = chartArea.append('text')    
                .attr('id', 'progress-text')
            


            drawChart = (resizing = false) =>{
                if (!data[stage]) return;
                if (firstRender){
                    x = d3.scaleBand()
                        .domain(data.map(d=> d.stage))
                        .range([0, width])
                        .padding(0.3)

                    backgroundRect
                        .attr('x', x(0) + x.bandwidth()/2)
                        .attr('width', x(data.length - 1) - x.bandwidth()/2)
                        .attr('y', height/2)
                        .transition().duration(1000)
                        .attr('y', height/2 - 2)
                        .attr('height', 4)

                    foregroundRect
                        .attr('x', x(0) + x.bandwidth()/2)
                        .attr('width', x(data.length))
                        .attr('height', 0)
                        .attr('y', height/2)
                        .transition().duration(1000)
                        .attr('y', height/2 - 2)
                        .attr('height', 4)
                    label
                        .attr('x', x(0) + x.bandwidth()/2)
                        .attr('y', height - 5)
                        .attr('font-size', '24px')
                        .attr('font-weight', 400)
                        .attr('text-anchor', 'middle')
                        .attr('opacity', 0)
                        .text(data[0].label)
                        .transition().duration(1000)
                        .attr('opacity', 1)
                } else {
                    foregroundRect
                        .transition().duration(1000)
                        .attr('width', x(stage) -x.bandwidth()/2)

                    label
                        .attr('opacity', 0)
                        .transition().duration(500)
                        .text(data[stage].label)
                        .attr('x', x(stage) + x.bandwidth()/2)
                        .transition().delay(100).duration(200)
                        .attr('opacity', 1)
                }
                
                    

                let bubbles = chartArea.selectAll("circle")
                    .data(data, d=> d.stage)

                bubbles
                    .classed('primary', d=> d.stage === stage ? true : false)
                    .transition().duration(1000)
                    .attr('r', d=> d.stage === stage ? 20 : 10)
                    .attr('stroke', d=> d.stage !== stage ? "#000" : "#fff")
                    .attr('stroke-width', d=> d.stage === stage ? '2px' : '2px')

                bubbles.enter()
                    .append('circle')
                    .attr('class', 'progress-bubbles')
                    .attr('r', 0)
                    .attr('cx', d=> x(d.stage) + x.bandwidth()/2)
                    .attr('cy', height/2)
                    .classed('primary', d=> d.stage === stage ? true : false)
                    .transition().duration(1000)
                    .attr('r', d=> d.stage === stage ? 20 : 10)
                    .attr('stroke', d=> d.stage !== stage ? "#000" : "#fff")
                    .attr('stroke-width', d=> d.stage === stage ? '2px' : '2px')
                
                firstRender = false;
            }
        });
    }

    chart.data = function(value) {
        if (!arguments.length) return data;

        return chart;
    }

    chart.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        return chart;
    }

    chart.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        return chart;
    }

    chart.size = function(w, h){
        if (!arguments.length) return {width: width, height: height}
        chart.width(w - margin.left - margin.right);
        chart.height(h - margin.top - margin.bottom);
        if (firstRender) {   
            drawChart(true);
        }
        return chart;
    }

    chart.stage = function(value) {
        if (!arguments.length) return stage;
        stage = value;
        if (!firstRender) drawChart();
        return chart;
    }

    return chart;
}