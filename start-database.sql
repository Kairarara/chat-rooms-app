DROP DATABASE IF EXISTS my_chat_rooms;

CREATE DATABASE my_chat_rooms;

USE my_chat_rooms;

CREATE TABLE rooms(
    name VARCHAR(20) NOT NULL PRIMARY KEY,
    password CHAR(60),
    last_update TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE chat_history (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(20) NOT NULL,
    message VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    room_name VARCHAR(20) NOT NULL,
    FOREIGN KEY (room_name) REFERENCES rooms(name)
        ON DELETE CASCADE
);

DELIMITER &&

CREATE EVENT clean_unused_rooms ON SCHEDULE EVERY 1 DAY ENABLE
    DO BEGIN
        DELETE FROM rooms
        WHERE last_update < NOW() - INTERVAL 1 WEEK;        
    END &&

CREATE EVENT clean_old_messages ON SCHEDULE EVERY 1 DAY ENABLE
    DO BEGIN
        DELETE FROM chat
        WHERE created_at < NOW() - INTERVAL 1 WEEK;        
    END &&

DELIMITER ;
