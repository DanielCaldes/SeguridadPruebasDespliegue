const jwt = require('jsonwebtoken');

function authJWT (req, res, next){
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token de acceso faltante o malformado' });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, user) =>{
        if(err){
            return res.status(403).json({error:'Token inválido o expirado'})
        };
        req.user = user;
        next();
    })
}

module.exports = authJWT;