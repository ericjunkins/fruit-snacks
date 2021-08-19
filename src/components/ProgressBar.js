import React, {useState, useEffect, useRef} from 'react';
import {Box, Text, Center, Button, Spacer, Flex} from "@chakra-ui/react";

import Progress from "./d3/ProgressD3";
import D3Container from "./../components/D3Container";

import stages from "./../stages";


const ProgressBar = ({stage}) => {
    const vizRef = useRef();
    return (
        <Box w="100%" position="sticky" top={0}  boxShadow="0px 5px 10px #000" border="1px solid #000">
            <Center w="100%" bg="#02242b">
                <Box w="100%" h="100px" px="150px" my="20px">
                    <D3Container ref={vizRef} id="progress" viz={Progress} data={stages} stage={stage} />
                </Box>
            </Center>
        </Box>
    )
}

export default ProgressBar;