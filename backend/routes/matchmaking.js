const router = require('express').Router();
const User = require('../models/User');
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
router.post('/match', tempMiddleWare, async (req, res) => {
    res.send(200).json({message: "Matched successfully"});
})

module.exports = router;