const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    try {

        /* Récupération du cookie */
        const token = JSON.parse(req.cookies.token);

        /* Décodage du jsw token */
        const decoded = jwt.verify(token, "RANDOM_SECRET_TOKEN");

        /* Récupération du userId et du xsrf token stocké dans le jsw token */
        const userId = decoded.userId;
        const xsrfToken = req.headers['x-xsrf-token'];

        req.auth = ({ userId, token });
        /* On vérifie que le xsrftoken présent dans le jwt token est le même que le xsrftoken présent dans le headers de la requête */
        if (!xsrfToken && xsrfToken != decoded.xsrfToken) {

        }
        /* Si il y a un userId dans le crops de la requête, il doit être égale au userId présent de le jsw token */
        if (req.body.userId && req.body.userId != userId) {
            res.status(400).json({ message: 'Non authentifié' });
            throw "User ID non valide";

        }
        else {
            next();
        }
    }
    catch (error) {
        res.status(401).json({ error: new Error('Invalide request') })
    };

}