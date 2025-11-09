const User = require("../models/User");
const Article = require("../models/Article");
const jwt = require('jsonwebtoken');
const router = require('express').Router();

const tempMiddleWare = async (req, res, next) =>{
    // const token = req.cookies["PaperPediaLoginJWT"];
    const {token} = req.body;
    if (!token) return res.status(401).json({ message: 'Not logged in' });
    await jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = decoded;
        next();
    });
};
router.post('/:id', tempMiddleWare, async (req, res) => {
        const userId = req.user.userId;
        try {
            const user = await User.findById(userId);
            if (!user) return res.status(404).json({message: 'User not found'});
        } catch (error) {
            console.error('Error finding user:', error);
            return res.status(500).json({message: 'Server error'});
        }
        return res.status(200).json( await Article.findTagsByID(req.params.id))

    }
);

module.exports = router;