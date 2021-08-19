import React, {useState, useEffect, useRef} from 'react';
import {Box, Text, Center, SimpleGrid, Icon, VStack} from "@chakra-ui/react";

const ScrollTextBox = ({opacity, children}) => {

    return (
        <Box w="100%" display="block" opacity={opacity}>
            <Box marginLeft="auto" w="550px" bg="#fff" border="1px solid #000" borderRadius="20px" boxShadow="5px 10px 10px #000">
                {children}
            </Box>

        </Box>
    )
}

export default ScrollTextBox;