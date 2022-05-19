const con = require('../config/connect');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require("fs");
const crypto = require('crypto');



exports.singup = (req, res, next) =>{
    console.log(req.body);
    const data = JSON.parse(req.body.client);
    console.log(req.file);
    bcrypt.hash(data.password,10)
        .then((hash)=>{
            con.query(`INSERT INTO users (email_user, password_user, name_user, firstname_user, picture_user) VALUES ("${data.email}","${hash}","${data.name}","${data.firstname}", "${req.protocol}://${req.get('host')}/${req.file.destination}/${req.file.filename}")`,(err, result, fields) =>{
                if(err) throw err;
                res.status(201).json({message: "Compte créé"});
            });
            con.query(`SELECT * FROM posts`, (err, posts, field)=>{
                con.query(`SELECT * FROM users WHERE email_user = "${data.email}"`, (err, user, fiel)=>{
                    for(let i = 0; i < posts.length; i++){
                        con.query(`INSERT INTO users_posts_likes (user_id, post_id, like_id) VALUES (${user[0].id_user}, ${posts[i].id_post}, 1) `, (err, like, fiel)=>{
                        })
                    }
                })
                
            })
        })
        .catch(err => res.status(400).json(err));
};

exports.login = (req,res,next) =>{
    con.query(`SELECT * FROM users WHERE email_user = "${req.body.email}"`, (err, result, fields) =>{
        if(err) {
            throw err;
        }
        console.log(result)
        if(result.length >0){
            if(req.body.email && result[0].email_user){
            
            bcrypt.compare(req.body.password, result[0].password_user)
                .then(rep => {
                    if(!rep)
                        res.status(500).json({message: "Code is false"});
                    else{
                        const xsrfToken = crypto.randomBytes(64).toString('hex');
                        let token = jwt.sign({userId:result[0].id_user, xsrfToken}, "RANDOM_SECRET_TOKEN", {expiresIn: "24h"});
                        res.status(200)
                        .cookie("token",JSON.stringify(token), {
                            httpOnly: true,
                            expires: new Date(Date.now() + 60*60*1000)
                        })
                        .json({
                            message: "Connecté",
                            userId: result[0].id_user,
                            droit: result[0].droit_user,
                            xsrfToken
                        });
                    }
                })
                .catch(err => res.status(400).json(err));
            }
        }
        else{
            res.status(400).json({message: "Il n'y a aucun compte avec cette adresse email"});
        }
        
    });
        
};

exports.getUserProfile = (req, res, next) =>{
    con.query(`SELECT email_user, name_user, firstname_user, picture_user, droit_user FROM users WHERE id_user = ${req.auth.userId}`, (err, result, fields)=>{
        if(err) {
            throw err;  
        }
        res.status(200).json(result[0]);
    });
};

exports.getUser = (req, res, next) => {
    con.query(`SELECT email_user, name_user, firstname_user, picture_user FROM users WHERE name_user = %${req.body.recherche}%`, (err, result, fields)=>{
        if(err) throw err;
        res.status(200).json(result);
    });
};
exports.modifyUserProfile = (req, res, next) =>{
    con.query(`SELECT * FROM users WHERE id_user = ${req.auth.userId}`, (err, result)=>{
        if(req.file){
        let objet = JSON.parse(req.body.client);
        con.query(`UPDATE users SET email_user = "${objet.email}", name_user = "${objet.name}", firstname_user = "${objet.firstname}", picture_user = "${req.protocol}://${req.get('host')}/${req.file.destination}/${req.file.filename}" WHERE id_user = ${req.auth.userId} `, (err, resul)=>{
            con.query(`SELECT * FROM users WHERE id_user = ${req.auth.userId}`, (err, user_update)=>{
                res.status(200).json({ name: user_update[0].name_user, firstname: user_update[0].firstname_user, email: user_update[0].email_user, picture: user_update[0].picture_user, message: "Modification(s) efféctuée(s)"});
            });
        });
        fs.unlink(result[0].picture_user, ()=> console.log("image supprimée"));
        
    }
    else{
        con.query(`UPDATE users SET email_user = "${req.body.email}", name_user = "${req.body.name}", firstname_user = "${req.body.firstname}" WHERE id_user = ${result[0].id_user}`, (err, resu, fields)=>{
            if(err) throw err;
            con.query(`SELECT * FROM users WHERE id_user = ${req.auth.userId}`, (err, user_update)=>{
                res.status(200).json({ name: user_update[0].name_user, firstname: user_update[0].firstname_user, email: user_update[0].email_user, picture: user_update[0].picture_user, message: "Modification(s) efféctuée(s)"});
            });
            
        });
    }
    
    });
    
};

exports.deleteUser = (req, res)=>{
    let user = `SELECT * FROM users WHERE id_user = ${req.auth.userId}`;
    con.query(user, (err, result, fields)=>{
        if(err) throw err;
        if(result[0].droit_user == 2){
            let user_post = `SELECT * FROM users JOIN posts ON id_user = userid_post WHERE id_user = ${req.auth.userId}`;
            con.query(user_post, (err, post, fiel)=>{
                if(err) throw err;
                if(post.length > 0){
                    for(let i =0; i<post.length; i++){
                        fs.unlink(post[i].picture_post, ()=> console.log("image supprimée"));
                    }
                };
                
            });
            fs.unlink(result[0].picture_user, ()=> console.log("image supprimée"));
            let delete_user = `DELETE FROM users WHERE id_user = ${req.auth.userId}`;
            con.query(delete_user, (err, resul, fields)=>{
                if(err) throw err;
                if(!resul[0]){
                    res.status(400).json({message: "utilisateur non supprimé"});
                }
                else{
                    res.status(200).json({message: "utilisateur supprimé"});
                };
            });
            
        }
        else{
            let user_post = `SELECT * FROM users JOIN posts ON id_user = userid_post WHERE email_user = "${req.body.user}"`;
            con.query(user_post, (err, post, fiel)=>{
                if(err) throw err;
                if(post.length > 0){
                    for(let i = 0; i<post.length; i++){
                        fs.unlink(post[i].picture_post, ()=> console.log("image supprimée"));
                    }
                };
            })
            fs.unlink(result[0].picture_user, ()=> console.log("image supprimée"));
            let delete_user = `DELETE FROM users WHERE email_user = "${req.body.user}"`;
            con.query(delete_user, (err, result, fields)=>{
                if(err) throw err;
                if(result[0]){
                    res.status(200).json({message: "utilisateur supprimé"});
                };
            });
        }
    
        
    });
};