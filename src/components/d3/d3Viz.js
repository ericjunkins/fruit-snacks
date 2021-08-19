import * as d3 from "d3";

export default function scatterplot(config = {}) {    
    var margin = config.margin || { top: 0, bottom: 0, left: 0, right: 0 },
        width = config.width ? config.width - margin.left - margin.right : 900,
        height = config.height ? config.height - margin.top - margin.bottom : 600,
        id = config.id || 'scatterplot-viz',
        data = [],
        svg,
        updateScales,
        res,
        colors,
        innerRadius,
        outerRadius,
        drawChart;

    function chart(selection){
        selection.each(function() { 
            // Refer to the attached DOM element.
            var dom = d3.select(this);
            svg = dom.select('svg')
                .attr('id', id)
                .append('g')


            colors = ["#440154ff", "#31668dff", "#37b578ff", "#fde725ff", "#9932a8ff"]


            updateScales = (resizing = false) => {
                res = d3.chord()
                    .padAngle(0.05)
                    .sortSubgroups(d3.descending)
                    (data)
                
                outerRadius = Math.min(width, height) * 0.4
                innerRadius = outerRadius - 20

                res.forEach(function(d, i){
                    d.index = i
                })

                svg.attr('transform', 'translate(' + width/2 + ',' + height/2 + ')');

            }

            drawChart = (resizing = false) =>{
                var rings = svg.selectAll('.rings')
                    .data(res.groups, d=> d.index)

                rings.exit().remove()

                rings
                    .attr('d', d3.arc()
                    .innerRadius(innerRadius)
                    .outerRadius(outerRadius)
                )

                rings.enter()
                    .append('path')
                    .attr('class', 'rings')
                    .style('fill', (d, i)=> colors[i])
                    .style('stroke', 'black')
                    .attr('d', d3.arc()
                        .innerRadius(innerRadius)
                        .outerRadius(outerRadius)
                    )

                
                var ribbons = svg.selectAll('.ribbons')
                    .data(res, d=> d.index)

                ribbons.exit().remove()

                ribbons
                    .attr('d', d3.ribbon()
                    .radius(innerRadius - 2)
                )

                ribbons.enter()
                    .append('path')
                    .attr('class', 'ribbons')
                    .attr('d', d3.ribbon()
                        .radius(innerRadius - 2)
                    )
                    .style('fill', d=> colors[d.source.index])
                    .style('stroke', 'black')
                    .style('opacity', 0.8)
            }
        });
    }

    chart.data = function(value) {
        if (!arguments.length) return data;
        data = value;
        updateScales(false)
        drawChart(false);

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
        updateScales(true);
        drawChart(true);
        return chart;
    }

    return chart;
}