const express = require('express');
const app = express();
const pgp = require('pg-promise')();
const bodyParser = require('body-parser');
const session = require('express-session');
// const bcrypt = require('bcrypt');
const axios = require('axios');


// database configuration
const dbConfig = {
    host: 'db',
    port: 5432,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
  };
  
  const db = pgp(dbConfig);
  
  // test your database
  db.connect()
    .then(obj => {
      console.log('Database connection successful'); // you can view this message in the docker compose logs
      obj.done(); // success, release the connection;
    })
    .catch(error => {
      console.log('ERROR:', error.message || error);
    });


    app.set('view engine', 'ejs');
    app.use(bodyParser.json());

    app.use(
        session({
          secret: "XASDASDA",
          saveUninitialized: true,
          resave: true,
        })
      );
      
      app.use(
        bodyParser.urlencoded({
          extended: true,
        })
      );

    app.listen(3000);
    console.log('Server is listening on port 3000');



    //renders the home page
    /*app.get ('/', (req, res) => {

      res.render ('pages/home');

    });*/


    app.get('/', (req, res) =>{
        res.redirect('/login'); //this will call the /anotherRoute route in the API
    });
      
   


    app.get('/register', (req, res) => {
        res.render('pages/register',{});
    });
        
    app.post('/register', async (req, res) => {

        
      const hash = await bcrypt.hash(req.body.password, 10);

      const query = "INSERT INTO users (username, email,  password) VALUES ($1, $2, $3);";
      db.any(query, [req.body.username, hash])
      db.any(query, [req.body.email, hash])
          .then(function (data) {
              res.redirect("/login");
          })
          .catch(function (error) {
              res.redirect("/register");
              
          });
    });


    app.get('/login', (req, res) => {
        res.render('pages/login.ejs', {});
    });



    app.post('/login', (req, res) => {
        
        
        const query = "SELECT password FROM users WHERE username = $1;";
        db.one(query, [req.body.username])
            .then(async function (user) {
                const match = await bcrypt.compare(req.body.password, user.password);
    
                if (match) {
                    req.session.user = {
                        api_key: process.env.API_KEY,
                    };
                    req.session.save();
  
                    res.redirect("/register");



                  } else {


                      throw Error("Incorrect username or password.");
                  }
              })
            .catch(function (error) {

                res.redirect("/login");
                
            });

    });



      // Authentication Middleware.
      const auth = (req, res, next) => {
        if (!req.session.user) {
          // Default to register page.
          return res.redirect('/register');
        }
        next();
      };

      // Authentication Required
      app.use(auth);

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.render("pages/login");
});

   
app.get("/addResturant", (req,res) => {
  req.render("pages/addResturant", {});
});

app.post("/addResturant", (req,res) => {
  const query = "INSERT INTO resturants (name, reviews) VALUES ($1, $2);";
  db.any(query, [req.body.name])
  db.any(query, [req.body.reviews])
      .then(function (data) {
          res.redirect("/home");
      })
      .catch(function (error) {
          res.redirect("/addResturant");
      });

});
  