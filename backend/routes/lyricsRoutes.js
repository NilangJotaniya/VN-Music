const express = require('express');
const { getLyrics } = require('../controllers/lyricsController');

const router = express.Router();

router.get('/', getLyrics);

module.exports = router;
