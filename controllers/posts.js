const jwt = require('jsonwebtoken');
const con = require('../config/connect');
const fs = require('fs');

/* Récupère tout les posts et les renvoient dans l'ordre décroissant par rapport à la date*/
exports.getAllposts = (req, res, next) => {

    /* Récupère les commentaires */
    let all_posts_comments = `SELECT * FROM posts JOIN users_posts_comments ON id_post = postId_user_post_comment JOIN users ON userId_user_post_comment = id_user ORDER BY date_post DESC`;
    con.query(all_posts_comments, (err, posts_comments, fields) => {
        if (err) throw err;

        /* Récupère les posts commentés */
        con.query(`SELECT * FROM posts WHERE comment_post = true`, (err, all_posts_comment) => {
            for (let i = 0; i < all_posts_comment.length; i++) {
                let comment = [];
                for (let y = 0; y < posts_comments.length; y++) {
                    if (all_posts_comment[i].id_post == posts_comments[y].postId_user_post_comment) {
                        let user_comment = {
                            id_comment: posts_comments[y].id_user_post_comment,
                            comment: posts_comments[y].texte_user_post_comment,
                            name: posts_comments[y].name_user,
                            firstname: posts_comments[y].firstname_user,
                            picture: posts_comments[y].picture_user,
                            date: posts_comments[y].date_user_post_comment
                        };
                        comment.push(user_comment);
                    };

                }

                /* Récupère les données de l'utilsiateur qui a créé le post */
                con.query(`SELECT name_user, firstname_user, picture_user FROM users WHERE id_user = ${all_posts_comment[i].userid_post}`, (err, userBuild, fields) => {
                    let user_build = {
                        ...userBuild[0]
                    };
                    all_posts_comment.push({
                        ...all_posts_comment[i],
                        user_build,
                        comment,
                    })
                })
            }

            /* Récupère les posts non commentés */
            let posts_no_comment = `SELECT userid_post, nbLike_post, nbDislike_post, date_post, id_post, titre_post, text_post, picture_post, picture_user, name_user, firstname_user FROM posts  JOIN users ON userid_post = id_user WHERE comment_post = false ORDER BY date_post DESC `;
            con.query(posts_no_comment, (err, post_no_comment, fields) => {
                let publication_commenter = [];
                for (let i = 0; i < post_no_comment.length; i++) {

                    /* Récupère l'utilisateur qui a créé le post */
                    con.query(`SELECT name_user, firstname_user, picture_user FROM users WHERE id_user = ${post_no_comment[i].userid_post}`, (err, userBuild, fields) => {
                        let user_build = {
                            ...userBuild[0]
                        };
                        post_no_comment[i] = {
                            ...post_no_comment[i],
                            user_build,
                            comment: []
                        }
                    });
                }
                for (let i = all_posts_comment.length / 2; i < all_posts_comment.length; i++) {
                    publication_commenter.push(all_posts_comment[i])
                }

                /* Récupère l'utilisateur qui a effectué la requête */
                con.query(`SELECT * FROM users WHERE id_user = ${req.auth.userId}`, (err, user) => {
                    res.status(200).json({ publication_commenter, post_no_comment, userId: req.auth.userId, droit: user[0].droit_user });
                })
            });
        });

    });
};

/* Renvoie un seul post */
exports.getOnepost = (req, res, next) => {

    /* Récupération du post */
    con.query(`SELECT * FROM posts WHERE id_post = ${req.params.id}`, (err, onepost, fields) => {
        if (err) throw err;
        if (onepost.length != 0) {

            if (onepost[0].comment_post == true) {
                /* Récupère les commentaires en lien avec le post */
                con.query(`SELECT * FROM users_posts_comments WHERE postId_user_post_comment = ${onepost[0].id_post}`, (err, commentaire) => {
                    let comment = [];
                    for (let i = 0; i < commentaire.length; i++) {

                        /* Récupèration des informations de ceux qui ont commenté le post */
                        con.query(`SELECT * FROM users WHERE id_user= ${commentaire[i].userId_user_post_comment}`, (err, user) => {
                            let user_comment = {
                                comment: commentaire[i].texte_user_post_comment,
                                id_comment: commentaire[i].id_user_post_comment,
                                name: user[0].name_user,
                                firstname: user[0].firstname_user,
                                picture: user[0].picture_user,
                                date: commentaire[i].date_user_post_comment
                            };
                            comment.push(user_comment);
                        });
                    }

                    /* Récupération des données de l'utilisateur qui a créé le post */
                    con.query(`SELECT name_user, firstname_user, picture_user, droit_user FROM users WHERE id_user = ${onepost[0].userid_post}`, (err, userBuild, fields) => {
                        let user_build = {
                            ...userBuild[0]
                        };
                        onepost = {
                            ...onepost[0],
                            comment,
                            user_build
                        }

                        /* Récupération des données de l'utilisateur qui effectue la requête */
                        con.query(`SELECT * FROM users WHERE id_user = ${req.auth.userId}`, (err, user) => {
                            res.status(200).json({ publication_commenter: [onepost], post_no_comment: [], userId: req.auth.userId, droit: user[0].droit_user });
                        });
                    });
                });
            }

            /* Si il n'y a pas de commentaire on récupère just les informations du l'utilisateur qui a créé le post puis celui qui a envoyé la requête */
            else {
                con.query(`SELECT name_user, firstname_user, picture_user, droit_user FROM users WHERE id_user = ${onepost[0].userid_post}`, (err, userBuild, fields) => {
                    let user_build = {
                        ...userBuild[0]
                    };
                    onepost = {
                        ...onepost[0],
                        user_build,
                        comment: []
                    }
                    con.query(`SELECT * FROM users WHERE id_user = ${req.auth.userId}`, (err, user) => {
                        res.status(200).json({ publication_commenter: [], post_no_comment: [onepost], userId: req.auth.userId, droit: user[0].droit_user });
                    });
                });

            }
        }
        else {
            res.status(400).json({ message: "ce post n'éxiste pas" });
        }

    });
};

/* Création d'un post */
exports.createPost = (req, res, next) => {
    const objet = JSON.parse(req.body.post);

    /* Création du post dans la base de données */
    const post = `INSERT INTO posts (userid_post, titre_post, text_post, picture_post, date_post) VALUES (${req.auth.userId}, "${objet.titre}", "${objet.texte}", "${req.protocol}://${req.get('host')}/${req.file.destination}/${req.file.filename}", NOW())`;
    con.query(post, (err, result, fields) => {
        if (err) throw err;
        res.status(201).json({ message: "post créé" });
    });
    const this_post = `SELECT id_post FROM posts ORDER BY id_post DESC`;

    /* On créé des like_id initialisé à 1 dans la table qui regroupe le post, l'utilisateur et le like.Cela nous permettra par la suite de just mettre à jour les données si l'utilisateur like ou dislike */
    con.query(this_post, (err, post) => {
        con.query(`SELECT id_user FROM users`, (err, users) => {
            for (let i = 0; i < users.length; i++) {
                con.query(`INSERT INTO users_posts_likes (user_id, post_id, like_id) VALUES (${users[i].id_user}, ${post[0].id_post}, 1) `, (err, resul) => {
                    if (err) throw err;
                });
            }

        });

    });
};

/* Modification d'un post */
exports.modifyPosts = (req, res, next) => {

    /* Récupération du post que l'on veut modifié */
    let post = `SELECT * FROM posts WHERE id_post = ${req.params.id}`;
    con.query(post, (err, this_post, field) => {
        if (err) throw err;
        if (this_post[0].userid_post && this_post[0].userid_post == req.auth.userId || req.auth.userId == 1) {
            let modif;
            if (req.file) {
                let objet = JSON.parse(req.body.post);

                /* Suppression de l'image précèdente */
                fs.unlink(this_post[0].picture_post, () => console.log("image supprimée"));

                /* Mise à jour des données dans le post */
                con.query(`UPDATE posts SET titre_post = "${objet.titre}" , text_post = "${objet.texte}", picture_post = "${req.protocol}://${req.get('host')}/${req.file.destination}/${req.file.filename}"  WHERE id_post = ${this_post[0].id_post}`, (err, result, feilds) => {
                    if (err) throw err;
                    res.status(200).json({ message: "post modifié", picture: `${req.protocol}://${req.get('host')}/${req.file.destination}/${req.file.filename}` });
                });
            }

            /* Si il n'y a pas d'images on est pas obligé de "parse" le body de la requête */
            else {
                modif = `UPDATE posts SET titre_post = REPLACE(titre_post, "${this_post[0].titre_post}","${req.body.titre}"), text_post = REPLACE(text_post, "${this_post[0].text_post}","${req.body.texte}") WHERE id_post = ${req.params.id}`;
                con.query(`UPDATE posts SET titre_post = "${req.body.titre}", text_post = "${req.body.texte}" WHERE id_post = ${req.params.id}`, (err, result, feilds) => {
                    if (err) throw err;
                    con.query(`SELECT * FROM posts WHERE id_post = ${req.params.id}`, (err, new_post) => {
                        res.status(200).json({ message: "post modifié", titre: new_post[0].titre_post, texte: new_post[0].text_post, picture: new_post[0].picture_post });
                    });

                });

            }


        }
        else {
            res.status(401).json({ message: "non authorisé" })
        };

    });

};

exports.deletePosts = (req, res, next) => {

    /* Récupère l'utilisateur qui a envoyé la requête */
    con.query(`SELECT * FROM users WHERE id_user = ${req.auth.userId}`, (err, user, fields) => {
        if (err) throw err;
        let post_id;
        if (req.params.id) {
            post_id = req.params.id;
        }
        else {
            post_id = req.body.post;
        }

        /* On récupère le post qui a pour id le nombre envoyé par le front */
        let post = `SELECT * FROM posts  WHERE id_post = ${post_id}`;
        con.query(post, (err, this_post, fields) => {
            if (err) throw err;

            /* On vérifie si le post appartient bien a l'utilisateur qui a effectué la requête */
            if (this_post[0].userid_post && this_post[0].userid_post == req.auth.userId || user[0].droit_user == 1) {
                fs.unlink(this_post[0].picture_post, () => console.log("image supprimée"));
                let delpost = `DELETE FROM posts WHERE id_post = ${post_id}`;
                con.query(delpost, (err, resul, field) => {
                    if (err) throw err;
                });
                res.status(200).json({ message: "objet supprimé" });
            }
            else {
                res.status(401).json({ message: "non authorisé" })
            };
        });
    });

};


/* Création d'un like ou d'un dislike */
exports.create_like = (req, res) => {
    let like_id;
    /* Récupération du post */
    let post = `SELECT * FROM posts WHERE id_post = ${req.body.post}`;
    con.query(post, (err, result) => {
        if (err) throw err;

        /* Récupération de like_id entre le post et l'utilisateur qui effectue la requête */
        con.query(`SELECT * FROM users_posts_likes WHERE post_id = ${result[0].id_post} && user_id = ${req.auth.userId}`, (err, resu, fields) => {
            switch (req.body.like) {
                case 2: {

                    /* On regarde le nombre du like_id précédent */
                    if (resu[0].like_id == 1 || resu[0].like_id == 3) {
                        like_id = 2;
                        if (resu[0].like_id == 1) {

                            /* Mise a jour du like_id */
                            con.query(`UPDATE posts SET nbLike_post = ${result[0].nbLike_post + 1} WHERE id_post = ${result[0].id_post}`, (err, rep, fields) => {
                                if (err) throw err;
                                res.status(200).json({ rep: true, dislike: 0, like: 1 });
                            });
                        }
                        else if (resu[0].like_id == 3) {

                            con.query(`UPDATE posts SET nbLike_post = ${result[0].nbLike_post + 1}, nbDislike_post = ${result[0].nbDislike_post - 1} WHERE id_post = ${result[0].id_post}`, (err, rep, fields) => {
                                if (err) throw err;
                                res.status(200).json({ rep: true, dislike: -1, like: 1 });
                            });
                        }
                    }
                    else if (resu[0].like_id == 2) {
                        like_id = 1;
                        con.query(`UPDATE posts SET nbLike_post = ${result[0].nbLike_post - 1}, nbDislike_post = ${result[0].nbDislike_post = 0} WHERE id_post = ${result[0].id_post}`, (err, rep, fields) => {
                            if (err) throw err;
                            res.status(200).json({ rep: true, dislike: 0, like: -1 });
                        });
                    }
                    let like = `UPDATE users_posts_likes SET like_id = ${like_id} WHERE post_id = ${result[0].id_post} && user_id = ${req.auth.userId}`;
                    con.query(like, (err, resul) => {
                    });

                    break;
                };
                case 3: {
                    if (resu[0].like_id == 1 || resu[0].like_id == 2) {
                        like_id = 3;
                        if (resu[0].like_id == 1) {
                            con.query(`UPDATE posts SET nbDislike_post = ${result[0].nbDislike_post + 1} WHERE id_post = ${result[0].id_post}`, (err, rep, fields) => {
                                if (err) throw err;
                                res.status(200).json({ dislike: 1, like: 0 });
                            });
                        }
                        else if (resu[0].like_id == 2) {
                            con.query(`UPDATE posts SET nbLike_post = ${result[0].nbLike_post - 1}, nbDislike_post = ${result[0].nbDislike_post + 1} WHERE id_post = ${result[0].id_post}`, (err, rep, fields) => {
                                if (err) throw err;
                                res.status(200).json({ dislike: 1, like: -1 });
                            });
                        }
                    }

                    else if (resu[0].like_id == 3) {
                        like_id = 1;
                        con.query(`UPDATE posts SET nbLike_post = ${result[0].nbDislike_post - 1}, nbDislike_post = ${result[0].nbDislike_post = 0} WHERE id_post = ${result[0].id_post}`, (err, rep, fields) => {
                            if (err) throw err;
                            res.status(200).json({ dislike: -1, like: 0 });
                        });
                    }
                    let like = `UPDATE users_posts_likes SET like_id = ${like_id} WHERE post_id = ${result[0].id_post} && user_id = ${req.auth.userId}`;
                    con.query(like, (err, resul) => {
                        if (err) throw err;
                    });
                    break;
                };
            }
        });
    });
};

exports.create_comment = (req, res) => {

    /* Récupération de l'utilisateur qui effectue cette requête */
    con.query(`SELECT * FROM users WHERE id_user = ${req.auth.userId}`, (err, user) => {
        let comment = `INSERT INTO users_posts_comments (userId_user_post_comment, postId_user_post_comment, texte_user_post_comment, date_user_post_comment) VALUES (${req.auth.userId}, ${req.body.post}, "${req.body.comment}", NOW())`;

        /* Création du commentaire */
        con.query(comment, (err, result, fields) => {
            if (err) throw err;

            /* Récupération du post commenté */
            con.query(`SELECT * FROM posts WHERE id_post = ${req.body.post}`, (err, resu, champs) => {
                if (err) throw err;

                /* Récupération des commentaires dans l'ordre décroissant par rapport à id_user_comment afin de retourné l'id du commentaire qui veint d'être créé */
                con.query(`SELECT * FROM users_posts_comments ORDER BY id_user_post_comment DESC`, (err, commentaires) => {
                    if (err) throw err;
                    if (resu[0].comment_post == false) {

                        /* On met à jour comment_post à true ce qui permet de dire que ce post contient au moins 1 commentaire */
                        con.query(`UPDATE posts SET comment_post = true WHERE id_post = ${req.body.post}`, (err, result, field) => {
                            if (err) throw err;
                            res.status(201).json({ name: user[0].name_user, firstname: user[0].firstname_user, picture: user[0].picture_user, id_comment: commentaires[0].id_user_post_comment });
                        });
                    }
                    else if (resu[0].comment_post == true) {
                        res.status(201).json({ name: user[0].name_user, firstname: user[0].firstname_user, picture: user[0].picture_user, id_comment: commentaires[0].id_user_post_comment });
                    }
                    else {
                        res.status(400).json({ message: "commentaire non créé" });
                    }
                });


            });
        })
    })

};

exports.delete_comment = (req, res) => {

    con.query(`SELECT * FROM users WHERE id_user = ${req.auth.userId}`, (err, user, fields) => {
        if (err) throw err;
        let comment = `SELECT * FROM users_posts_comments  WHERE id_user_post_comment = ${req.body.id_comment}`;
        con.query(comment, (err, this_comment, fields) => {
            if (err) throw err;
            if (this_comment.length == 1) {
                con.query(`UPDATE posts SET comment_post = false WHERE id_post = ${req.body.post}`, (err, result) => {
                })
            };

            if (this_comment[0].id_user_post_comment && this_comment[0].userId_user_post_comment == req.auth.userId || user[0].droit_user == 1) {
                let delcomment = `DELETE FROM users_posts_comments WHERE id_user_post_comment = ${this_comment[0].id_user_post_comment}`;
                con.query(delcomment, (err, resul, field) => {
                    if (err) throw err;
                });
                res.status(200).json({ message: "objet supprimé" });
            }
            else {
                res.status(401).json({ message: "non authorisé" })
            };


        });
    });
}