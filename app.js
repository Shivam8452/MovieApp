require("dotenv").config();
require("./config/db").connect();
const express = require("express");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require("cors")
const app = express();
app.use(cors())
app.use(express.json());
module.exports = app;

const movies = require('./movies/movies')
// movies.forEach(element => {
//   console.log(element.title)
// });  
  
// Logic goes here
app.use(bodyParser.urlencoded({ extended: false }));

const User = require("./model/user");
const auth = require("./middleware/auth");

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}
// Register
app.post("/register", async (req, res) => {

    // Our register logic starts here
    try {
      // Get user input
      const { name, email, password } = req.body;
  
      // Validate user input
      if (!(email && password && name)) {
        res.status(400).send("All input is required");
      }
  
      // check if user already exist
      // Validate if user exist in our database
      const oldUser = await User.findOne({ email });
  
      if (oldUser) {
        return res.status(409).send("User Already Exist. Please Login");
      }
  
      //Encrypt user password
      encryptedPassword = await bcrypt.hash(password, 10);
  
      // Create user in our database
      const user = await User.create({
        name,
        email: email.toLowerCase(), // sanitize: convert email to lowercase
        password: encryptedPassword,
      });
  
      // Create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );
      // save user token
      user.token = token;
  
      // return new user
      res.status(201).json(user);
    } catch (err) {
      res.status(400).json(err);
    }
    // Our register logic ends here
  });


app.post("/login", async (req, res) => {

    // Our login logic starts here
    try {
      // Get user input
      // const { email, password } = req.body;
      const email = req.body.email
      const password = req.body.password
  
      // Validate user input
      if (!(email && password)) {
        return res.status(400).send("All input is required");
      }
      // Validate if user exist in our database
      const user = await User.findOne({ email });
  
      if (user && (await bcrypt.compare(password, user.password))) {
        // Create token
        const token = jwt.sign(
          { user_id: user._id, email },
          process.env.TOKEN_KEY,
          {
            expiresIn: "2h",
          }
        );
        localStorage.setItem('accessToken',token)
  
        // save user token
        user.token = token;
  
        // user
        return res.status(200).json({is_success: true,
        data: {
          token: user.token
          }});
          
      }
      res.status(400).json({is_success: false,
      error: {
      message: 'Invalid login credentials',
      code: 'invalid_login_credentials'
      }});
    } catch (err) {
      res.status(401).json(err);
    }
    // Our register logic ends here
  });
  function paginateddata(model) {
    return (req, res, next) => {
      const page = parseInt(req.query.page)
      // const limit = parseInt(req.query.limit)
      const limit = 10
  
      const startIndex = (page - 1) * limit
      const endIndex = page * limit
  
      const data = {}
      data.count = model.length
      data.page = page
      data.total_pages = parseInt(model.length/limit)+1 
      if (endIndex <  model.length) {
        data.next = {
          page: page + 1,
          limit: limit
        }
      }else{
        data.next = {
          page: null
        }
      }
      
      if (startIndex > 0) {
        data.previous = {
          page: page - 1,
          limit: limit
        }
      }else{
        data.previous = {
          page: null
        }
      }
      data.data = model.slice(startIndex,endIndex)
      res.paginateddata = data
      next()
    }
  }
  app.get('/movies',auth, paginateddata(movies), (req, res) => {
    res.json(res.paginateddata)
  })
  app.use('/moviesfilter', (req, res, next) => {
    const filters = req.query;
    const filteredmovies = movies.filter(movie => {
      let isValid = true;
      for (key in filters) {
        isValid = isValid && movie[key] == filters[key];
      }
      return isValid;
    });
    res.send(filteredmovies);
  });
  // app.get('/movies/:uuid',auth, (req, res) => {
  //   res.json(uuid)
  // })