const jwt = require("jsonwebtoken");

module.exports =  (req, res, next) =>{
        try{
        const token = JSON.parse(req.cookies.token);
        const decoded = jwt.verify(token,"RANDOM_SECRET_TOKEN");
        const userId = decoded.userId;
        const xsrfToken = req.headers['x-xsrf-token'];
        req.auth = ({userId, token});

        if(!xsrfToken && xsrfToken != decoded.xsrfToken){

        }

        if(req.body.userId && req.body.userId != userId){
            res.status(400).json({message: 'Non authentifié'});
            throw "User ID non valide";
            
        }
        else{
            next();
        }
    }
    catch(error) {
        res.status(401).json({error: new Error('Invalide request')})
    };
    
}