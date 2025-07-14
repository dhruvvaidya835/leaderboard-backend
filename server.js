const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// Connect MongoDB
mongoose.connect('mongodb://localhost:27017/leaderboard');

// User Schema
const UserSchema = new mongoose.Schema({
  name: String,
  totalPoints: { type: Number, default: 0 }
});

// Claim History Schema
const ClaimHistorySchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  userName: String,
  claimedPoints: Number,
  timestamp: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const ClaimHistory = mongoose.model('ClaimHistory', ClaimHistorySchema);

// Get all users
app.get('/api/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Add new user
app.post('/api/users', async (req, res) => {
  const user = new User({ name: req.body.name });
  await user.save();
  res.json(user);
});

// Claim random points
app.post('/api/claim', async (req, res) => {
  const { userId } = req.body;
  const points = Math.floor(Math.random() * 10) + 1;
  const user = await User.findById(userId);
  user.totalPoints += points;
  await user.save();

  const history = new ClaimHistory({
    userId,
    userName: user.name,
    claimedPoints: points
  });
  await history.save();

  res.json({ points, user });
});

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
  const users = await User.find().sort({ totalPoints: -1 });
  res.json(users);
});

// Get claim history
app.get('/api/history', async (req, res) => {
  const history = await ClaimHistory.find().sort({ timestamp: -1 });
  res.json(history);
});

// Start server
app.listen(5000, () => console.log('Server running on http://localhost:5000'));
