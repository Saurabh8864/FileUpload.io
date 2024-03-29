import { useContext, useState } from "react";
import axios from "axios";
import {UserContext} from "./context/UserContext.jsx"

const RegisterAndLoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginOrRegister ,setIsLoginOrRegister] =useState('register');
 const { setUsername:setLoggedInUsername ,setId} = useContext(UserContext);


  async function handleSubmit(ev){
    ev.preventDefault();
    const url = isLoginOrRegister === 'register'? 'register':'login';
   const {data} = await axios.post(url,{username,password});
   setLoggedInUsername(username);
   setId(data._id);
  
  }
  
  return (
    <div className="bg-blue-50 h-screen flex items-center">
      <form className="w-64 mx-auto mb-12" onSubmit={handleSubmit}>

        <input
          value={username}
          onChange={(ev) => setUsername(ev.target.value)}
          type="text"
          placeholder="Username"
          className="block w-full rounded-sm  p-2 mb-3 border"
        />

        <input
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
          type="password"
          placeholder="Password"
          className="block  w-full rounded-sm p-2 mb-3 border"
        />
        <button className="bg-blue-500 text-white block w-full rounded-sm  p-2 ">
        {isLoginOrRegister === 'register'?'register':'login'}
        </button>

        <div className="text-center mt-2">
            { isLoginOrRegister ==='register'&& (
            <div>  Already Register? 
              <button onClick={()=>setIsLoginOrRegister('login')}>
                Login here
              </button>
            </div>
            )}

            {isLoginOrRegister === 'login'&&(
               <div>  Dont have an account? 
               <button onClick={()=>setIsLoginOrRegister('register')}>
                 Register here
               </button>
             </div>
            )}
      </div>
         
      </form>
    </div>
  );
};

export default RegisterAndLoginForm;
