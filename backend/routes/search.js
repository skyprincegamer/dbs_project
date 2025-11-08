const router = require('express').Router();

router.post('/article', async (req, res) => {
    res.send(200).json({message: "Article search endpoint"});
});


module.exports = router;