import React, {useState, useEffect, useRef} from 'react';
import {Box, Text, Center, SimpleGrid, Icon, VStack} from "@chakra-ui/react";

import {Grape, Strawberry, Orange, Peach, Raspberry} from "./../assets/FruitIcons";

const Introduction = (props) => {

    return (
        <Center w="100%">
            <Box w="80%" mt="100px" px={10} py={5} bg="#fff" display="inline-block" borderRadius="20px" border="1px solid" borderColor="#000"  boxShadow="5px 10px 10px #000">
                <Text fontSize="18px" fontWeight={400} pl="5px">
                    Annecdotal observation:
                </Text>
                <Text color="grape" fontWeight={700} fontSize="52px" display="inline-block" lineHeight="52px">
                    Grape 
                </Text>
                <Text display="inline-block" fontSize="32px" mx={2}>
                    feels significantly under represented in the Welch's fruit snack pack.
                </Text>
                <Text display="inline-block" fontSize="32px" fontWeight={500}  pl="5px" pt={"4px"}>
                    Is it though?
                </Text>
                <Text display="inline-block" fontSize="32px" mx={2}>
                    Keep scrolling as we'll walk through the data
                </Text>
            </Box>
        </Center>
    )
}

export default Introduction;