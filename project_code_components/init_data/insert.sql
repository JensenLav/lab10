-- INSERT INTO reviews (rating, review_id, review) VALUES
-- (5, "yo yo", 'The fried oreos slapped'),

-- INSERT INTO users (username, email, password)
-- ('aaa', 'abarbour001@gmail.com', 'Brutus');

-- INSERT INTO restaurants (restaurant_id, information, avg_rating)
-- ('Fat Shack', 'Eliminator of sunday scarries', 1);

-- INSERT INTO restaurants_reviews (restaurant_id, review_id)
-- ('Fat Shack', "yo yo");

-- INSERT INTO users_reviews (username, review_id) VALUES
-- ('aaa', "yo yo");

INSERT INTO reviews (username, review, rating, restaurant, lat, long, time) VALUES
('john doe', 'amazin', 4, 'good food inc', 40.007213421114706, -105.280100464351, 1668399680240),
('jane doe', 'also amazin',  1, 'smart food', 37.43031496414661, -122.17635330586151, 1668399650247);


INSERT INTO restaurants (name, information, res_rating, address, lat, long) VALUES 
('good food inc', 'has good food', 5, '1093 10th St Boulder, Colorado', 40.007213421114706, -105.280100464351),
('smart food', 'has smart food', 3, '290 Jane Stanford Way, Stanford, CA 94305', 37.43031496414661, -122.17635330586151);
