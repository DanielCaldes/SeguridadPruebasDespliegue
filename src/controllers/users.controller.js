const User = require("../models/user.model");

exports.getProfile = async (req, res) => {
    try{
        const id = req.params.id;

        const user = await User.findById(id);

        if(!user){
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const profile = {
            _id: user._id,
            name: user.name || "",
            description: user.description || "",
            gender: user.gender || "",
            age: user.age || null,
            location: user.location || ""
        };

        return res.status(200).json( profile );
    }catch(err){
        console.error('Error en getAccount:', err);
        res.status(500).json({ message: 'Error del servidor' });
    }
}

exports.editProfile = async (req, res) => {
    try{
        const id = req.params.id;
        const { name, description, gender, age, location } = req.body;

        if (req.user.id !== id) {
            return res.status(403).json({ message: "No tienes permiso para editar esta cuenta" });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const updatedUser = await User.findByIdAndUpdate( 
            id,
            {
                name: name ?? user.name,
                description: description ?? user.description,
                gender: gender ?? user.gender,
                age: age ?? user.age,
                location: location ?? user.location
            },
            {
                new: true
            } 
        );

        const profile = {
            _id: updatedUser._id,
            name: updatedUser.name || "",
            description: updatedUser.description || "",
            gender: updatedUser.gender || "",
            age: updatedUser.age ?? null,
            location: updatedUser.location || ""
        };

        return res.status(200).json( profile );

    }catch(err){
        console.error('Error en getAccount:', err);
        res.status(500).json({ message: 'Error del servidor' });
    }
}

exports.deleteProfile = async (req, res) => {
    try{
        const id = req.params.id;

        if (req.user.id !== id) {
            return res.status(403).json({ message: "No tienes permiso para eliminar esta cuenta" });
        }

        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        return res.status(200).json( {message : `Usuario borrado ${id}`} );
        
    }catch(err){
        console.error('Error en getAccount:', err);
        res.status(500).json({ message: 'Error del servidor' });
    }
}