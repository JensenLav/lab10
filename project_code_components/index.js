const express = require('express');
const app = express();
const pgp = require('pg-promise')();
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const axios = require('axios');
const { query } = require('express');


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
        res.redirect('/AboutUs'); //this will call the /anotherRoute route in the API
    });
      
    app.get('/AboutUs', (req, res) => {
      res.render('pages/AboutUs',{});
  });


    app.get('/register', (req, res) => {
        res.render('pages/register',{});
    });
   
    app.post('/register', async (req, res) => {
          //the logic goes here
          const hash = await bcrypt.hash(req.body.password, 10);
      
          //insert into database
          let query ="INSERT INTO users(username, password) VALUES($1,$2)";
          db.any(query, [req.body.username, hash])
          // db.any(query, [req.body.email, hash])
          .then(()=> {
            res.redirect('/login')
          })
          .catch(function (err) {
            console.log(err);
            res.redirect('/register')
          });
      });


    app.get('/login', (req, res) => {
        res.render('pages/login.ejs', {});
    });

    app.post('/login', async (req, res) => {
          //the logic goes here
      
      console.log(req.body.username)
        const query = "select * from users where username = $1";
      
          db.any(query, [req.body.username])
          .then(async (data) => {
            console.log(data)
            if (data.length  === 0) {
              return res.redirect('/login')
            }
      
            console.log(data)
            const match = await bcrypt.compare(req.body.password, data[0].password); //await is explained in #8
      
      
            if(!match){
              return res.redirect('/register')
            } else {
              req.session.user = {
                api_key: process.env.API_KEY,
              };
              req.session.save();
              res.redirect('/AboutUs')
            }
      
          })
          .catch(e => {
            console.log(e);
            res.redirect('/register')  
      //       throw Error ('Incorrect username or password.');
          })
      
      });

      // const auth = (req, res, next) => {
      //       if (!req.session.user) {
      //         // Default to register page.
      //         return res.redirect('/register');
      //       }
      //       next();
      //     };
      //     
      //     // Authentication Required
      //     app.use(auth);


  // added recently ---------------------------------------------------------------------------------------------------
  app.get('/postReview', (req, res) => {
    res.render('pages/postReview',{});
  });
      
  app.post('/postReview', async (req, res) => {
    const query = "INSERT INTO reviews (rating,  review) VALUES ($1, $2);";
    db.any(query, [req.body.rating, hash])
    db.any(query, [req.body.review, hash])
        .then(function (data) {
            res.redirect("/home"); //  --------------------in future change to view review page
        })
        .catch(function (error) {
            res.redirect("/postReview");   
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
  