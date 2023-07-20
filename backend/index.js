const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const User = require("./modals/User");
const Message = require("./modals/message");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const ws = require("ws");
const fs  = require("fs");

dotenv.config({ path: "../backend/config/config.env" });

// database connection
mongoose.connect(process.env.MONGO_URI);

const bcryptSalt = bcrypt.genSaltSync(10);

const app = express();
app.use('/uploads',express.static(__dirname + '/uploads'));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
);

async function getUserDataFromRequest(req) {
  return new Promise((resolve, reject) => {
    const token = req.cookies?.token;
    if (token) {
      //    verify
      jwt.verify(token, process.env.JWT_SECRET, {}, (err, userData) => {
        if (err) throw err;
        resolve(userData);
      });
    } else {
      reject("no valid token");
    }
  });
}

// end point for messages or to feetch history data
app.get('/messages/:userId', async(req, res) => {
  const { userId } = req.params;
  const userData = await getUserDataFromRequest(req);
  const ourUserId = userData.userId;
  const messages = await Message.find({
    sender : {$in:[userId,ourUserId]},
    recipient : {$in:[userId,ourUserId]},
  }).sort({createdAt: 1});
  res.json(messages);
});


// end point to know online and offline people

app.get('/people',async(req,res)=>{
 const users = await User.find({},{'_id':1,username:1});
 res.json(users);
});

// test end points
app.get("/test", (req, res) => {
  res.json("ok");
});

// get the details of the user once its register

app.get('/profile', async (req, res) => {
  // grab the token from our cookie
  const token = req.cookies?.token;

  if (token) {
    //    verify
    jwt.verify(token, process.env.JWT_SECRET, {}, (err, userData) => {
      if (err) throw err;

      res.json(userData);
    });
  } else {
    res.status(401).json("no defined token");
  }
});

// end point for login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const foundUser = await User.findOne({ username });

  if (foundUser) {
    const decodedPassword = bcrypt.compareSync(password, foundUser.password);

    if (decodedPassword) {
      jwt.sign(
        { userId: foundUser._id, username },
        process.env.JWT_SECRET,
        {},
        (err, token) => {
          if (err) throw err;

          res.cookie("token", token, { sameSite: "none", secure: true }).json({
            id: foundUser._id,
          });
        }
      );
    }
  }
});


// logout

app.post('/logout',(req,res)=>{

  res.cookie('token', '',{sameSite:'none' ,secure:true}).json('ok');
})

// end point for register
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
    const createdUser = await User.create({
      username: username,
      password: hashedPassword,
    });

    // create a user and immediately log in
    jwt.sign(
      { userId: createdUser._id, username },
      process.env.JWT_SECRET,
      {},
      (err, token) => {
        if (err) throw err;

        res
          .cookie("token", token, { sameSite: "none", secure: true })
          .status(201)
          .json({
            id: createdUser._id,
            username,
          });
      }
    );
  } catch (err) {
    if (err) throw err;
    res.status(500).json("error");
  }
});

// server creation
const server = app.listen(4000, () => {
  console.log(`server is sartted`);
});

// web socket server

const wss = new ws.WebSocketServer({ server });

wss.on('connection', (connection, req) => {


function notifyAboutOnlinePeople(){
  // notify everyone about the person status wheter online or not
  [...wss.clients].forEach(client => {
    client.send(
      JSON.stringify({
        // who are online
        online: [...wss.clients].map(c => ({userId: c.userId, username: c.username})),
      }));
  });
}

  connection.isAlive = true;
 connection.timer =  setInterval(() =>{
    connection.ping();
 connection.deathTimer = setTimeout(()=>{
      connection.isAlive =false;
      clearInterval(connection.timer);
      connection.terminate();
      notifyAboutOnlinePeople();
      console.log('death');
    },1000);
  },50000);


  connection.on('pong',()=>{

    clearTimeout(connection.deathTimer);
  });
  // creating the functionality to know who is active and all credentials
  // get the cookie out of headers
  const cookies = req.headers.cookie;

  if (cookies) {
    // if sever cookies then split it
    const tokenCookieString = cookies
      .split(";")
      .find((str) => str.startsWith(" token="));

    if (tokenCookieString) {
      const token = tokenCookieString.split("=")[1];
      if (token) {
        //  decode the token
        jwt.verify(token, process.env.JWT_SECRET, {}, (err, userData) => {
          if (err) throw err;

          // send this obtained data to the connection
          const { userId, username } = userData;
          connection.userId = userId;
          connection.username = username;
        });
      }
    }
  }

  // during message send from the  ther party
  connection.on("message", async (message) => {
    messageData = JSON.parse(message.toString());
    const { recipient, text ,file } = messageData;
    let filename = null;

    if(file){
      console.log('size', file.data.length);
      const parts = file.name.split('.');
      const ext = parts[parts.length-1];
      filename = Date.now() + '.'+ext;

      const  path = __dirname + '/uploads/' +filename;


      // read the file content
      const bufferData = new Buffer.from(file.data.split[','],'base64');
    
      fs.writeFile(path,bufferData,()=>{
        console.log('file saved :'+path);
        console.log(bufferData)
      })
    }

    if (recipient && (text ||file)) {
      // save it to mogo
      const messageDoc = await Message.create({
        sender: connection.userId,
        recipient,
        text,
        file: file ? filename :null,
      });

      //can be on multiple devices
      // so thats why we used the filter not find

      [...wss.clients]
        .filter(c => c.userId === recipient)
        .forEach(c =>c.send(JSON.stringify({
              text,
              sender: connection.userId,
              recipient,
               file: file ? filename :null,
              _id: messageDoc._id,
            })));
    }
  });

  //notify
  notifyAboutOnlinePeople();
});

