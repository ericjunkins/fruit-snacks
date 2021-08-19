import logo from './logo.svg';
import './App.css';
import { ChakraProvider } from "@chakra-ui/react";


import theme from "./theme";
import Main from "./views/Main";


function App() {
  return (
    <ChakraProvider theme={theme}>
      <Main />
    </ChakraProvider>
  );
}

export default App;
