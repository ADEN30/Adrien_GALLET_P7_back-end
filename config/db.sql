CREATE DATABASE groupomania;

USE groupomania;

CREATE TABLE users(
    id_user INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    email_user VARCHAR(255) NOT NULL UNIQUE NOT NULL,
    password_user VARCHAR(150) NOT NULL,
    name_user VARCHAR(100) NOT NULL,
    firstname_user VARCHAR(100) NOT NULL,
    picture_user VARCHAR(1000) NOT NULL,
    droit_user INTEGER DEFAULT 2
);

CREATE TABLE posts(
    id_post INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    userid_post INTEGER NOT NULL,
    titre_post VARCHAR(250) DEFAULT " " NOT NULL,
    text_post VARCHAR(200) DEFAULT " " NOT NULL,
    picture_post VARCHAR(1000),
    nbLike_post INTEGER DEFAULT 0,
    nbDislike_post INTEGER DEFAULT 0,
    date_post DATETIME,
    comment_post BOOLEAN DEFAULT false,
    FOREIGN KEY (userid_post) REFERENCES users(id_user) ON DELETE CASCADE
);

CREATE TABLE likes(
    id_like INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    like_like BOOLEAN DEFAULT false,
    dislike_like BOOLEAN DEFAULT false
);
CREATE TABLE users_posts_likes(
    user_id INTEGER,
    post_id INTEGER,
    like_id INTEGER,
    id_users_posts_likes INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    FOREIGN KEY (user_id) REFERENCES users(id_user) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id_post) ON DELETE CASCADE
);

CREATE TABLE users_posts_comments(
    id_user_post_comment INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    userId_user_post_comment INTEGER NOT NULL,
    postId_user_post_comment INTEGER NOT NULL,
    texte_user_post_comment VARCHAR(1000) NOT NULL,
    date_user_post_comment DATETIME,
    FOREIGN KEY (userId_user_post_comment) REFERENCES users(id_user) ON DELETE CASCADE,
    FOREIGN KEY (postId_user_post_comment) REFERENCES posts(id_post) ON DELETE CASCADE
);

CREATE TABLE users_salons (
    id_user_salon INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_user1_user_salon INTEGER NOT NULL,
    id_user2_user_salon INTEGER NOT NULL UNIQUE,
    date_user_salon DATETIME,
    FOREIGN KEY (id_user1_user_salon) REFERENCES users(id_user) ON DELETE CASCADE
);

CREATE TABLE salons_messages (
    id_salon_message INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_salon_salon_message INTEGER NOT NULL,
    id_userSend_salon_message INTEGER NOT NULL,
    message_salon_message VARCHAR(1000),
    date_salon_message DATETIME,
    FOREIGN KEY (id_salon_salon_message) REFERENCES users_salons(id_user_salon) ON DELETE CASCADE
);

INSERT INTO users (`email_user`, `password_user`, `name_user`, `firstname_user`, `picture_user`, `droit_user`) VALUES ("admin.ctrl@groupomania.fr", "$2b$10$BbJV4L.wGG8E0zTyfBoVpemZBPc1uR/voT1ZJPWO2TzQQoHQPuPbS", "ADMIN", "contrôle", "www/image/admin", 1);