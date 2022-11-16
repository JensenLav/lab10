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
    // email: process.env.POSTGRES_EMAIL,
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

const user = {
  username: undefined,
  email: undefined,
  password: undefined,
};

let reviews = {
  review_id: undefined,
  review: undefined,
  rating: undefined,
};

let restaurants = {
  restaurant_id: undefined,
  information: undefined,
  avg_rating: undefined,
};


let users_reviews = `
  SELECT
    reviews.review_id,
    reviews.review,
    reviews.rating,
    users.username = $1 AS "taken"
  FROM
    reviews
    JOIN users_reviews ON reviews.review_id = users_reviews.review_id
    JOIN users ON users_reviews.username = users.username
  WHERE users.username = $1
  ORDER BY reviews.review_id ASC;`;

let restaurants_reviews = `
SELECT
  reviews.review_id,
  reviews.review,
  reviews.rating,
  restaurants.restaurant_id = $1 AS "taken"
FROM
  reviews
  JOIN restaurants_reviews ON reviews.review_id = restaurants_reviews.review_id
  JOIN restaurants ON restaurants_reviews.restaurant_id = restaurants.restaurant_id
WHERE restaurants.restaurant_id = $1
ORDER BY reviews.review_id ASC;`;

let all_restaurants = `
SELECT
  restaurants.restaurant_id,
  restaurants.information,
  restaurants.avg_rating,
  CASE
  WHEN
  restaurants.restaurant_id IN (
    SELECT restaurants_reviews.restaurant_id
    FROM restaurants_reviews
    WHERE restaurants_reviews.review_id = $1
  ) THEN TRUE
  ELSE FALSE
  END
  AS "taken"
FROM
  restaurants
ORDER BY restaurants.restaurant_id ASC;
`;

//renders the home page
app.get ('/home', (req, res) => {

  res.render ('pages/home');

});

app.get ('/addRestaurant', (req, res) => {

  res.render ('pages/addRestaurant');

});

//postReview specifics down below
app.get('/postReview', (req, res) => {
  res.render('pages/postReview', {
    username: req.session.user.username,
    restaurant_id: req.session.restaurants.restaurant_id,
  });
});

//view all restaurants
app.get('/viewRestaurants', (req, res) => {
    const query = `SELECT * from restaurants ORDER BY avg_rating`; 
    
    db.any(query)
      .then(function (rows) {
        res.render('pages/viewRestaurants'); //, {
          // restaurant_id: req.session.restaurants.restaurant_id,
          // information: req.session.restaurants.information,
          // avg_rating: req.session.restaurants.avg_rating
        //});
      })
      .catch(function (err) {
        res.redirect("pages/home", {
          restaurants: [],
          err: true,
          message: err.message,
        });
      });
});

app.get('/reviews', (req, res) => {
  res.render('pages/reviews');
});

app.get('/AboutUs', (req, res) => {
  res.render('pages/AboutUs');
});

app.get('/', (req, res) =>{
    res.redirect('/home'); //this will call the /anotherRoute route in the API
});

app.get('/register', (req, res) => {
    res.render('pages/register');
});
   
app.post('/register', async (req, res) => {
      //the logic goes here
    const hash = await bcrypt.hash(req.body.password, 10);

    //insert into database
    let query ="INSERT INTO users(username, password) VALUES($1,$2)";
//     let query ="INSERT INTO users(username, email, password) VALUES($1,$2,$3)";
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
          res.redirect('/home')
        }
  
      })
      .catch(e => {
        console.log(e);
        res.redirect('/register')  
      })
  
  });

const auth = (req, res, next) => {
    if (!req.session.user) {
      // Default to register page.
      return res.redirect('/register');
    }
    next();
};
    
    // Authentication Required
app.use(auth);

//post review
app.post('/postReview', async (req, res) => {
  const review = req.body.review;
  const rating = req.body.rating;
  const review_id = req.body.review_id;
  const query = "INSERT INTO reviews(rating, review_id, review) VALUES($1, $2, $3) returning * ;";

  db.any(query, [rating, review_id, review])

  .then(function (data) {
    res.redirect('pages/reviews', {
      data: data,
      message: `Successfully added review ${req.body.review_id}`,
    })
  })
  .catch(function (err) {
    res.redirect("pages/postReview", {
      reviews: [],
      err: true,
      message: err.message,
    });
  });
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.render("pages/login");
});
