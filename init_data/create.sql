CREATE TABLE IF NOT EXISTS users (
    username VARCHAR(50) PRIMARY KEY;
    password CHAR(60) NOT NULL;
);

CREATE TABLE IF NOT EXISTS resturants (
    id VARCHAR(50) PRIMARY KEY;
    resturant_name VARCHAR(50) PRIMARY KEY;
    reviews VARCHAR(50);

);

CREATE TABLE IF NOT EXISTS reviews( 
    username VARCHAR(50) PRIMARY KEY;
    review VARCHAR(50);
);