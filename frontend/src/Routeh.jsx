import { useContext } from "react";
import RegisterAndLoginForm from "./RegisterAndLoginForm";
import { UserContext } from "./context/UserContext";
import  Chat  from  "./Chat.jsx";


export default function Routeh() {
  const { username, id } = useContext(UserContext);

  if (username) {
    return <Chat />
  }

  return <RegisterAndLoginForm />;
}
