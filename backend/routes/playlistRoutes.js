// routes/playlistRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getPlaylists, getPlaylist, createPlaylist, updatePlaylist,
  deletePlaylist, addSong, removeSong,
} = require('../controllers/playlistController');

router.get('/',               protect, getPlaylists);
router.get('/:id',            protect, getPlaylist);
router.post('/',              protect, createPlaylist);
router.put('/:id',            protect, updatePlaylist);
router.delete('/:id',         protect, deletePlaylist);
router.post('/:id/songs',     protect, addSong);
router.delete('/:id/songs/:videoId', protect, removeSong);

module.exports = router;
