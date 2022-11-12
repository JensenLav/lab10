CREATE TABLE IF NOT EXISTS users (
    username VARCHAR(50) PRIMARY KEY,
    email VARCHAR(50),
    password CHAR(60) NOT NULL
);

CREATE TABLE IF NOT EXISTS restaurants (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(50),
    information VARCHAR(200),
    rating DECIMAL NOT NULL, 
    reviews VARCHAR(50)

);

CREATE TABLE IF NOT EXISTS reviews( 
    username VARCHAR(100),
    review VARCHAR(400),
    rating DECIMAL NOT NULL,
    lat DECIMAL NOT NULL,
    long DECIMAL NOT NULL
);