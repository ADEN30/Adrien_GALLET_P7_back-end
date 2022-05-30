const multer = require("multer");


/* Création d'une bibliothèque */
const MIME_TYPE = {
    "image/gif": "gif",
    "image/jpg": "jpg",
    "image/jpeg": "jpeg",
    "image/png": "png"
};


const storage = multer.diskStorage({

    /* Destination ou sera stocké l'image le dodsier de stockage */
    destination: (req, file, cb) =>{
        cb(null, "images/posts");
    },

    /* Nommage de fichier qui sera stocké  */
    filename: (req, file, cb) =>{
        const name = file.originalname.split(" ").join("_");
        const extension = MIME_TYPE[file.mimetype];
        cb(null, name + "_"+ Date.now()+ "."+extension);
    }
});
module.exports = multer({storage: storage}).single("image");