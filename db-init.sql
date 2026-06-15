
-- Create the Cocktails table
CREATE TABLE Cocktails (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    glassType TEXT,
    price DECIMAL(5, 2) NOT NULL,

    CONSTRAINT "q_unique_title" UNIQUE ("title")
);

-- Insert mocktails into the Cocktails table
INSERT INTO Cocktails (title, description, glassType, price) VALUES
('Virgin Mojito', 'A refreshing mix of mint, lime, and soda water. Steps: 1. Muddle mint leaves and lime in a glass. 2. Add ice and soda water. 3. Stir well.', 'Highball', 4.50),
('Shirley Temple', 'A sweet and fizzy blend of ginger ale and grenadine. Steps: 1. Fill a glass with ice. 2. Add ginger ale and grenadine. 3. Garnish with a cherry.', 'Highball', 3.75),
('Virgin Piña Colada', 'A tropical blend of pineapple juice and coconut cream. Steps: 1. Blend pineapple juice and coconut cream with ice. 2. Pour into a chilled glass. 3. Garnish with a pineapple slice.', 'Collins', 5.00),
('Virgin Mary', 'A non-alcoholic version of the classic Bloody Mary. Steps: 1. Mix tomato juice, lemon juice, and Worcestershire sauce. 2. Add a dash of hot sauce and stir. 3. Serve over ice with a celery stick.', 'Highball', 4.25),
('Cinderella', 'A fruity mix of orange, lemon, and pineapple juices. Steps: 1. Combine juices in a shaker with ice. 2. Shake well and strain into a glass. 3. Garnish with a cherry and orange slice.', 'Margarita', 4.00),
('Nojito', 'A non-alcoholic version of the classic Mojito. Steps: 1. Muddle mint leaves and lime in a glass. 2. Add sugar, ice, and soda water. 3. Stir well.', 'Highball', 4.50),
('Fruit Punch', 'A blend of various fruit juices and soda. Steps: 1. Mix fruit juices in a large container. 2. Add soda and stir well. 3. Serve over ice.', 'Old Fashioned', 3.50),
('Apple Fizz', 'A refreshing mix of apple juice and soda water. Steps: 1. Combine apple juice and soda water in a glass. 2. Add ice and stir. 3. Garnish with an apple slice.', 'Collins', 3.75),
('Strawberry Lemonade', 'A sweet and tangy mix of strawberries and lemon juice. Steps: 1. Blend strawberries with lemon juice and sugar. 2. Add ice and water. 3. Stir well.', 'Highball', 4.00),
('Mint Lemonade', 'A refreshing blend of mint and lemon. Steps: 1. Muddle mint leaves in a glass. 2. Add lemon juice, water, and ice. 3. Stir well.', 'Collins', 3.75),
('Virgin Margarita', 'A non-alcoholic version of the classic Margarita. Steps: 1. Mix lime juice, orange juice, and simple syrup. 2. Shake well and strain into a glass with ice. 3. Garnish with a lime slice.', 'Margarita', 4.50),
('Peach Bellini Mocktail', 'A sweet blend of peach puree and sparkling water. Steps: 1. Blend peach puree until smooth. 2. Combine with sparkling water in a glass. 3. Stir gently.', 'Coupe', 5.00),
('Blue Lagoon Mocktail', 'A vibrant mix of blue curacao syrup, lemonade, and soda. Steps: 1. Mix blue curacao syrup and lemonade in a shaker with ice. 2. Shake well and strain into a glass. 3. Top with soda.', 'Highball', 4.25),
('Cucumber Cooler', 'A refreshing blend of cucumber and mint. Steps: 1. Muddle cucumber and mint in a glass. 2. Add lime juice, soda water, and ice. 3. Stir well.', 'Collins', 4.00),
('Tropical Fizz', 'A tropical mix of pineapple and coconut. Steps: 1. Combine pineapple juice and coconut water in a shaker with ice. 2. Shake well and strain into a glass. 3. Garnish with a pineapple slice.', 'Margarita', 4.75);
