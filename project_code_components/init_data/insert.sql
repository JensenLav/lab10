INSERT INTO reviews (rating, review_id, review) VALUES
(5, "yo yo", 'The fried oreos slapped'),

INSERT INTO users (username, email, password)
('aaa', 'abarbour001@gmail.com', 'Brutus');

INSERT INTO restaurants (restaurant_id, information, avg_rating)
('Fat Shack', 'Eliminator of sunday scarries', 1);

INSERT INTO restaurants_reviews (restaurant_id, review_id)
('Fat Shack', "yo yo");

INSERT INTO users_reviews (username, review_id) VALUES
('aaa', "yo yo");