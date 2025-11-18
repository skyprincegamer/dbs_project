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
router.post('/:id', tempMiddleWare, async (req, res) => {
        const userId = req.user.userId;
        try {
            const user = await User.findById(userId);
            if (!user) return res.status(404).json({message: 'User not found'});
        } catch (error) {
            console.error('Error finding user:', error);
            return res.status(500).json({message: 'Server error'});
        }
        return res.status(200).json(await Article.findByID(req.params.id))
    }
 );

router.put('/edit', tempMiddleWare, async (req, res) => {
  const userId = req.user.userId;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
  } catch (err) {
    console.error('Error finding user:', err);
    return res.status(500).json({ message: 'Server error' });
  }

  const { article_id, title, content, references, tags } = req.body;

  if (!article_id) return res.status(400).json({ message: 'article_id is required' });
  if (typeof title !== 'string' || !title.trim()) return res.status(400).json({ message: 'title is required' });
  if (typeof content !== 'string' || !content.trim()) return res.status(400).json({ message: 'content is required' });

  try {
    // fetch current article and verify ownership
    const existing = await Article.findByID(article_id);
    if (!existing) return res.status(404).json({ message: 'Article not found' });

    // depending on findByID shape, owner id field may be `id` or `user_id` or `id`
    const ownerId = existing.id || existing.user_id || existing.id;
    if (String(ownerId) !== String(userId)) {
      return res.status(403).json({ message: 'Not authorized to edit this article' });
    }

    // Normalize incoming arrays
    const refsArr = Array.isArray(references) ? references : [];
    const tagsArr = Array.isArray(tags) ? tags : [];

    // build article model and call edit()
    const articleToEdit = new Article({
      article_id,
      id: userId,
      user_id: userId,
      title: title.trim(),
      content: content.trim(),
      references: refsArr,
      tags: tagsArr
    });

    const updated = await articleToEdit.edit();

    // respond with updated article (or a success message)
    return res.status(200).json({ message: 'Article updated successfully', article: updated });
  } catch (err) {
    console.error('Error editing article:', err);
    if (err.name === 'RepeatedTitleError') {
      return res.status(400).json({ message: err.message || 'Title already exists' });
    }
    if (err.name === 'ReferenceError') {
      return res.status(400).json({ message: err.message || 'Invalid references' });
    }
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;