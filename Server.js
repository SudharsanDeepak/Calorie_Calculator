import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const mongoURI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});
const User = mongoose.model("User", userSchema);

const historySchema = new mongoose.Schema({
  userEmail: String,
  name: String,
  age: Number,
  weight: Number,
  height: Number,
  activityLevel: String,
  calories: Number,
  waterIntake: Number,
  proteinIntake: Number,
  fiberIntake: Number,
});
const History = mongoose.model("History", historySchema);

app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({ message: "Login successful", email });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

app.post("/api/history", async (req, res) => {
  try {
    const newEntry = new History(req.body);
    await newEntry.save();
    res.status(201).json({ message: "History saved" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

app.get("/api/history/:email", async (req, res) => {
  try {
    const userEmail = req.params.email;
    const history = await History.find({ userEmail });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
