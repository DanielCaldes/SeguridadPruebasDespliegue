const mongoose = require('mongoose')
const User = require("../models/user.model");

exports.searchUser = async (req, res) =>{
    const currentUserId = req.user.id;
    
    const currentUser = await User.findById(currentUserId);

    const excludedIds = [
        ...currentUser.swipes,
        ...currentUser.likes,
        ...currentUser.matches,
        currentUserId
    ];

    const candidates = await User.find({ _id: { $nin: excludedIds } });

    res.status(200).json(candidates);
}

exports.swipeUser = async (req, res) => {
    const currentUserId = req.user.id;
    const { liked } = req.body;
    const targetUserId = req.params.targetId;
    let match = false;

    if (liked === undefined || typeof liked !== 'boolean') {
        return res.status(400).json({ message: "`liked` debe ser booleano (true o false)" });
    }

    if (currentUserId === targetUserId) {
        return res.status(400).json({ message: "No puedes hacer swipe sobre ti mismo" });
    }

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
        return res.status(400).json({ message: "El usuario al que intentas reaccionar no existe o su ID no es válido." });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) return res.status(404).json({ message: "Usuario no encontrado" });

    if (liked) {
        if (targetUser.likes.includes(currentUserId)) {
            match = true;
            currentUser.matches.push(targetUserId);
            targetUser.matches.push(currentUserId);

            targetUser.likes = targetUser.likes.filter(id => id.toString() !== currentUserId);
        }
        else {
            currentUser.likes.push(targetUserId);
        }
    }
    else {
        currentUser.swipes.push(targetUserId);
    }

    await currentUser.save();
    await targetUser.save();

    if(match){
        res.status(200).json({ message: "¡Felicidades! ¡Tenéis un Match!" });
    }
    else{
        res.status(200).json({ message: liked ? "Like registrado" : "Swipe registrado" });
    }
};

exports.getMatches = async (req, res) =>{
    const currentUser = await User.findById(req.user.id).populate('matches');
    res.status(200).json(currentUser.matches);
}

exports.deleteMatch = async (req, res) =>{
    const currentUserId = req.user.id;
    const targetUserId = req.params.targetId;

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
        return res.status(400).json({ message: "El usuario del match que intentas borrar no existe o su ID no es válido." });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    currentUser.matches = currentUser.matches.filter(id => id.toString() !== targetUserId);
    targetUser.matches = targetUser.matches.filter(id => id.toString() !== currentUserId);

    await currentUser.save();
    await targetUser.save();

    res.status(200).json({ message: "Match eliminado" });
}