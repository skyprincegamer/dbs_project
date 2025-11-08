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
const matchMakingRoutes = require('./routes/matchmaking');
const searchRoutes = require('./routes/search');
const ratingRoutes = require('./routes/rating_routes');
app.use('/', authRoutes);
app.use('/matchmaking', matchMakingRoutes);
app.use('/search', searchRoutes);
app.use('/rating_routes', ratingRoutes);

cron.schedule(`*/${(minTime / 60) / 1000} * * * *`, () => {
  clearUserCache();
});
