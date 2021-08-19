import React, {useState, useEffect, useRef} from 'react';
import {Box, Text, Center, SimpleGrid, Icon, VStack} from "@chakra-ui/react";

import {Grape, Strawberry, Orange, Peach, Raspberry} from "./../assets/FruitIcons";


const Snacks = (props) => {

    return (
        <Center w="100%">
            <Box w="80%" mt="100px" px={10} py={5} bg="#fff" display="inline-block" borderRadius="20px" border="1px solid" borderColor="#000"  boxShadow="5px 10px 10px #000">
                <Text display="inline-block" fontSize="32px"> First let's </Text>
                <Text display="inline-block" fontSize="32px" px={2} color="primary" fontWeight={500}> learn  </Text>
                <Text display="inline-block" fontSize="32px"> a little bit about the snack pack </Text>
                <SimpleGrid columns={5} spacing={10} mb={"20px"} mt="70px">
                    <Icon as={Grape} boxSize="200px"/>
                    <Icon as={Strawberry} boxSize="200px"/>
                    <Icon as={Orange} boxSize="200px"/>
                    <Icon as={Peach} boxSize="200px"/>
                    <Icon as={Raspberry} boxSize="200px"/>
                </SimpleGrid>
                <Text fontSize="32px" display="inline-block" mt="60px"> 
                    There are 5 possible flavors.
                </Text>
                <Text fontSize="32px" display="inline-block" color="grape" mx={1} fontWeight={500}> 
                    Grape,
                </Text>
                <Text fontSize="32px" display="inline-block" color="strawberry" mx={1} fontWeight={500}> 
                    Strawberry,
                </Text>
                <Text fontSize="32px" display="inline-block" color="orange" mx={1} fontWeight={500}> 
                    Orange,
                </Text>
                <Text fontSize="32px" display="inline-block" color="peach" mx={1} fontWeight={500}> 
                    Peach,
                </Text>
                <Text fontSize="32px" display="inline-block" color="raspberry" mx={1} fontWeight={500}> 
                    Raspberry.
                </Text>
                <Text fontSize="32px" display="inline-block"> 
                    In an ideal world these would each be equally distributed in each pack, however that doesn't appear to be the case at all...
                </Text>

            </Box>
        </Center>
    )
}

export default Snacks;


