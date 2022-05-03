const jwt = require("jsonwebtoken");

module.exports =  (req, res, next) =>{
        try{
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token,"RANDOM_SECRET_TOKEN");
        const userId = decoded.userId;
        req.auth = ({userId});
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