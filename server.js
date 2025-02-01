const express = require("express");
const multer = require("multer");
const path = require("path");
const { exec } = require("child_process");
const fs = require("fs");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

// CORS middleware setup to allow requests from your frontend
const corsOptions = {
  origin: "http://localhost:5173", // Ganti dengan URL frontend Anda (untuk pengembangan lokal)
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOptions)); // Apply CORS with the specified options

// Setup storage for file upload using Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// API endpoint to handle file upload and prediction
app.post("/predict", upload.single("image"), (req, res) => {
  const imagePath = path.join(__dirname, "uploads", req.file.filename);

  exec(`python predict.py "${imagePath}"`, (err, stdout, stderr) => {
    if (err) {
      console.error("Error executing Python script:", stderr);
      return res.status(500).send({ error: "Prediction failed" });
    }

    if (stderr) {
      console.error("Python script stderr:", stderr);
    }

    try {
      // Parse the output from the Python script (JSON)
      const jsonString = stdout.trim().split("\n").pop();
      const result = JSON.parse(jsonString);
      res.json(result); // Send the prediction result to the frontend
    } catch (parseError) {
      console.error("Error parsing Python output:", parseError);
      res.status(500).send({ error: "Error parsing Python output" });
    }

    // Clean up the uploaded image file
    fs.unlinkSync(imagePath);
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
