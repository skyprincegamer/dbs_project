const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const cookieParser = require('cookie-parser');

const {clearUserCache} = require('./utils/clearCache');
const {minTime} = require('./constants/cronJobTimers');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());
app.use(cors({
  credentials: true,
  origin: process.env.FRONTEND_URL,
  allowAccessControlAllowOrigin: true,
}));

const authRoutes = require('./routes/auth');
const article_addition = require('./routes/article_addition');
const searchRoutes = require('./routes/search');
const ratingRoutes = require('./routes/rating_routes');
const articleDisplay = require('./routes/article_display')
const tagsDisplay = require('./routes/tag_display')
const referenceDisplay = require('./routes/reference_display')
app.use('/', authRoutes);
app.use('/add-article', article_addition);
app.use('/search', searchRoutes);
app.use('/rating_routes', ratingRoutes);
app.use('/article' , articleDisplay)
app.use('/tags' , tagsDisplay)
app.use('/references', referenceDisplay)

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
})

cron.schedule(`*/${(minTime / 60) / 1000} * * * *`, () => {
  clearUserCache();
});
