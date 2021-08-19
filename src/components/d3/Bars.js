import * as d3 from "d3";
import * as d3Collection from 'd3-collection';


function nextPerfectSquare(N)
{
    let nextN = Math.floor(Math.sqrt(N)) + 1;
 
    return nextN * nextN;
}


export default function Bars(config = {}) {    
    var margin = config.margin || { top: 50, bottom: 100, left: 100, right: 50 },
        // width = config.width ? config.width - margin.left - margin.right : 900 - margin.left - margin.right,
        // height = config.height ? config.height - margin.top - margin.bottom : 900 -margin.top - margin.bottom,
        height = config.height,
        width = config.width,
        id = config.id || 'bars-viz',
        data = config.data ? config.data : [],
        svg,
        updateScales,
        res,
        colors,
        drawChart,
        stageUpdate,
        x,
        y,
        r,
        a,
        barChart,
        xAxisCall,
        yAxisCall,
        x_axis,
        y_axis,
        barsData = [],
        displayData = [],
        snacks = ['grape', 'strawberry', 'orange', 'peach', 'raspberry'],
        stage = 0,
        firstRender = true,
        tallBar,
        stackedData,
        statsBubbles,
        colorScale,
        dataByBatch,
        statistics = [],
        snacksByPerson,
        simulation,
        simulation2,
        firstDraw,
        yLines,
        xLabel, yLabel, title, labels


        const handler = d3.drag()

        data.forEach(function(d,i){
            d.index = i
        })
        if (!displayData.length){
            snacks.forEach(function(d){
                displayData.push({
                    id: d,
                    val: d3.sum(data, v=> v[d])
                })
            })
        }

    function make_y_gridlines() {
        return d3.axisLeft(y)
            .ticks(5)
    }

    function chart(selection){
        selection.each(function() { 
            // Refer to the attached DOM element.
            var dom = d3.select(this);
            svg = dom.select('svg')
                .attr('id', id)
                .append('g')

            barChart = svg.append('g').attr('id', 'bar-chart')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

            x = d3.scaleBand()
                .domain(snacks)
                .range([0, width])
                .padding(0)

            y = d3.scaleLinear()
                .range([height, 0])

            r = d3.scaleLinear()

            colors = ["#9D2690 ", "#e01709", "#FF8400", "#FF9477", "#e30b5d"]
            colorScale = d3.scaleOrdinal()
                .domain(['grape', 'strawberry', 'orange', 'peach', 'raspberry'])
                .range(colors)
            
            xAxisCall = barChart.append('g')
                // .attr('transform', 'translate(0,' + height + ')')
                .attr('class', 'axis axis--x')

            yAxisCall = barChart.append('g')
                .attr('class', 'axis, axis--y')

            yLines = barChart.append('g')
                .attr('class', 'grid')

            labels = barChart.append('g')

            yLabel = labels.append('text')
                .attr('transform', 'rotate(-90)')
                .attr('y', -75)
                .attr('class', 'label')
                .attr('opacity', 0)

            xLabel = labels.append('text')
                .attr('y', 75)
                .attr('class', 'label')
                .attr('opacity', 0)
            
            if (!displayData.length){
                snacks.forEach(function(d){
                    displayData.push({
                        id: d,
                        val: d3.mean(data, v=> v[d])
                    })
                })
            }
    
            snacks.forEach(function(d, i){
                let percentage = d3.sum(data, v=> v[d])/d3.sum(data, v=> v.total)
                displayData[i].val = percentage
            })
    
            let barsData = []
            snacks.forEach(function(d,i){
                let tmp = d3.sum(data, v=> v[d])
                barsData.push({
                    index: i,
                    flavor: d,
                    total: tmp,
                    percentage: displayData[i].val
                })
            })
            statsBubbles = []
            data.forEach(function(d, i){
                statsBubbles.push({ id: 'stats-bub-grape-' + i, flavor: 'grape', percentage: d.grape/d.total})
                statsBubbles.push({ id: 'stats-bub-orange-' + i, flavor: 'orange', percentage: d.orange/d.total})
                statsBubbles.push({ id: 'stats-bub-peach-' + i, flavor: 'peach', percentage: d.peach/d.total})
                statsBubbles.push({ id: 'stats-bub-raspberry-' + i, flavor: 'raspberry', percentage: d.raspberry/d.total})
                statsBubbles.push({ id: 'stats-bub-strawberry-' + i, flavor: 'strawberry', percentage: d.strawberry/d.total})
            })

            // console.log(data)
            dataByBatch = d3Collection.nest()
                .key(function(d){ return d.batch})
                .entries(data)

            dataByBatch.forEach(function(d){
                let total = d3.sum(d.values, v=> v.total)
                d.data = [
                    {flavor: 'grape', percentage: d3.sum(d.values, v=> v.grape)/total},
                    {flavor: 'strawberry', percentage: d3.sum(d.values, v=> v.strawberry)/total},
                    {flavor: 'orange', percentage: d3.sum(d.values, v=> v.orange)/total},
                    {flavor: 'peach', percentage: d3.sum(d.values, v=> v.peach)/total},
                    {flavor: 'raspberry', percentage: d3.sum(d.values, v=> v.raspberry)/total}
                ]
            })
            // console.log(dataByBatch)

            stackedData = d3.stack()
                .keys([0, 1, 2, 3, 4])
                .value(function(d, key){
                    // console.log(d.data[key], key)
                    return d.data[key].percentage
                })
                (dataByBatch)

            snacksByPerson = d3Collection.nest()
                .key(function(d){ return d.person})
                .rollup(function(v){ return v.length})
                .entries(data)
            
            snacksByPerson = snacksByPerson.filter(d=> d.key != "Unknown")
            snacksByPerson.sort((a,b) => d3.descending(a.value, b.value))

            x_axis = d3.axisBottom()
            y_axis = d3.axisLeft()

            updateScales = (ticks) => {

                x_axis.scale(x).ticks(ticks)
                y_axis.scale(y).ticks(5)

                {
                    xAxisCall
                        .attr('transform', 'translate(0,' + height + ')')
                        .transition().duration(1000)
                        .attr('opacity', 1)
                        .call(x_axis)

                    yAxisCall
                        .transition().duration(1000)
                        .attr('opacity', 1)
                        .call(y_axis)

                    yLines.call(make_y_gridlines()
                        .tickSize(-width)
                        .tickFormat("")
                    )
                    yLines
                        .transition().duration(1000)
                        .attr('opacity', 1)
                }

            }        
            
            stageUpdate = () => {
                if (firstRender) return
                drawChart();
            }

            let makeLabels = (yText, xText, titleText) => {
                yLabel.attr('x', -height/2)
                    .text(yText)
                    .attr('text-anchor', 'middle')
                    .transition().duration(1000)
                    .attr('opacity', 1)

                xLabel
                    .attr('transform', 'translate(0,' + height + ')')
                    .text(xText)
                    .attr('x', width/2)
                    .attr('text-anchor', 'middle')
                    .transition().duration(1000)
                    .attr('opacity', 1)
            }

            let hideLabels = () => {
                yLabel.transition().duration(1000).attr('opacity', 0)
                xLabel.transition().duration(1000).attr('opacity', 0)
            }

            let stage0 = () => {
                let tmpData = [];
                data.forEach(function(d){
                    tmpData.push(d)
                })
                for (var i=0; i < 90 * 11/2; i++){
                    tmpData.push({
                        index: i + data.length
                    })
                }
                let sqr = Math.sqrt(nextPerfectSquare(tmpData.length))
                let dom = Array.from({length: sqr}, (x, i)=> i)
                x.domain(dom)
                y = d3.scaleBand()
                    .domain(dom)
                    .range([height, 0])
                    .padding(0)

                let m = Math.min(x.bandwidth(), y.bandwidth())/2
                r.domain(d3.extent(data, d=> d.total))
                    .range([m * 0.15, m])
                    
                if (stage.direction === 'down'){
                    drawPackBubbles(tmpData)
                } else {
                    drawPackBubbles([])
                }
            }

            let stage1 = () => {
                let tmpData = [];
                data.forEach(function(d){
                    tmpData.push(d)
                })
                for (var i=0; i < 90 * 6/2; i++){
                    tmpData.push({
                        index: i + data.length
                    })
                }
                let disp = (stage.direction === 'down' ? data : tmpData)
                let sqr = Math.sqrt(nextPerfectSquare(disp.length))
                let dom = Array.from({length: sqr}, (x, i) => i)
                x.domain(dom)
                y = d3.scaleBand()
                    .domain(dom)
                    .range([height, 0])
                    .padding(0)

                let m = Math.min(x.bandwidth(), y.bandwidth())/2
                
                r.domain(d3.extent(disp, d=> d.total))
                    .range([m * 0.15, m])
                
                if (stage.direction === 'down'){
                    drawPackBubbles(disp)
                } else {
                    drawPackBubbles(disp)
                }
            }

            let drawPackBubbles = (display) => {
                let sqr = Math.sqrt(nextPerfectSquare(display.length))
                let bubbles = barChart.selectAll("ellipse")
                    .data(display, d=> d.index)


                let e = d3.easeElasticOut.period(1.5)
                bubbles.exit()
                    // .transition().ease(e).delay((d,i)=> introDelay/( 2 * data.length)* i).duration(introDelay/4)
                    .attr('class', display.length ? 'none' : 'primary')
                    .attr('fill', '#cf1717')
                    .transition().duration(display.length ? 2500 : 500)
                    .attr('rx', 0)
                    .attr('ry', 0)
                    // .attr('cy', -100)
                    .remove()

                bubbles
                    .transition().duration(display.length ? 2500 : 1000)
                    // .attr('r', r(d3.mean(display, d=> d.total)))
                    .attr('rx', r(d3.mean(display, d=> d.total)))
                    .attr('ry', r(d3.mean(display, d=> d.total)))
                    .attr('cx', (d,i) => x(i % sqr) + x.bandwidth()/2)
                    .attr('cy', (d,i) => y(Math.floor(i/sqr)) + y.bandwidth()/2)

                bubbles.enter()
                    .append('ellipse')
                        .attr('class', 'primary')
                        .attr('cx', (d,i) => x(i % sqr) + x.bandwidth()/2)
                        .attr('cy', -(10 * r.domain()[1]))
                        .attr('r', 0)
                        .attr('stroke', '#000')
                        .attr('stroke-width', '2px')
                        // .transition().ease(e).delay((d,i)=> introDelay/(data.length)* i).duration(introDelay/2)
                        .transition().duration(1000)
                        // .attr('r', r(d3.mean(display, d=> d.total)))
                        .attr('rx', r(d3.mean(display, d=> d.total)))
                        .attr('ry', r(d3.mean(display, d=> d.total)))
                        .attr('cy', (d,i) => y(Math.floor(i/sqr)) + y.bandwidth()/2)

            }

            let stage2 = () => {
                let sqr = Math.sqrt(nextPerfectSquare(data.length))
                let dom = Array.from({length: sqr}, (x, i) => i)
                let m = Math.min(x.bandwidth(), y.bandwidth())/2

                r.domain(d3.extent(data, d=> d.total))
                    .range([m * 0.15, m])

                    x = d3.scaleBand()
                    .domain(dom)
                    .range([0, width])
                    .padding(0)

                y = d3.scaleBand()
                    .domain(dom)
                    .range([height, 0])
                    .padding(0)

                if (stage.direction === 'down'){
                    drawBubblesSize(data)
                } else {
                    drawPackBubbles(data)
                }
                
            }

            let drawBubblesSize = (display, dir) => {
                let sqr = Math.sqrt(nextPerfectSquare(data.length))
                let bubbles = barChart.selectAll('ellipse')
                    .data(display, d=> d.index)

                bubbles.exit()
                    .transition().duration(250)
                    .attr('cy', height)
                    .attr('r', 0)
                    .remove()

                bubbles
                    .transition().duration(1000)
                    .attr('cx', (d,i) => x(i % sqr) + x.bandwidth()/2)
                    .attr('cy', (d,i) => y(Math.floor(i/sqr)) + y.bandwidth()/2)
                    // .attr('r', d=> r(d.total))
                    .attr('rx', d=> r(d.total))
                    .attr('ry', d=> r(d.total))

                bubbles.enter()
                    .append('circle')
                        .attr('class', 'primary')
                        .attr('cx', (d,i) => x(i % sqr) + x.bandwidth()/2)
                        .attr('cy', -(10 * r.domain()[1]))
                        // .attr('r', 0)
                        .attr('rx', d=> r(d.total))
                        .attr('ry', d=> r(d.total))
                        .attr('stroke', '#000')
                        .attr('stroke-width', '2px')
                        .transition().duration(1000)
                        .attr('r', r(d3.mean(data, d=> d.total)))
                        .attr('cy', (d,i) => y(Math.floor(i/sqr)) + y.bandwidth()/2)
            }

            let stage3 = () => {
                if (stage.direction === 'down'){
                    let min = d3.min(data, d=> d.total)
                    let max = d3.max(data, d=> d.total)
    
                    let buckets = Array(max - min + 1).fill().map((_, i) => min + i)
    
                    let countMax = 0;
                    let bubblesInLoc = {}
                    buckets.forEach(function(d){
                        let count = d3.filter(data, v=> v.total === d).length
                        countMax = Math.max(count, countMax)
                        bubblesInLoc[d] = 0
                    })
    
                    r.range([0, (height/countMax)/2])

                    x.domain(buckets)
                    y = d3.scaleLinear()
                        .domain([0, countMax])
                        .range([height, 0])
    
                    updateScales();
                    makeLabels('Instances of Count', 'Number in Pack')
                    stackedBubbles(data);
                } else {
                    let sqr = Math.sqrt(nextPerfectSquare(data.length))
                    let dom = Array.from({length: sqr}, (x, i) => i)

    
                    x = d3.scaleBand()
                        .domain(dom)
                        .range([0, width])
                        .padding(0)
    
                    y = d3.scaleBand()
                        .domain(dom)
                        .range([height, 0])
                        .padding(0)

                    let m = Math.min(x.bandwidth(), y.bandwidth())/2

                    r.domain(d3.extent(data, d=> d.total))
                        .range([m * 0.15, m])

                    drawBubblesSize(data)

                    hideLabels();
                    xAxisCall
                        .transition().duration(1000)
                        .attr('opacity', 0)

                    yAxisCall
                        .transition().duration(1000)
                        .attr('opacity', 0)

                    yLines
                        .transition().duration(1000)
                        .attr('opacity', 0)
                }
            }

            let stackedBubbles = (display) => {
                let min = d3.min(data, d=> d.total)
                let max = d3.max(data, d=> d.total)
                let sqr = Math.sqrt(nextPerfectSquare(data.length))
                let buckets = Array(max - min + 1).fill().map((_, i) => min + i)

                let countMax = 0;
                let bubblesInLoc = {}
                buckets.forEach(function(d){
                    let count = d3.filter(data, v=> v.total === d).length
                    countMax = Math.max(count, countMax)
                    bubblesInLoc[d] = 0
                })

                let bubbles = barChart.selectAll('ellipse')
                        .data(display, d=> d.index)
    
                    bubbles.exit()
                        .transition().duration(250)
                        .attr('cy', height)
                        .attr('r', 0)
                        .remove()

                    bubbles
                        .transition().duration(1000)
                        .attr('cx', d=> x(Math.round(d.total)) + x.bandwidth()/2)
                        .attr('cy', function(d){
                            let loc = y(bubblesInLoc[Math.round(d.total)])
                            bubblesInLoc[d.total] += 1
                            return loc - r.range()[1]
                        })
                        .attr('rx', x.bandwidth()/2 * 0.75)
                        .attr('ry', 10)

                    bubbles.enter()
                        .append('ellipse')
                        .attr('class', 'primary')
                        .attr('stroke', '#000')
                        .attr('stroke-width', '2px')
                        .attr('cy', y(0))
                        .attr('cx', d=> x(Math.round(d.total)) + x.bandwidth()/2)
                        .transition().duration(1000)
                        // .attr('r', r.range()[1])
                        .attr('cy', function(d){
                            let loc = y(bubblesInLoc[Math.round(d.total)])
                            bubblesInLoc[d.total] += 1
                            return loc - r.range()[1]
                        })
                        .attr('rx', x.bandwidth()/2 * 0.75)
                        .attr('ry', 10)
            }

            let stage4 = () => {
                if (stage.direction === 'down'){
                    let sqr = Math.sqrt(nextPerfectSquare(data.length))
                    let dom = Array.from({length: sqr}, (x, i) => i)
                    x.domain(dom)
                        .padding(0.1)
                    y = d3.scaleBand()
                        .domain(dom)
                        .range([height, 0])
                        .padding(0)
                    stackedBubbles([])

                    y = d3.scaleLinear()
                        .domain([0, 1.2 * d3.max(barsData, function(d){ return d.total})])
                        .range([height, 0])
                    
                    x = d3.scaleBand()
                        .domain(snacks)
                        .range([0, width])
                        .padding(0.1)

                    
                    updateScales()
                    drawTotal(barsData)
                } else {
                    drawTotal([])
                    let min = d3.min(data, d=> d.total)
                    let max = d3.max(data, d=> d.total)
                    let buckets = Array(max - min + 1).fill().map((_, i) => min + i)
                    let countMax = 0;
                
                    buckets.forEach(function(d){
                        let count = d3.filter(data, v=> v.total === d).length
                        countMax = Math.max(count, countMax)
                    })

                    x.domain(buckets)
                    y = d3.scaleLinear()
                        .domain([0, countMax])
                        .range([height, 0])

                    r.range([0, (height/countMax)/2])

                    updateScales();


                    stackedBubbles(data)
                }
                
            }
            
            let drawTotal = (display) => {
                let bars = barChart.selectAll('.total-bar')
                    .data(display, d=> d.index)

                bars.exit()
                    .transition().duration(500)
                    .attr('y', d=> y(0))
                    .attr('height', 0)
                    .remove()

                bars
                    .transition().duration(1000)
                    .attr('height', d=> y(0) - y(d.total))
                    .attr('y', d=>  y(d.total))
                    .attr('width', x.bandwidth())
                    .attr('x', d=> x(d.flavor))

                bars.enter()
                    .append('rect')
                    .attr('class', 'total-bar')
                    .attr('x', d=> x(d.flavor))
                    .attr('y', d=> y(0))
                    .attr('height', d=> 0)
                    .attr('width', x.bandwidth())
                    .attr('fill', (d, i) => colors[i])
                    .attr('stroke', '#000')
                    .attr('stroke-width', 2)
                    .transition().duration(1000)
                    .attr('height', d=> y(0) - y(d.total))
                    .attr('y', d=>  y(d.total))
            }

            let stage5 = () => {
                if (stage.direction === 'down'){
                    x.padding(0.1)
                    y.domain([0, 1.0])
                    updateScales(5);
                    totalToAvg(barsData);
                    
                } else {
                    y = d3.scaleLinear()
                        .domain([0, 1.2 * d3.max(barsData, function(d){ return d.total})])
                        .range([height, 0])
                
                    x = d3.scaleBand()
                        .domain(snacks)
                        .range([0, width])
                        .padding(0.1)

                    
                    updateScales()
                    drawTotal(barsData)
                }
            }

            let totalToAvg = (display) => {
                    let bars = barChart.selectAll('.total-bar')
                        .data(display, d=> d.index)
    
                    bars.exit()
                        .transition().duration(500)
                        .attr('y', d=> y(0))
                        .attr('height', 0)
                        .remove()
    
                    bars
                        .transition().duration(1000)
                        .attr('height', d=> y(0) - y(d.percentage))
                        .attr('y', d=>  y(d.percentage))
                        .attr('width', x.bandwidth())
                        .attr('x', d=> x(d.flavor))
    
                    bars.enter()
                        .append('rect')
                        .attr('class', 'total-bar')
                        .attr('x', d=> x(d.flavor))
                        .attr('y', d=> y(0))
                        .attr('height', d=> 0)
                        .attr('width', x.bandwidth())
                        .attr('fill', (d, i) => colors[i])
                        .transition().duration(1000)
                        .attr('height', d=> y(0) - y(d.percentage))
                        .attr('y', d=>  y(d.percentage))
                
            }

            let stage6 = () => {
                if (stage.direction === 'down') {
                    x.padding(0.1)
                    y.domain([0, 1.0])
                    updateScales();
                    drawWhiskers(statistics)
                } else {
                    drawWhiskers(statistics, false)
                    snacks.forEach(function(d, i){
                        let percentage = d3.sum(data, v=> v[d])/d3.sum(data, v=> v.total)
                        displayData[i].val = percentage
                    })  
                    let yMax = d3.max(statistics, d=> d.max)
                    y.domain([0, yMax])
                    updateScales();
                    totalToAvg(barsData);
                }
            }

            let drawWhiskers = (display, sel=true) => {
                const delay = 500
                const dur = 500
                let whiskers = barChart.selectAll('.whiskers')
                    .data(sel ? display : [], d=> d.id)

                whiskers.exit().remove()

                whiskers.enter()
                    .append('line')
                    .attr('class', 'whiskers')
                    .attr('x1', d=> x(d.id) + x.bandwidth()/2)
                    .attr('x2', d=> x(d.id) + x.bandwidth()/2)
                    .attr('stroke', (d, i) => "#000")
                    .attr('stroke-width', '2px')
                    .attr('y1', d=> y(d.median))
                    .attr('y2', d=> y(d.median))
                    .transition().delay(delay).duration(dur)
                    .attr('y1', d=> y(d.min))
                    .attr('y2', d=> y(d.max))

                let topLine = barChart.selectAll('.top-line')
                    .data(sel ? display : [], d=> d.id)

                topLine.exit().remove()
                topLine.enter()
                    .append('line')
                    .attr('class', 'top-line')
                    .attr('x1', d=> x(d.id) + x.bandwidth()/4)
                    .attr('x2', d=> x(d.id) + x.bandwidth()* 3/4)
                    .attr('stroke', (d, i) => "#000")
                    .attr('stroke-width', '2px')
                    .attr('y1', d=> y(d.median))
                    .attr('y2', d=> y(d.median))
                    .transition().delay(delay).duration(dur)
                    .attr('y1', d=> y(d.max))
                    .attr('y2', d=> y(d.max))
                
                let bottomLine = barChart.selectAll('.bottom-line')
                    .data(sel ? display : [], d=> d.id)

                bottomLine.exit().remove()
                bottomLine.enter()
                    .append('line')
                    .attr('class', 'bottom-line')
                    .attr('x1', d=> x(d.id) + x.bandwidth()/4)
                    .attr('x2', d=> x(d.id) + x.bandwidth()* 3/4)
                    .attr('stroke', (d, i) => "#000")
                    .attr('stroke-width', '2px')
                    .attr('y1', d=> y(d.median))
                    .attr('y2', d=> y(d.median))
                    .transition().delay(delay).duration(dur)
                    .attr('y1', d=> y(d.min))
                    .attr('y2', d=> y(d.min))

                
                let bars = barChart.selectAll('.total-bar')
                    .data(sel ? display : [], d=> d.id)

                bars.exit()
                    .transition().duration(dur)
                    .attr('height', 0)
                    .attr('y', function(d, i){
                        return y(display.length ? display[i].median : 0)
                    })
                    .remove()
                
                bars.enter()
                    .append('rect')
                    .attr('class', 'total-bar')
                    .attr('id', d=> 'box-' + d.id)
                    // .attr('class', d=> console.log(d))
                    .attr('x', d=> x(d.id))
                    .attr('width', x.bandwidth())
                    .attr('fill', (d, i) => colors[i])
                    .attr('y', d=> y(d.median))
                    .attr('height', 0)
                    .attr('stroke', '#000')
                    .attr('stroke-width', '2px')
                    .transition().delay(delay).duration(dur)
                    .attr('y', d=> y(d.q3))
                    .attr('height', d=> y(d.q1) - y(d.q3))

                let midline = barChart.selectAll('.mid-line')
                    .data(sel ? display : [], d=> d.id)

                midline.exit().remove()

                midline.enter()
                    .append('line')
                    .attr('class', 'mid-line')
                    .attr('x1', d=> x(d.id) )
                    .attr('x2', d=> x(d.id) + x.bandwidth())
                    .attr('stroke', "#000")
                    .attr('stroke-width', '2px')
                    .attr('y1', d=> y(d.median))
                    .attr('y2', d=> y(d.median))
            }

            let stage7 = () => {
                if (stage.direction === 'down'){
                    x.padding(0.1)
                    y.domain([0, 1.0])
                    updateScales();
                    colorScale.range(["#eb9be2 ", "#e85248", "#f7ad5e", "#ebb7a9", "#f7639b"])
                    drawWhiskers(statistics)
                    drawStatsBubbles(statsBubbles)

                } else {
                    colorScale.range(colors)
                    drawStatsBubbles([])
                }
            }

            let drawStatsBubbles = (display) => {
                let bubbles = barChart.selectAll('.stats-bubbles')
                    .data(display, d=> d.id)

                bubbles.exit()
                    .transition().duration(1000)
                    .attr('r', 0)
                    .remove()
                
                bubbles.enter()
                    .append('circle')
                    .attr('class', 'stats-bubbles')
                    .attr('fill', d=> colorScale(d.flavor))
                    .attr('cx', d=> x(d.flavor) + x.bandwidth()/2 + (0.5* Math.random() * x.bandwidth() - x.bandwidth()/4))
                    .attr('cy', d=> y(d.percentage))
                    .attr('r', 0)
                    .attr('stroke', '#000')
                    .attr('stroke-width', 1)
                    .attr('opacity', 0.8)
                    .transition().duration(1000)
                    .attr('r', 5)
            }

            let stage8 = () => {
                if (stage.direction === 'down'){
                    drawWhiskers([], false)
                    drawStatsBubbles([])
                    x = d3.scaleBand()
                        .domain(dataByBatch.map(d=> d.key))
                        .range([0, width])
                        .padding(0.1)
                    y.domain([0, 1])
                    updateScales();
                    drawStackedArea(stackedData)
                } else {
                    drawStackedArea([])
                    x.domain(snacks)
                        .padding(0.1)
                    y.domain([0, 1.0])
                    updateScales();
                    colorScale.range(["#eb9be2 ", "#e85248", "#f7ad5e", "#ebb7a9", "#f7639b"])
                    drawWhiskers(statistics)
                    drawStatsBubbles(statsBubbles)
                }
            }

            let drawStackedArea = (display) => {
                let tmp = []
                let counter = 0
                if (display){
                    display.forEach(function(d,i){
                        d.forEach(function(v, j){
                            tmp.push({
                                y0: v[0],
                                y1: v[1],
                                key: v.data.key,
                                id: counter,
                                data: v.data,
                                color: +i
                            })
                            counter += 1;
                        })
                    })
                }
                
                let bars = barChart.selectAll('.boxes')
                    .data(tmp, d=> d.id)

                bars.exit()
                    .transition().duration(250)
                    .attr('y', y(0))
                    .attr('height', 0)
                    .remove()

                bars
                    .transition().duration(1000)
                    .attr('y', d=> y(d.y1))
                    .attr('height', d=> y(d.y0) - y(d.y1))
                    .attr('x', d=> x(d.key))
                    .attr('width', x.bandwidth())

                bars.enter()
                    .append('rect')
                    .attr('class', 'boxes')
                    .attr('id', d=> 'boxes-' + d.id)
                    .attr('x', d=> x(d.key))
                    .attr('width', x.bandwidth())
                    .attr('stroke', '#000')
                    .attr('fill', d=> colors[d.color])
                    .attr('y', y(0))
                    .attr('height', 0)
                    .transition().duration(1000)
                    .attr('y', d=> y(d.y1))
                    .attr('height', d=> y(d.y0) - y(d.y1))
            }

            let stage9 = () => {
                if (stage.direction === 'down'){
                    
                    hideLabels();
                    xAxisCall
                        .transition().duration(1000)
                        .attr('opacity', 0)

                    yAxisCall
                        .transition().duration(1000)
                        .attr('opacity', 0)

                    yLines.transition().duration(1000)
                        .attr('opacity', 0)
                
                    x = d3.scaleBand()
                        .domain(dataByBatch.map(d=> d.key))
                        .range([0, width])
                        .padding(0.1)
                    y.domain([0, 1])
                    drawStackedArea([])
                    drawCirclePack(snacksByPerson)
                } else {
                    drawCirclePack([])
                    x = d3.scaleBand()
                        .domain(dataByBatch.map(d=> d.key))
                        .range([0, width])
                        .padding(0.1)
                    y.domain([0, 1])
                    updateScales();
                    drawStackedArea(stackedData)
                }
            }

            let drawCirclePack = (display) => {
                firstDraw=true
                setTimeout(function(){
                    firstDraw=false
                }, 1000);

                a = d3.scaleLinear()
                    .domain([0, Math.sqrt(d3.max(display, d=> d.value))])
                    .range([0,180])

                
                var node = barChart.selectAll('.node')
                    .data(display, d=> d.key)

                node.exit()
                    .transition().duration(1000)
                    .attr('r', 0)
                    .attr('opacity', 0)
                    .remove()

                node.enter()
                    .append('circle')
                    .attr('class', 'node')
                    .attr('id', d=> 'node-' + d.key)
                    .attr('cx', width/2)
                    .attr('cy', height/2)
                    .attr('r', 0)
                    .attr('fill', (d,i)=> d3.schemeCategory10[i % 10])
                    .attr('stroke', '#000')
                    .attr('stroke-width', 2)
                    .attr('fill-opacity', 0.8)
                    .transition().duration(1000)
                    .attr('r', d=> a(Math.sqrt(d.value)))
                    // .call(d3.drag()
                    //     .on("start", dragstarted)
                    //     .on("drag", dragged)
                    //     .on('mousedown', console.log('here'))
                    //     .on("end", dragended))

                    let text = barChart.selectAll('.node-text')
                        .data(display, d=> d.key)

                    text.exit()
                        .attr('font-size', 0)
                        .attr('opacity', 0)
                    
                    text.enter()
                        .append('text')
                        .attr('class', 'node-text')
                        .attr('x', width/2)
                        .attr('y', height/2)
                        .attr('fill', '#fff')
                        .text(d=> d.key)
                        .attr('font-size', 26)
                        .attr('font-weight', 700)
                        .attr('opacity', 0)
                        .attr('dominant-baseline', 'middle')
                        .attr('text-anchor', 'middle')
                        .transition().duration(1000)
                        .attr('opacity', function(d){
                            return a.domain()[1] * 0.3 <  Math.sqrt(d.value) ? 1 : 0
                        })
                    
                let nodePadding = 2.5
                simulation = d3.forceSimulation()
                    .nodes(display)
                    .force("forceX", d3.forceX().strength(.1).x(width * .5))
                    .force("forceY", d3.forceY().strength(.1).y(height * .5))
                    .force("center", d3.forceCenter().x(width * .5).y(height * .5))
                    .force("charge", d3.forceManyBody().strength(-15))
                    .force("collide", d3.forceCollide().strength(.8).radius(function(d){ return a(Math.sqrt(d.value)) + nodePadding; }).iterations(1))
                    // .force('center', d3.forceCenter().x(width/2).y(height/2))
                    // .force('charge', d3.forceManyBody().strength(0.8))
                    // .force('collide', d3.forceCollide().strength(0.1).radius(a.range()[1]).iterations(1))
                    .on('tick', ()=> {ticked(display)})

                

                // simulation
                //     .nodes(display)
                //     .on('tick', function(d){
                //         console.log(d)
                //         node
                //             .attr('cx', function(d){ return d.x})
                //             .attr('cy', function(d){ return d.y})
                //     })
            }

            let ticked = (display) => {
                // console.log('ticked', d)
                if (firstDraw){
                    var u = barChart.selectAll('.node')
                        .data(display, d=> d.key)
                        .join('circle')
                        .attr('class', 'node')
                        .attr('id', d=> 'node-' + d.key)
                        .attr('cx', width/2)
                        .attr('cy', height/2)
                        .attr('fill', (d,i)=> d3.schemeCategory10[i % 10])
                        .attr('stroke', '#000')
                        .attr('stroke-width', 2)
                        .attr('fill-opacity', 0.8)
                        .attr('cx', function(d, i){ 
                            // if (i % 1000) console.log(d)
                            return d.x})
                        .attr('cy', function(d){ return d.y})

                    var t = barChart.selectAll('.node-text')
                        .data(display, d=> d.key)
                        .join('text')
                        .attr('fill', '#fff')
                        .text(d=> d.key)
                        .attr('font-size', 26)
                        .attr('class', 'node-text')
                        .attr('font-weight', 700)
                        .attr('dominant-baseline', 'middle')
                        .attr('text-anchor', 'middle')
                        .attr('x', d=> d.x)
                        .attr('y', d=> d.y)
                } else {
                    var u = barChart.selectAll('.node')
                        .data(display, d=> d.key)
                        .join('circle')
                        .attr('class', 'node')
                        .attr('id', d=> 'node-' + d.key)
                        .attr('cx', width/2)
                        .attr('cy', height/2)
                        .attr('fill', (d,i)=> d3.schemeCategory10[i % 10])
                        .attr('stroke', '#000')
                        .attr('stroke-width', 2)
                        .attr('fill-opacity', 0.8)
                        .attr('r', d=> a(Math.sqrt(d.value)))
                        .attr('cx', function(d, i){ 
                            // if (i % 1000) console.log(d)
                            return d.x})
                        .attr('cy', function(d){ return d.y})

                    var t = barChart.selectAll('.node-text')
                        .data(display, d=> d.key)
                        .join('text')
                        .attr('fill', '#fff')
                        .text(d=> d.key)
                        .attr('font-size', 26)
                        .attr('class', 'node-text')
                        .attr('font-weight', 700)
                        .attr('dominant-baseline', 'middle')
                        .attr('text-anchor', 'middle')
                        .attr('opacity', function(d){
                            return a.domain()[1] * 0.3 <  Math.sqrt(d.value) ? 1 : 0
                        })
                        .attr('x', d=> d.x)
                        .attr('y', d=> d.y)
                }
            }

            let dragstarted = (event, d) => {
                if (!event.active) simulation.alphaTarget(.03).restart();
                d.fx = d.x;
                d.fy = d.y;
              }
          
            let dragged = (event, d) => {
                d.fx = event.x;
                d.fy = event.y;
              }
          
            let dragended = (event, d) => {
                if (event.active) simulation.alphaTarget(.03);
                d.fx = null;
                d.fy = null;
              }

            drawChart = (resizing = false) =>{
                if (!statistics.length){
                    snacks.forEach(function(d){
                        let sorted = data.map(v=> +(v[d]/v.total).toFixed(2)).sort(d3.ascending)
                        let q1 = d3.quantile(sorted, 0.25)
                        let median = d3.quantile(sorted, 0.5)
                        let q3 = d3.quantile(sorted, 0.75)
                        let interQuartileRange = q3 - q1
                        var min = q1 - 1.5 * interQuartileRange
                        var max = q1 + 1.5 * interQuartileRange
                        statistics.push({
                            id: d,
                            data: sorted,
                            q1: q1,
                            median: median,
                            q3: q3,
                            min: sorted[0],
                            max: sorted[sorted.length -1]
                        })
                    })
                }
                firstRender = false;

                if (stage.index === 1 ) stage0()
                else if (stage.index === 2) stage1();
                else if (stage.index === 3) stage2();
                else if (stage.index === 4) stage3();
                else if (stage.index === 5) stage4();
                else if (stage.index === 6) stage5();
                else if (stage.index === 7) stage6();
                else if (stage.index === 8) stage7();
                else if (stage.index === 9) stage8();
                else if (stage.index === 10) stage9();
                
            }
        });
    }

    chart.data = function(value) {
        if (!arguments.length) return data;
        data = value;

        drawChart(false);

        return chart;
    }

    chart.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        x.range([0, width])
        return chart;
    }

    chart.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        y.range([height, 0])
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
        stageUpdate();
        return chart;
    }

    return chart;
}