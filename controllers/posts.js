const jwt = require('jsonwebtoken');
const con = require('../config/connect');
const fs = require('fs');

exports.getAllposts = (req,res, next) =>{
    let all_posts_comments = `SELECT postId_user_post_comment, nbLike_post, nbDislike_post, date_post, date_user_post_comment, userid_post, picture_user,id_post, titre_post, text_post, picture_post, texte_user_post_comment, picture_user, name_user, firstname_user FROM posts JOIN users_posts_comments ON id_post = postId_user_post_comment JOIN users ON userId_user_post_comment = id_user AND id_user = userid_post ORDER BY date_post DESC`;
    con.query(all_posts_comments, (err, posts_comments, fields)=>{
        if(err)throw err;
        con.query(`SELECT * FROM posts WHERE comment_post = true`, (err, all_posts_comment)=>{
        console.log(posts_comments.length);
        for(let i = 0; i< all_posts_comment.length; i++){
            let comment = [];
            for(let y = 0; y < posts_comments.length ; y++){
                if(all_posts_comment[i].id_post == posts_comments[y].postId_user_post_comment){
                    let user_comment = {
                        comment : posts_comments[y].texte_user_post_comment,
                        name : posts_comments[y].name_user,
                        firstname : posts_comments[y].firstname_user,
                        picture : posts_comments[y].picture_user,
                        date: posts_comments[y].date_user_post_comment
                    };
                    comment.push(user_comment);
                };
                
            }
            con.query(`SELECT name_user, firstname_user, picture_user FROM users WHERE id_user = ${all_posts_comment[i].userid_post}`, (err, userBuild, fields)=>{
            let user_build = {
                ...userBuild[0]
            };
            all_posts_comment.push({
                ...all_posts_comment[i],
                user_build,
                comment
            })
            console.log(all_posts_comment)
            })
        }
        
        let posts_no_comment = `SELECT nbLike_post, nbDislike_post, date_post, id_post, titre_post, text_post, picture_post, picture_user, name_user, firstname_user FROM posts  JOIN users ON userid_post = id_user WHERE comment_post = false ORDER BY date_post DESC `;
        con.query(posts_no_comment, (err, post_no_comment , fields)=>{
            let publication_commenter = [];
        for(let i = all_posts_comment.length/2 ; i < all_posts_comment.length; i++){
            publication_commenter.push(all_posts_comment[i])
        }
            res.status(200).json({publication_commenter, post_no_comment });
        });
        });
        
    });
};

exports.getOnepost = (req, res, next)=>{
    con.query(`SELECT * FROM posts WHERE id_post = ${req.params.id}`, (err, onepost, fields)=>{
        if(err) throw err;
        res.status(200).json(onepost);
    });
};

exports.createPost = (req, res, next)=>{
    const objet = JSON.parse(req.body.post);
    const post = `INSERT INTO posts (userid_post, titre_post, text_post, picture_post, date_post) VALUES (${req.auth.userId}, "${objet.titre}", "${objet.texte}", "${req.protocol}://${req.get('host')}/${req.file.path}", NOW())`;
    con.query(post, (err, result, fields)=>{
        if(err) throw err;
        res.status(201).json({message : "post créé"});
    });
    const this_post = `SELECT id_post FROM posts ORDER BY id_post DESC`;
    con.query(this_post, (err, post)=>{
        con.query(`SELECT id_user FROM users`, (err, users)=>{
            for(let i = 0; i<users.length ; i++){
                con.query(`INSERT INTO users_posts_likes (user_id, post_id, like_id) VALUES (${users[i].id_user}, ${post[0].id_post}, 0) `, (err, resul)=>{
                if(err) throw err;
            });
            }
            
        });
        
    });
};

exports.modifyPosts = (req, res, next)=>{
    let post = `SELECT * FROM posts WHERE id_post = ${req.params.id}`;
    con.query(post, (err, this_post, field)=>{
        if(err) throw err;
        if(this_post[0].userid_post && this_post[0].userid_post == req.auth.userId || req.auth.userId == 1){
            let modif;
            if(req.file){
                let objet = JSON.parse(req.body.post);
                console.log(objet);
                modif = `UPDATE posts SET titre_post= REPLACE(titre_post,"${this_post[0].titre_post}", "${objet.titre}") , text_post= REPLACE(text_post, "${this_post[0].text_post}", "${objet.texte}"), picture_post = REPLACE(picture_post,"${this_post[0].picture_post}","${req.protocol}://${req.get('host')}/${req.file.path}")  WHERE id_post = ${this_post[0].id_post}`; 
                fs.unlink(this_post[0].picture_post, ()=> console.log("image supprimée"));
                con.query(modif, (err, result, feilds)=>{
                    if(err) throw err;
                    res.status(200).json({message: "post modifié"});
                });
            }
            else{
                modif = `UPDATE posts SET titre_post = REPLACE(titre_post, "${this_post[0].titre_post}","${req.body.titre}"), text_post = REPLACE(text_post, "${this_post[0].text_post}","${req.body.texte}") WHERE id_post = ${this_post[0].id_post}`;
                con.query(modif, (err, result, feilds)=>{
                    if(err) throw err;
                    res.status(200).json({message: "post modifié"});
                });
            }
            
        }
        else{
            res.status(401).json({message: "non authorisé"})
        };
    });
    
};

exports.deletePosts = (req, res, next) =>{
    con.query(`SELECT * FROM users WHERE id_user = ${req.auth.userId}`, (err, user, fields)=>{
        if(err) throw err;
        let post = `SELECT * FROM posts  WHERE id_post = ${req.params.id}`;
        con.query(post, (err, this_post, fields)=>{
            if(err) throw err;

            if(this_post[0].userid_post && this_post[0].userid_post == req.auth.userId || user[0].droit_user == 1){
                let delpost = `DELETE FROM posts WHERE id_post = ${req.params.id}`;
                con.query(delpost, (err, resul, field)=>{
                    if(err) throw err;
                });
                res.status(200).json({message: "objet supprimé"});
            }
            else {
                res.status(401).json({message: "non authorisé"})
            };
        });
    });
    
};



exports.create_like = (req,res)=>{
    let post = `SELECT * FROM posts WHERE id_post = ${req.body.post}`;
    con.query(post, (err, result)=>{
        if(err) throw err;
        con.query(`SELECT * FROM users_posts_likes WHERE post_id = ${result[0].id_post} && user_id = ${req.auth.userId}`, (err, resu, fields)=>{
            console.log(resu)
            switch(req.body.like){
                case 1: {
                    
                    let like = `UPDATE users_posts_likes SET like_id = 1 WHERE post_id = ${result[0].id_post} && user_id = ${req.auth.userId}`;
                    con.query(like, (err, resul)=>{
                        res.status(200).json({message: "unlike or undislike"});
                        if(resu[0].like_id == 2){
                            con.query(`UPDATE posts SET nbLike_post = ${result[0].nbLike_post -1} WHERE id_post = ${result[0].id_post}`, (err, rep, fields)=>{
                                if(err) throw err;
                            });
                        }
                        else if(resu[0].like_id == 3){
                            con.query(`UPDATE posts SET nbDislike_post = ${result[0].nbDislike_post -1} WHERE id_post = ${result[0].id_post}`, (err, rep, fields)=>{
                                if(err) throw err;
                            });
                        };
                    });
                    break;
                };
                case 2: {
                    let like = `UPDATE users_posts_likes SET like_id = 2 WHERE post_id = ${result[0].id_post} && user_id = ${req.auth.userId}`;
                    con.query(like, (err, resul)=>{
                        res.status(200).json({message: "like"});
                        if(resu[0].like_id == 1){
                            con.query(`UPDATE posts SET nbLike_post = ${result[0].nbLike_post +1} WHERE id_post = ${result[0].id_post}`, (err, rep, fields)=>{
                                if(err) throw err;
                            });
                        }
                        else if(resu[0].like_id == 3){
                            con.query(`UPDATE posts SET nbLike_post = ${result[0].nbLike_post +1}, nbDislike_post = ${result[0].nbDislike_post -1} WHERE id_post = ${result[0].id_post}`, (err, rep, fields)=>{
                                if(err) throw err;
                            });
                        };
                    });
                    break;
                };
                case 3: {
                    let like = `UPDATE users_posts_likes SET like_id = 3 WHERE post_id = ${result[0].id_post} && user_id = ${req.auth.userId}`;
                    con.query(like, (err, resul)=>{
                        res.status(200).json({message: "dislike"});
                        if(resu[0].like_id == 1){
                            con.query(`UPDATE posts SET nbDislike_post = ${result[0].nbDislike_post +1} WHERE id_post = ${result[0].id_post}`, (err, rep, fields)=>{
                                if(err) throw err;
                            });
                        }
                        else if(resu[0].like_id == 2){
                            con.query(`UPDATE posts SET nbLike_post = ${result[0].nbLike_post -1}, nbDislike_post = ${result[0].nbDislike_post +1} WHERE id_post = ${result[0].id_post}`, (err, rep, fields)=>{
                                if(err) throw err;
                            });
                        };
                    });
                    break;
                };
            }
        });
    });
};

exports.create_comment = (req, res)=>{
    let comment = `INSERT INTO users_posts_comments (userId_user_post_comment, postId_user_post_comment, texte_user_post_comment, date_user_post_comment) VALUES (${req.auth.userId}, ${req.body.post}, "${req.body.comment}", NOW())`;
    con.query(comment, (err, result, fields)=>{
        if(err) throw err;
        con.query(`SELECT * FROM posts WHERE id_post = ${req.body.post}`, (err, resu, champs)=>{
            if(err) throw err;
            if(resu[0].comment_post == false){
                con.query(`UPDATE posts SET comment_post = true WHERE id_post = ${req.body.post}`, (err, result, field)=>{
                    if(err) throw err;
                    res.status(201).json({message: "commentaire créé"});
                });
            }
            else if(resu[0].comment_post == true){
                res.status(201).json({message: "commentaire créé"});
            }
            else{
                res.status(400).json({message: "commentaire non créé"});
            }
            
        });
    })
};

exports.delete_comment = (req, res) =>{
    con.query(`SELECT * FROM users WHERE id_user = ${req.auth.userId}`, (err, user, fields)=>{
        if(err) throw err;
        let comment = `SELECT * FROM users_posts_comments  WHERE userId_user_post_comment = ${user[0].id_user} AND postId_user_post_comment = ${req.body.post}`;
        con.query(comment, (err, this_comment, fields)=>{
            if(err) throw err;

            if(this_comment[0].id_user_post_comment && this_comment[0].userId_user_post_comment == req.auth.userId || user[0].droit_user == 1){
                let delcomment = `DELETE FROM users_posts_comments WHERE id_user_post_comment = ${this_comment[0].id_user_post_comment}`;
                con.query(delcomment, (err, resul, field)=>{
                    if(err) throw err;
                });
                res.status(200).json({message: "objet supprimé"});
            }
            else {
                res.status(401).json({message: "non authorisé"})
            };
        });
    });
}