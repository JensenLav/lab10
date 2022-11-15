CREATE TABLE IF NOT EXISTS users (
    username VARCHAR(50) PRIMARY KEY,
    email VARCHAR(50),
    password CHAR(60) NOT NULL
);

CREATE TABLE IF NOT EXISTS restaurants (
    name VARCHAR(50),
    address VARCHAR(200),
    lat DECIMAL NOT NULL,
    long DECIMAL NOT NULL

);

CREATE TABLE IF NOT EXISTS reviews( 
    username VARCHAR(100),
    review VARCHAR(400),
    rating DECIMAL NOT NULL,
    restaurant VARCHAR(100), 
    lat DECIMAL NOT NULL,
    long DECIMAL NOT NULL,
    time BIGINT
);