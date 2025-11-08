const router = require('express').Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const tempMiddleWare = async (req, res, next) => {
    // const userId = req.cookies["SubjectSwapLoginJWT"];
    const {token: userId} = req.body;
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    jwt.verify(userId, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const {userId: id} = decoded;
        try {
            const user = await User.findById(id);
            if (!user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            req.user = user;
            next();
        } catch (e) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
    });
}

router.delete("/take_back/", tempMiddleWare, async (req, res) => {
    const {to} = req.body;
    const from = req.user;
    if(!to) {
        return res.status(400).json({ error: 'Missing parameters' });
    }
    try{
        const toUser = await User.findById(to);
        if (!toUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Business logic to remove rating
        return res.status(200).json({ message: 'Rating taken back successfully' });
    } catch(e){
        console.log(e);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;