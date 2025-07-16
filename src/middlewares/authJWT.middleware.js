const jwt = require('jsonwebtoken');

function authJWT (req, res, next){
    const authHeader = req.headers.authorization;

    const token = authHeader.split(' ')[1];

    if(!token){
        return res.status(401).json({ error: 'Introduce el token de acceso' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) =>{
        if(err){
            return res.status(403).json({error:'Token inválido o expirado'})
        };
        req.user = user;
        next();
    })
}

module.exports = authJWT;