import {
  Box,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
//   import { useEffect } from "react";
//   import { useHistory } from "react-router";
import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/Signup";

function Homepage() {
  // const history = useHistory();

  // useEffect(() => {
  //   const user = JSON.parse(localStorage.getItem("userInfo"));

  //   if (user) history.push("/chats");
  // }, [history]);

  return (
    <Container maxW="xl" centerContent>
      <Box
        d="flex"
        justifyContent="center"
        textAlign="center"
        p={3}
        bg="gray.900"
        textColor="white"
        w="100%"
        m="150px 0 15px 0"
        borderRadius="lg"
        borderWidth="1px"
      >
        <Text fontSize="4xl" fontFamily="Work sans" fontWeight="bold">
          Ping-It
        </Text>
      </Box>
      <Box w="100%" p={4} borderRadius="lg" borderWidth="1px" bg="gray.900">
        <Tabs isFitted variant="soft-rounded">
          <TabList mb="1em">
            <Tab
              textColor="blue.700"
              _selected={{ bg: "blue.700", textColor: "white" }}
              fontWeight="bold"
            >
              Login
            </Tab>
            <Tab
              textColor="blue.700"
              _selected={{ bg: "blue.700", textColor: "white" }}
              fontWeight="bold"
            >
              Sign Up
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel textColor="white" fontWeight="semibold">
              <Login />
            </TabPanel>
            <TabPanel textColor="white" fontWeight="semibold">
              <Signup />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
}

export default Homepage;
