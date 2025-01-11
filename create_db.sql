# Create database script for Forum App
# Create the database
CREATE DATABASE myForum;

USE myForum;

# Create the tables
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userName` varchar(50) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;


CREATE TABLE `topics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `topicName` varchar(50) DEFAULT NULL,
  `topicDescription` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;


CREATE TABLE `postallocation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int DEFAULT NULL,
  `topicId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `topicId` (`topicId`),
  CONSTRAINT `postallocation_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`),
  CONSTRAINT `postallocation_ibfk_2` FOREIGN KEY (`topicId`) REFERENCES `topics` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4;

CREATE TABLE `posts` (
  `id` int NOT_NULL AUTO_INCREMENT,
  `content` varchar(280) DEFAULT NULL,
  `allocationId` int DEFAULT NULL,
  KEY `allocationId` (`allocationId`),
  PRIMARY KEY (`id`),
  CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`allocationId`) REFERENCES `postallocation` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `memberof` (
  `userId` int DEFAULT NULL,
  `topicId` int DEFAULT NULL,
  KEY `userId` (`userId`),
  KEY `topicId` (`topicId`),
  CONSTRAINT `memberof_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`),
  CONSTRAINT `memberof_ibfk_2` FOREIGN KEY (`topicId`) REFERENCES `topics` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


# Create the app user and give it access to the database
CREATE USER 'appuser' @'localhost' IDENTIFIED WITH mysql_native_password BY 'app2027';

GRANT ALL PRIVILEGES ON myForum.* TO 'appuser' @'localhost';