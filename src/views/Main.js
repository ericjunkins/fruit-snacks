import React, {useState, useEffect, useRef} from 'react';
import {Box, Text, Center, Button, VStack, Link} from "@chakra-ui/react";
import { Scrollama, Step } from 'react-scrollama';
import Tabletop from "tabletop";

import {MathJaxContext, MathJax} from "better-react-mathjax";

import * as d3 from "d3";
import * as d3Collection from 'd3-collection';

import D3Container from "./../components/D3Container";
import scatterplot from "./../components/d3/d3Viz";
import ProgressBar from "./../components/ProgressBar";
import Snacks from "./../components/Snacks";

import Bars from "./../components/d3/Bars";
import Introduction from '../components/Introduction';
import ScrollTextBox from '../components/ScrollTextBox';

import {Element, animateScroll as scroll, scroller } from "react-scroll";

import Papa from "papaparse";

const generateRandomMatrix = (n, m, x=1) => {
    var matrix = []
    for (var i=0; i < m; i++){
      var tmp = []
      for (var j=0; j < n; j++){
        var num = Math.random() * x
        if (x > 1){
          num = Math.round(num)
        }
        tmp.push(i === j ? 0 : num)
      }
      matrix.push(tmp)
    } 
    return matrix
}

const randomDate = (start) => {
    let end = new Date(start.getTime() + (1000 * 60 * 60 * 24 * 30))
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

const generateFakeSnackData = (n) => {
    let snacks = [];
    for (var i=0; i < n; i ++){
        let tmp = {
            date: null,
            strawberry: 0,
            raspberry: 0,
            peach: 0,
            orange: 0,
            grape: 0,
        }
        for (var j = 0; j < 11; j++){
            const s = Math.random()
            if (s < 0.2) tmp.strawberry += 1
            else if (s < 0.4) tmp.raspberry += 1
            else if (s < 0.6) tmp.peach += 1
            else if (s < 0.8) tmp.orange += 1
            else tmp.grape += 1
        }
        tmp.date = randomDate(new Date(Date.now()))
        snacks.push(tmp)
    }
    let sorted = snacks.sort(function(a, b){
        return d3.ascending(a.date, b.date)
    })
    return sorted;
}

function noScroll() {
    window.scrollTo(0, 0);
}

function disableScroll() {
    window.removeEventListener('scroll', noScroll);
}
  
  // call this to Enable
function enableScroll() {
    window.addEventListener('scroll', noScroll);
}

const expectedAscii = "$$E(x) = Σ_{i=1}^{N} P_{i}(x) * x_i$$"
let expectedValue = "0.0"

const Main = (props) => {
    const [stepIndex, setStepIndex] = useState(0)
    const [direction, setDirection] = useState('down')
    const [currentStepIndex, setCurrentStepIndex] = useState({index: 0, direction: "down"});
    const [data, setData] = useState()
    const stage = useRef({stage: 0});
    const [stageVal, setStageVal] = useState(0)
    const vizRef = useRef();
    const flavors = ['grape', 'strawberry', 'orange', 'peach', 'raspberry']
    let total = {}
    let timeout = false;

    useEffect(() => {
        let url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRB4E_6RnpLP1wWMjqcwsUvotNATB8Np3OntlXb7066ULcAHI9oqqRhucltFifPTYNd7DRNRE56oTdt/pub?output=csv"
        let myurl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZIWXf1R3stgMAoS2ARiQTIUwHIIsDeuVjmDyhtBImrXwH5Iomn14qDEllZCiSMjzQHzeJZTyrXJoM/pub?gid=0&single=true&output=csv"
        // Tabletop.init({
        //     // key: "https://docs.google.com/spreadsheets/d/1tFpRixsmo0A6-sA4VP8X6xQ6WE6DJuNMxEXzsGh8Rak/edit?usp=sharing",
        //     // key: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZIWXf1R3stgMAoS2ARiQTIUwHIIsDeuVjmDyhtBImrXwH5Iomn14qDEllZCiSMjzQHzeJZTyrXJoM/pubhtml",
        //     key: "1tFpRixsmo0A6-sA4VP8X6xQ6WE6DJuNMxEXzsGh8Rak",
        //     debug: true,
        //     simpleSheet: true
        // })
        //     .then((tmp) => {
        //         tmp.forEach(function(d){
        //             d.timestamp = d3.timeParse("%m/%d/%Y")(d.date)
        //             d.grape = +d.grape
        //             d.strawberry = +d.strawberry
        //             d.orange = +d.orange
        //             d.peach = +d.peach
        //             d.raspberry = +d.raspberry
        //             d.total =+ d.total
        //             d.batch =+ d['Batch num']
        //         })
        //         setData(tmp)

        //     })
        //     .catch((err) => console.warn(err));
        Papa.parse(myurl, {
            download: true,
            header: true,
            complete: function(results){
                let tmp = results.data
                tmp.forEach(function(d){
                    d.timestamp = d3.timeParse("%m/%d/%Y")(d.date)
                    d.grape = +d.grape
                    d.strawberry = +d.strawberry
                    d.orange = +d.orange
                    d.peach = +d.peach
                    d.raspberry = +d.raspberry
                    d.total =+ d.total
                    d.batch =+ d['Batch num']
                    d.person = d['Who Ate Me?']
                })
                setData(tmp)
            }
        }
        )
    }, [])

    const onStepEnter = ({data, direction, entry}) => {
        if (direction === 'down') {
            setCurrentStepIndex({index: data, direction: direction});
            setStepIndex(data)
        }
        else {
            setStepIndex(data)
            // setCurrentStepIndex({data, direction: direction})
        }
    }

    const onStepExit = ({data, direction, entry}) => {
        // console.log(data, direction)
        let tmp = direction === 'down' ? data + 1 : data -1;
        if (direction === 'up') {
            setCurrentStepIndex({index: data, direction: direction});
        }
        else {
        }
        // if (timeout) {
        //     console.log('hit timeout condition')
        //     return
        // };
        
        // console.log('scrollbox target: ', 'scrollbox-' + tmp)
        // timeout = true;
        // disableScroll();

        // scroller.scrollTo('scrollbox-' + tmp, {
        //     duration: 1000,
        //     delay: 0,
        //     smooth: true,
        //     offset: -500
        // })

        // setTimeout(function(){
        //     timeout = false;
        //     console.log('timeout cleared')
        //     enableScroll();
        // }, 2000)

        
    }
    // let snackData = generateFakeSnackData(10);

    const updateStage = () => {
        stage.current.stage += 1;
        setStageVal(stage.current.stage)
    }

    let snacksByPerson

    if (data){
        let c = d3Collection.nest()
            .key(function(d){ return d.total})
            .rollup(function(v){ return v.length})
            .entries(data)

        let exp = 0
        c.forEach(function(d){
            d.key = +d.key
            d.probability = d.value/(data.length)
            exp += d.probability * d.key
        })
        expectedValue = exp.toFixed(2)
        flavors.forEach(function(d,i){
            total[d] = d3.sum(data, v=> v[d])
        })
     
        snacksByPerson= d3Collection.nest()
            .key(function(d){ return d.person})
            .rollup(function(v){ return v.length})
            .entries(data)
    
        snacksByPerson = snacksByPerson.filter(d=> d.key != "Unknown")
        snacksByPerson.sort((a,b) => d3.descending(a.value, b.value))
        snacksByPerson = snacksByPerson.slice(0, 10)
    }

    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    let ranking = snacksByPerson ? (
        <Box w="100%" px="20px" py="2px">
            {snacksByPerson.map((d,i)=> <Text py="4px" color={d3.schemeCategory10[i]} fontWeight={500} fontSize="24px"> {(i+1) + ". " + d.key + ": " + d.value } </Text>)}
        </Box> 
        ) : null


    return (
        <Box w="100%">
            <ProgressBar stage={stepIndex}/>
            <Box display="block" h="80px" w="100%" bg="#044b59" position="fixed" bottom="0" left="0"  boxShadow="0px -5px 5px #000">
                <Center py="10px" fontSize="18px">
                    <VStack>
                    <Text color="#fff"> 
                        Website built in Javascript ES6, using <Link href="https://reactjs.org/" color="#42e3f5"> React </Link> as the web framework, 
                        and <Link href="https://www.d3-graph-gallery.com/" color="#42e3f5"> D3 </Link> as the visulization library
                    </Text>
                    <Text color="#fff"> 
                        Hosted on using Github.io. <Link href="https://github.com/ericjunkins/fruit-snacks" color="#42e3f5"> Source Code </Link>
                    </Text>
                    </VStack>
                </Center>
            </Box>
            <Center w="100%" mt="30px">
                <Box w="100%" px="150px">
                    <Box w="60%" h="70%" m="auto" position="fixed" top="250px" left="200px">
                        {data ? <D3Container ref={vizRef} id="counts-bars" viz={Bars} data={data} stage={currentStepIndex} /> : null}
                    </Box>
                    <Scrollama 
                        onStepEnter={onStepEnter}
                        offset={0.7}
                        onStepExit={onStepExit}
                        // debug
                    >
                        <Step data={0} key={0}>
                            <Box id="scrollbox-0">
                                <Introduction/>
                                <Snacks />
                            </Box>
                        </Step>
                        <Step data={1} key={1}>
                            <Box mt="100vh" h="50vh">
                                <ScrollTextBox>
                                    <Box px={10} py={15} id="scrollbox-1">
                                        <Text display="inline-block" fontSize="32px"> Let's look at the data </Text>
                                        {/* <Text display="inline-block" fontSize="42px" color="primary" pl={"4px"} fontWeight={500}> Data </Text> */}
                                        <Text display="inline-block" fontSize="32px">  So far there have been roughly </Text>
                                        <Center w="100%">
                                            <Text display="inline-block" fontSize="48px" color="primary" fontWeight={500} > {"N=" + (data ? data.length + 90 * 9/2: "")} </Text>
                                        </Center>
                                        <Text display="inline-block" fontSize="32px"> {"snack packs opened. For reference that is also about " + numberWithCommas(data ? data.length + 90 * 8 * 90: "") +  " calories of fruit snacks" }</Text>
                                    </Box>
                                </ScrollTextBox>
                            </Box>
                        </Step>
                        <Step data={2} key={2}>
                            <Box mt="100vh" h="50vh">
                                <ScrollTextBox >
                                    <Box px={10} py={15} id="scrollbox-2">
                                        <Text display="inline-block" fontSize="32px"> But not everyone is recording their data, so we have a recorded total of </Text>
                                        <Center w="100%">
                                            <Text display="inline-block" fontSize="48px" color="primary" fontWeight={500} > {"N=" + (data ? data.length + 1: "")} </Text>
                                        </Center>
                                        <Text display="inline-block" fontSize="32px"> { data ? "just " + (100 * data.length/ (data.length + 90 * 9/2)).toFixed(2) + "% of available data. Not trying to shame but... do you guys even care about data? Looking at you data team" : ""}  </Text>
                                    </Box>
                                </ScrollTextBox>
                            </Box>
                        </Step>

                        <Step data={3} key={3}>
                            <Box mt="100vh" h="50vh">
                                <ScrollTextBox >
                                    <Box px={10} py={25} id="scrollbox-3">
                                        <Text display="inline-block" fontSize="32px" lineHeight="36px" mb="5px"> Suprisingly, there is a large spread of gummies per pack.  This discrepancy is number of snacks per pack is very interesting it's so high</Text>
                                        <Text display="block" fontSize="42px" color="primary" fontWeight={500} lineHeight="48px"> {"Lowest: " + (data ? d3.min(data, d=> d.total) : "")} </Text>
                                        <Text display="block" fontSize="42px" color="primary" fontWeight={500} lineHeight="48px"> {"Highest: " + (data ? d3.max(data, d=> d.total) : "")} </Text>
                                    </Box>
                                </ScrollTextBox>
                            </Box>
                        </Step>

                        <Step data={4} key={4}>
                            <Box mt="100vh" h="50vh">
                                <ScrollTextBox >
                                    <Box px={10} py={15}>
                                        <Text display="inline-block" fontSize="32px" lineHeight="36px"> The Expected number of gummies in a pack is: </Text>
                                        <MathJaxContext>
                                            <MathJax>{expectedAscii}</MathJax>
                                        </MathJaxContext>
                                        <Center w="100%">
                                            <Text display="inline-block" fontSize="42px" color="primary" fontWeight={500} lineHeight="42px"> {"Exp Gummies: " + expectedValue} </Text>
                                        </Center>
                                        
                                        <Text display="inline-block" fontSize="32px" lineHeight="36px" mt="10px"> The distribution at least roughly looks gaussian so... thats good I guess? </Text>
                                    </Box>
                                </ScrollTextBox>
                            </Box>
                        </Step>

                        <Step data={5} key={5}>
                            <Box mt="100vh" h="50vh">
                                <ScrollTextBox >
                                    <Box px={10} py={15}>
                                        <Text display="inline-block" fontSize="32px" lineHeight="36px"> Now we'll start looking at individual gummies. There has been </Text>
                                        <Text display="inline-block" fontSize="32px" color="primary" fontWeight={500} px={"3px"} lineHeight="48px"> {"Total: " + (data ? d3.sum(data, d=> d.total) + "*" : "")} </Text>
                                        <Text display="block" fontSize="32px" color="grape" fontWeight={500} px={"3px"} lineHeight="48px">
                                            {"Grape: " + (data ? total['grape'] + "*" : "0" )}  
                                        </Text>
                                        <Text display="block" fontSize="32px" color="strawberry" fontWeight={500} px={"3px"} lineHeight="48px">
                                            {"Strawberry: " + (data ? total['strawberry'] : "0" )}  
                                        </Text>
                                        <Text display="block" fontSize="32px" color="orange" fontWeight={500} px={"3px"} lineHeight="48px">
                                            {"Orange: " + (data ? total['orange'] : "0" )}  
                                        </Text>
                                        <Text display="block" fontSize="32px" color="peach" fontWeight={500} px={"3px"} lineHeight="48px">
                                            {"Peach: " + (data ? total['peach'] : "0" )}  
                                        </Text>
                                        <Text display="block" fontSize="32px" color="raspberry" fontWeight={500} px={"3px"} lineHeight="48px">
                                            {"Raspberry: " + (data ? total['raspberry'] : "0" )}  
                                        </Text>
                                        <Text display="inline-block" fontSize="18px" lineHeight="24px" mt="20px"> *Thanks Zach for adding Floats to this, that was nice to deal with </Text>
                                    </Box>
                                    
                                </ScrollTextBox>
                            </Box>
                        </Step>

                        {/* <Step data={5} key={5}>
                            <Box mt="100vh" h="50vh">
                                <ScrollTextBox >
                                    <Box px={10} py={15}>
                                        <Text display="inline-block" fontSize="32px" lineHeight="36px"> That leads to the follow individual counts:  </Text>
                                        <Text display="block" fontSize="32px" color="grape" fontWeight={500} px={"3px"} lineHeight="48px">
                                            {"Grape: " + (data ? total['grape'] : "0" )}  
                                        </Text>
                                        <Text display="block" fontSize="32px" color="strawberry" fontWeight={500} px={"3px"} lineHeight="48px">
                                            {"Strawberry: " + (data ? total['strawberry'] : "0" )}  
                                        </Text>
                                        <Text display="block" fontSize="32px" color="orange" fontWeight={500} px={"3px"} lineHeight="48px">
                                            {"Orange: " + (data ? total['orange'] : "0" )}  
                                        </Text>
                                        <Text display="block" fontSize="32px" color="peach" fontWeight={500} px={"3px"} lineHeight="48px">
                                            {"Peach: " + (data ? total['peach'] : "0" )}  
                                        </Text>
                                        <Text display="block" fontSize="32px" color="raspberry" fontWeight={500} px={"3px"} lineHeight="48px">
                                            {"Raspberry: " + (data ? total['raspberry'] : "0" )}  
                                        </Text>
                                    </Box>
                                </ScrollTextBox>
                            </Box>
                        </Step>
                        <Step data={6} key={6}>
                            <Box mt="100vh" h="50vh">
                                <ScrollTextBox >
                                    <Box px={10} py={15}>
                                        <Text display="inline-block" fontSize="32px" lineHeight="36px"> 
                                            Let's get a better comparison of these 
                                        </Text>
                                        <Text display="inline-block" fontSize="32px" lineHeight="36px" color="primary" pr="3px" fontWeight={500}> 
                                            total numbers.
                                        </Text>
                                        <Text display="inline-block" fontSize="32px" lineHeight="36px"> 
                                            We can see some clear statistical winners already
                                        </Text>
                                    </Box>
                                </ScrollTextBox>
                            </Box>
                        </Step> */}
                        <Step data={6} key={6}>
                            <Box mt="100vh" h="50vh">
                                <ScrollTextBox >
                                    <Box px={10} py={15}>
                                        <Text display="inline-block" fontSize="32px" lineHeight="36px"> 
                                            Now we'll normalize the numbers and look at the flavors as the raw percentage of each individual pack. We can see that Raspberry and Strawberry are clearly ahead.
                                        </Text>
                                        {/* <Text display="inline-block" fontSize="32px" lineHeight="36px" color="primary" pr="3px" fontWeight={500}> 
                                            Percentages 
                                        </Text> */}
                                    </Box>
                                </ScrollTextBox>
                            </Box>
                        </Step>
                        <Step data={7} key={7}>
                            <Box mt="100vh" h="50vh">
                                <ScrollTextBox >
                                    <Box px={10} py={15}>
                                        <Text display="inline-block" fontSize="32px" lineHeight="36px">
                                            Let's look at the distribution of the flavors now. The Box plot shows the statistical spread, we can see that although some may have similar looking medians, there is a clear difference in the low end chance of grape. 
                                        </Text>
                                    </Box>
                                </ScrollTextBox>
                            </Box>
                        </Step>
                        <Step data={8} key={8}>
                            <Box mt="100vh" h="50vh">
                                <ScrollTextBox >
                                    <Box px={10} py={15}>
                                        <Text display="inline-block" fontSize="32px" lineHeight="36px">
                                            Adding the individual distribution numbers to get a sense of how they are spread out here.
                                        </Text>
                                    </Box>
                                </ScrollTextBox>
                            </Box>
                        </Step>
                        <Step data={9} key={9}>
                            <Box mt="100vh" h="50vh">
                                <ScrollTextBox >
                                    <Box px={10} py={25}>
                                        <Text display="inline-block" fontSize="32px" lineHeight="36px">
                                            Let's take a look at this on a batch basis now. So far there has been 8 total batches we've gone through since starting to track data. 
                                        </Text>
                                        <Text display="inline-block" fontSize="32px" lineHeight="36px" py="10px">
                                            There definitely is some variation is the amount in each, particularly for graape and raspberry
                                        </Text>
                                    </Box>
                                </ScrollTextBox>
                            </Box>
                        </Step>
                        <Step data={10} key={10}>
                            <Box mt="100vh" h="50vh" mb="200px">
                                <ScrollTextBox >
                                    <Box px={10} py={15}>
                                        <Text display="inline-block" fontSize="32px" lineHeight="36px">
                                            Who's consuming the most fruit snacks?
                                        </Text>
                                        {ranking}
                                    </Box>
                                </ScrollTextBox>
                            </Box>
                            
                        </Step>
                        {/* <Box h="200px"></Box> */}
                    </Scrollama>
                </Box>
            </Center>
            <Center mt="30px">
                
            </Center>
 
        </Box>
    )
}

export default Main;