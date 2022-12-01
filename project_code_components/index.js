const express = require('express');
const app = express();
const pgp = require('pg-promise')();
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const axios = require('axios');
const querystring = require('querystring');

const {
  query
} = require('express');

const NodeGeocoder = require('node-geocoder');

const options = {
  provider: 'google',
  //apiKey: process.env.API_KEY
};
const geocoder = NodeGeocoder(options);

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

app.get ('/home', (req, res) => {
  const query = 'SELECT * FROM reviews LIMIT 7;';
      db.any(query, [
      ])
      .then((data) => {
        console.log(data);
          res.render('pages/home',{data,});
      })
      .catch(function (err)  {
          console.log(err);
      });
  
    });

//renders the home page
app.get('/', (req, res) => {
  
  req.session.sesh_restaurant = '';
  req.session.save();
  res.render('pages/LandingPage');

});

app.get('/LandingPage', (req, res) => {
  res.render('pages/LandingPage', {});
});


//view all restaurants
app.get('/viewRestaurants', (req, res) => {    
    // db.any(query)
    //   .then(function (rows) {
    //     res.render('pages/viewRestaurants'); //, {
    //       // restaurant_id: req.session.restaurants.restaurant_id,
    //       // information: req.session.restaurants.information,
    //       // avg_rating: req.session.restaurants.avg_rating
    //     //});
    //   })
    db.any("SELECT * FROM RESTAURANTS ORDER BY name DESC")
    .then((restaurants) => {
      
      res.render("pages/viewRestaurants", {
        restaurants,
        restaurants_json: JSON.stringify(restaurants),
      });
    })
    .catch((err) => {
      res.send({
        error: true,
        message: err.message,
      });
    });
});

app.post('/viewRestaurants', async (req, res) => {
  
  const query = "SELECT name FROM RESTAURANTS WHERE name = $1"; // may need to modify
  db.one(query, [req.body.name])
    .then(async function (sesh_restaurant) {
        req.session.sesh_restaurant = req.body.name;
        req.session.save();
        res.redirect("/postResReview"); 
    })
    .catch(function (error) {
      if (error.message == 'No data returned from the query.') {
        res.render('pages/viewRestaurants', { 
          incorrect: true,
          message: "Database Empty.",
        });
      } else {
        console.log(error)
        res.send(error);
      }
    });
});

app.get('/postResReview', (req, res) => {
  res.render('pages/postResReview', {
    username: req.session.user.username,
    message: req.query.message, //idk what this is
    sesh_restaurant: req.session.sesh_restaurant}); 
});


app.post('/postResReview', async (req, res) => {

  db.any("SELECT lat, long FROM restaurants where name = $1", [req.body.restaurant])
    .then(function (coordinates) {

      let time = new Date().getTime();
      const query = "INSERT INTO reviews (username, review, rating, restaurant, lat, long, time) VALUES ($1, $2, $3, $4, $5, $6, $7);";

      db.any(query, [req.session.user, req.body.review, req.body.rating, req.body.restaurant, coordinates[0].lat, coordinates[0].long, time])
        .then(function (data) {

          res.redirect("/viewRestaurants"); 
        })
        .catch(function (error) {
          console.log(error);
          res.send(error);
          // res.redirect("/postResReview");   
        });

    }).catch(
      // this should return if the restaurant name is not found.
      function (error) {
        const restaurant_not_found = querystring.stringify({
          "message":"Restaurant not found"
        });
    
        res.redirect("/postResReview?" + restaurant_not_found);
      }
    );
});

// app.get('/', (req, res) =>{
//     res.redirect('/AboutUs'); //this will call the /anotherRoute route in the API
// });

app.get('/register', (req, res) => {
  res.render('pages/register', {});
});

app.post('/register', async (req, res) => {

  const hash = await bcrypt.hash(req.body.password, 10);


  const query = "INSERT INTO users (email, username, password) VALUES ($1, $2, $3);";

  db.any(query, [req.body.email, req.body.username, hash])
    .then(function (data) {
      res.redirect("/login");
    })
    .catch(function (error) {
      // res.send("reg error")

      if (error.message == 'duplicate key value violates unique constraint "users_pkey"') {
        res.render('pages/register', {
          taken: true,
          message: "Email or username is taken",
        });
      }
      // console.log(error.message);
      // res.redirect("/register");

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
        // req.session.user = {
        //     api_key: process.env.API_KEY,
        // };

        req.session.user = req.body.username;

        req.session.save();

        // this should be changed soon
        res.redirect("/reviews");


      } else {

        res.render('pages/login', {
          incorrect: true,
          message: "Incorrect username or password.",
        });

        // throw Error("Incorrect username or password.");
      }
    })
    .catch(function (error) {

      if (error.message == 'No data returned from the query.') {
        res.render('pages/login', {
          incorrect: true,
          message: "Incorrect username or password.",
        });
      } else {
        console.log(error)
        res.send(error);
        // res.redirect("/login");
      }



    });

});

const auth = (req, res, next) => {
  if (!req.session.user) {
  // Default to register page.
    return res.redirect('/reviews');
  }
  next();
};

// Authentication Required
app.use(auth);

//post review
// app.post('/postReview', async (req, res) => {
//   const review = req.body.review;
//   const rating = req.body.rating;
//   const review_id = req.body.review_id;
//   const query = "INSERT INTO reviews(rating, review_id, review) VALUES($1, $2, $3) returning * ;";

//   db.any(query, [rating, review_id, review])

//   .then(function (data) {
//     res.redirect('pages/reviews', {
//       data: data,
//       message: `Successfully added review ${req.body.review_id}`,
//     })
//   })
//   .catch(function (err) {
//     res.redirect("pages/postReview", {
//       reviews: [],
//       err: true,
//       message: err.message,
//     });
//   });

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


app.get('/reviews', (req, res) => {

  db.any("SELECT * FROM REVIEWS ORDER BY time DESC")
    .then((reviews) => {
      
      res.render("pages/reviews", {
        reviews,
        reviews_json: JSON.stringify(reviews),
      });
    })
    .catch((err) => {
      res.send({
        error: true,
        message: err.message,
      });
    });

});


app.get('/postReview', (req, res) => {
  res.render('pages/postReview', {
    username: req.session.user.username,
    message: req.query.message});
});


app.post('/postReview', async (req, res) => {

  db.any("SELECT lat, long FROM restaurants where name = $1", [req.body.restaurant])
    .then(function (coordinates) {
      
      let time = new Date().getTime();
      const query = "INSERT INTO reviews (username, review, rating, restaurant, lat, long, time) VALUES ($1, $2, $3, $4, $5, $6, $7);";

      db.any(query, [req.session.user, req.body.review, req.body.rating, req.body.restaurant, coordinates[0].lat, coordinates[0].long, time])
        .then(function (data) {

          res.redirect("/reviews"); //  --------------------in future change to view review page
        })
        .catch(function (error) {
          console.log(error);
          res.send(error);
          // res.redirect("/postReview");   
        });

    }).catch(
      // this should return if the restaurant name is not found.
      function (error) {
        const restaurant_not_found = querystring.stringify({
          "message":"Restaurant not found"
        });
    
        res.redirect("/postReview?" + restaurant_not_found);
      }
    );


});


app.get('/addRestaurants', (req, res) => {

  db.any("SELECT * FROM RESTAURANTS left join (select restaurant, AVG(rating) from reviews group by restaurant) as average_rating on Restaurants.name = average_rating.restaurant;")
    .then((restaurants) => {
      res.render("pages/addRestaurants", {
        restaurants,
        json: JSON.stringify(restaurants),
        message: req.query.message
      });
    })
    .catch((err) => {
      res.send({
        error: true,
        message: err.message,
      });
    });

});


app.post('/addRestaurants', async (req, res) => {
  // console.log(process.env.API_KEY);
  const geocode_info = await geocoder.geocode(req.body.address);


  try {
    const query = "INSERT INTO restaurants (name, address, lat, long) VALUES ($1, $2, $3, $4);";
    db.any(query, [req.body.name, geocode_info[0].formattedAddress, geocode_info[0].latitude, geocode_info[0].longitude])
      .then(function (data) {
        res.redirect("/addRestaurants");
      })
      .catch(function (error) {
        const error_message = querystring.stringify({
          "message":"Something went wrong"
        });
    
        res.redirect("/addRestaurants?" + error_message);
      });
  } catch {
    const address_not_found = querystring.stringify({
      "message":"Address not found"
    });

    res.redirect("/addRestaurants?" + address_not_found);
    // this should redirect with error message
  }
});





app.get("/logout", (req, res) => {
  req.session.destroy();
  res.render("pages/LandingPage");
});

