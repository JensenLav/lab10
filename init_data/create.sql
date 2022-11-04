CREATE TABLE IF NOT EXISTS users (
    username VARCHAR(50) PRIMARY KEY,
    password CHAR(60) NOT NULL
);

CREATE TABLE IF NOT EXISTS restaurants (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(50),
    reviews VARCHAR(50)

);

CREATE TABLE IF NOT EXISTS reviews( 
    username VARCHAR(50) PRIMARY KEY,
    review VARCHAR(50)
);