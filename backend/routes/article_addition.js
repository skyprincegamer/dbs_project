const router = require('express').Router();
const User = require('../models/User');
const Article = require('../models/Article');
const jwt = require('jsonwebtoken');

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
router.post('/', tempMiddleWare, async (req, res) => {
    const { title, content, tags, references } = req.body;
    const userId = req.user.userId;
    try{
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
    } catch (error) {
        console.error('Error finding user:', error);
        return res.status(500).json({ message: 'Server error' });
    }
    const article = new Article({
        title,
        content,
        tags,
        references,
        id: userId
    });
    try {
        await article.save();
        res.status(201).json({ message: 'Article added successfully' });
    } catch (error) {
        if (error.name === 'RepeatedTitleError') {
            console.error('Article title already exists:', error);
            return res.status(400).json({ message: 'An article with this title already exists' });
        } else if (error.name === 'ReferenceError') {
            console.error('Invalid reference or references:', error);
            return res.status(400).json({ message: 'Invalid reference or references.' });
        }
        console.error('Error saving article:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;