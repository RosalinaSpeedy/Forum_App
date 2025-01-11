# Insert data into the tables

USE myForum;

INSERT INTO users (userName, password) VALUES('BenC', 'Adubl'), ('Uhm23', 'Cabinets123'), ('RamsesII', 'Ozymanidias');
INSERT INTO topics (topicName, topicDescription) VALUES('Blokes', 'A place to discuss the most amazing of blokes'),
    ('Cabinets', 'A place to share your thoughts on the best storage device');
INSERT INTO postAllocation (id, userId, topicId) VALUES (1,1,1),(2,1,2),(3,2,2),(4,2,1);
INSERT INTO posts (content, allocationId) VALUES ('I love Abdul he is my favourite bloke', 1), 
    ('personally, I love cabinets', 2), ('Cabinets are pretty cool I will not deny', 3),
    ('Brenton is an OK bloke but he is really not the best.', 4);

INSERT INTO memberOf (userId, topicId) VALUES(1,1),(1,2),(2,1),(2,2),(3,2);