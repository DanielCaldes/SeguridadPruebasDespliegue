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

    const filteredCandidates = candidates.map(user => ({
            _id: user._id,
            name: user.name || "",
            description: user.description || "",
            gender: user.gender || "",
            age: user.age ?? null,
            location: user.location || ""
        }));

    res.status(200).json(filteredCandidates);
}

exports.swipeUser = async (req, res) => {
    const currentUserId = req.user.id;
    const { liked } = req.body;
    const targetUserId = req.params.targetId;
    let match = false;

    if (currentUserId === targetUserId) {
        return res.status(400).json({ message: "No puedes hacer swipe sobre ti mismo" });
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
    const currentUser = await User.findById(req.user.id)
        .populate({
            path: 'matches',
            select: '_id name description gender age location'
        });

    const matches = currentUser.matches.map(user => ({
        _id: user._id,
        name: user.name || "",
        description: user.description || "",
        gender: user.gender || "",
        age: user.age ?? null,
        location: user.location || ""
    }));

    res.status(200).json(matches);
}

exports.deleteMatch = async (req, res) =>{
    const currentUserId = req.user.id;
    const targetUserId = req.params.targetId;

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    currentUser.matches = currentUser.matches.filter(id => id.toString() !== targetUserId);
    targetUser.matches = targetUser.matches.filter(id => id.toString() !== currentUserId);

    await currentUser.save();
    await targetUser.save();

    res.status(200).json({ message: "Match eliminado" });
}