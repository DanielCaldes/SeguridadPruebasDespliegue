const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user.model');

exports.register = async (req, res) => {
    try{
        const { name, password, email, description, gender, age, location } = req.body;

        if ( !name || !email || !password) {
            return res.status(400).json({ message: "Faltan campos obligatorios (email, password o name)" });
        }

        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message:"El usuario ya existe"})
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            description: description || "",
            gender: gender || "",
            age: age || null,
            location: location || ""
        })

        await newUser.save();

        return res.status(200).json( { message : "Usuario registrado correctamente" } );

    }catch(err){
        console.error('Error en register:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
}

exports.login = async (req, res) => {
    try{
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Faltan email o password" });
        }

        const existingUser = await User.findOne({email});
        if(!existingUser){
            return res.status(400).json({message:"Credenciales inválidas, revisa que email y password sean correctos"});
        }

        const hashedPassword = existingUser.password;
        const isMatch = await bcrypt.compare(password, hashedPassword);
        if(!isMatch){
            return res.status(400).json({message:"Credenciales inválidas, revisa que email y password sean correctos"});
        }

        const payload = { id: existingUser._id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });
        return res.status(200).json( { id: existingUser._id, token } );

    }catch(err){
        console.error('Error en register:', err);
        res.status(500).json({ message: 'Error del servidor' });
    }    
}