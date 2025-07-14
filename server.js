const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1); // Stop the server if DB fails
});

// ✅ User Schema
const UserSchema = new mongoose.Schema({
  name: String,
  totalPoints: { type: Number, default: 0 }
});

// ✅ Claim History Schema
const ClaimHistorySchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  userName: String,
  claimedPoints: Number,
  timestamp: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const ClaimHistory = mongoose.model('ClaimHistory', ClaimHistorySchema);

// ✅ Get all users
app.get('/api/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// ✅ Add new user
app.post('/api/users', async (req, res) => {
  const user = new User({ name: req.body.name });
  await user.save();
  res.json(user);
});

// ✅ Claim random points
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

// ✅ Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
  const users = await User.find().sort({ totalPoints: -1 });
  res.json(users);
});

// ✅ Get claim history
app.get('/api/history', async (req, res) => {
  const history = await ClaimHistory.find().sort({ timestamp: -1 });
  res.json(history);
});

// ✅ PORT Handling for Render (and local fallback)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
