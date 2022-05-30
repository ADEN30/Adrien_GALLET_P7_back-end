const con = require('../config/connect');

exports.create_Message = (req, res) => {
    let user1 = `SELECT * FROM users_salons WHERE id_user_salon = ${req.params.id}`;
    con.query(user1, (err, result) => {
        if (err) throw err;

        if (result[0].id_user1_user_salon && result[0].id_user1_user_salon == req.auth.userId) {
            let message = `INSERT INTO salons_messages ( id_salon_salon_message, id_userSend_salon_message ,message_salon_message, date_salon_message) VALUES (${req.params.id}, ${req.auth.userId}, "${req.body.message}", NOW())`;
            con.query(message, (err, resul) => {
                if (err) throw err;
                res.status(201).json({ message: "Envoyé" });
            });
        }
        else {
            res.status(400).json({ message: "Ce salon ne vous appartient pas" });
        }
    })

};

exports.get_All_Salon = (req, res) => {
    let all_salon = `SELECT * FROM users_salons WHERE id_user1_user_salon = ${req.auth.userId}`
    con.query(all_salon, (err, result) => {
        if (err) throw err;

        res.status(200).json(result);
    });
};

exports.get_One_Salon_with_message = (req, res) => {
    let user1 = `SELECT * FROM users_salons WHERE id_user_salon = ${req.params.id}`;
    con.query(user1, (err, result) => {
        let one_salon = `SELECT id_userSend_salon_message, message_salon_message, date_salon_message FROM salons_messages JOIN users_salons ON salons_messages.id_salon_salon_message = users_salons.id_user_salon WHERE id_user_salon = ${req.params.id}`;
        con.query(one_salon, (err, resul) => {
            if (err) throw err;
            if (result[0].id_user1_user_salon && result[0].id_user1_user_salon == req.auth.userId)
                res.status(200).json(resul);
            else {
                res.status(400).json({ message: "non autorisé" });
            }
        });
    })


};

exports.create_salon = (req, res) => {
    let user2 = `SELECT id_user FROM users WHERE email_user = "${req.body.email}"`;
    con.query(user2, (err, result) => {
        if (err) throw err;
        if (result.length == 0) {
            res.status(400).json({ message: "impossible de créer le salon, l'utilisateur n'existe pas" });
        }
        else {
            let salon = `INSERT INTO users_salons (id_user1_user_salon, id_user2_user_salon, date_user_salon) VALUES (${req.auth.userId}, ${result[0].id_user}, NOW())`;
            con.query(salon, (err, resul) => {
                if (err) throw err;
                con.query(`SELECT id_user_salon FROM users_salons WHERE id_user1_user_salon = ${req.auth.userId} AND id_user2_user_salon = ${result[0].id_user}`, (err, resu) => {
                    if (err) throw err;
                    res.status(200).json({ salon: resu[0].id_user_salon });
                });

            })
        }
    });
};