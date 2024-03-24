const express = require('express');
const { query } = require('../database'); 
const authenticateToken = require('../authenticateToken'); 

const router = express.Router();

// Endpoint to fetch user profile information
router.get('/fetch/:id', authenticateToken, async (req, res) => {
  const userId = req.params.id;

  try {
    const sql = 'SELECT UserName, FirstName, LastName, Email, Type, SocialIG, SocialTikTok, SocialX, DefaultProfilePic FROM Users WHERE UserID = ?';
    const userInfo = await query(sql, [userId]);

    if (userInfo.length > 0) {
      res.json(userInfo[0]);
    } else {
      res.status(404).json({ message: 'User not found.' });
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint to update user profile information
router.post('/update/:id', authenticateToken, async (req, res) => {
  const userID = req.params.id;
  const { UserName, FirstName, LastName, Email, SocialIG, SocialTikTok, SocialX, DefaultProfilePic } = req.body; // Extracting user info from request body

  try {
    const updateSql = `
      UPDATE Users
      SET UserName = ?, FirstName = ?, LastName = ?, Email = ?, SocialIG = ?, SocialTikTok = ?, SocialX = ?, DefaultProfilePic = ?
      WHERE UserID = ?`;

    const result = await query(updateSql, [UserName, FirstName, LastName, Email, SocialIG, SocialTikTok, SocialX, DefaultProfilePic, userID]);

    if (result.affectedRows > 0) {
      res.json({ message: 'Profile updated successfully!' });
    } else {
      res.status(404).json({ message: 'User not found.' });
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

// Endpoint to get user posts & user info
router.get('/user/:id/posts', authenticateToken, async (req, res) => {
  const userId = req.params.id;

  const sql = `
      SELECT 
        u.UserID,
        pm.PostID, 
        pm.MediaURL, 
        pm.Description,
        u.UserName, 
        u.SocialIG, 
        u.SocialTikTok, 
        u.SocialX, 
        u.DefaultProfilePic
      FROM UserPosts up
      JOIN PostMedia pm ON up.PostID = pm.PostID
      JOIN Users u ON up.UserID = u.UserID
      WHERE up.UserID = ?
  `;

  try {
      const mediaUrls = await query(sql, [userId]);

      if (mediaUrls.length > 0) {
          res.json(mediaUrls);
      } else {
          res.status(404).json({ message: 'No media found for this user.' });
      }
  } catch (error) {
      console.error('Error fetching media URLs:', error);
      res.status(500).json({ message: 'Server error while fetching media URLs' });
  }
});