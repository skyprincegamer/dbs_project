const router = require('express').Router();
const Article = require('../models/Article');

router.post('/article', async (req, res) => {
    const { query } = req.body;
    try {
        const articles = await Article.findByTitle(query);
        if(!articles || articles.length === 0) {
            return res.status(404).json({ message: 'Article not found' });
        }
        return res.status(200).json(articles);
    } catch (error) {
        console.error('Error searching articles:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
router.post('/searchbytags', async (req, res) => {
    const { query } = req.body;
    try {
        const articles = await Article.findByTags(query);
        if(!articles || articles.length === 0) {
            return res.status(404).json({ message: 'Article not found' });
        }
        return res.status(200).json(articles);
    } catch (error) {
        console.error('Error searching articles by tags:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
router.post('/searchbytag', async (req, res) => {
    const { query } = req.body;
    console.log("Tag search query:", query);
    try {
        const articles = await Article.findByTag(query);
        if(!articles || articles.length === 0) {
            return res.status(404).json({ message: 'Article not found' });
        }
        return res.status(200).json(articles);
    } catch (error) {
        console.error('Error searching articles by tags:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;