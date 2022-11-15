CREATE TABLE IF NOT EXISTS users (
    username VARCHAR(50) PRIMARY KEY,
    email VARCHAR(50),
    password CHAR(60) NOT NULL
);

CREATE TABLE IF NOT EXISTS restaurants (
    restaurant_id VARCHAR(50) PRIMARY KEY, -- restuarant name
    information VARCHAR(200),
    rating DECIMAL NOT NULL, 
    reviews VARCHAR(50)

);

CREATE TABLE IF NOT EXISTS reviews( 
    review_id NUMERIC PRIMARY KEY,
    review VARCHAR(400),
    rating DECIMAL NOT NULL
);

DROP TABLE IF EXISTS user_reviews;
CREATE TABLE user_reviews(
    review_id INTEGER NOT NULL REFERENCES reviews (review_id),
    username INTEGER NOT NULL REFERENCES users (username)
);

DROP TABLE IF EXISTS restaurant_reviews;
CREATE TABLE restaurant_reviews(
    review_id INTEGER NOT NULL REFERENCES reviews (review_id),
    restaurant_id INTEGER NOT NULL REFERENCES restaurants (restaurant_id)
);