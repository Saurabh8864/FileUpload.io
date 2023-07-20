import axios from "axios";
import { UserContextProvider } from "./context/UserContext";
import Routeh from "./Routeh";


function App() {
  axios.defaults.baseURL = "http://localhost:4000";
  axios.defaults.withCredentials = true;

  return (
    <UserContextProvider>
      <Routeh />
    </UserContextProvider>
  );
}

export default App;
