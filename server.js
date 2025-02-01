const express = require("express");
const multer = require("multer");
const path = require("path");
const { exec } = require("child_process");
const fs = require("fs");
const cors = require("cors"); // Import cors

const app = express();
const port = 5000;

// Use CORS middleware to allow requests from your React frontend
app.use(cors()); // This allows all domains to access this server
// For stricter control, you can specify only specific domains like:
// app.use(cors({ origin: "http://localhost:5173" }));

// Set up storage engine for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Endpoint to handle image upload and prediction
app.post("/predict", upload.single("image"), (req, res) => {
  const imagePath = path.join(__dirname, "uploads", req.file.filename);

  // Call the Python script to predict the image
  exec(`python predict.py "${imagePath}"`, (err, stdout, stderr) => {
    if (err) {
      console.error("Error executing Python script:", stderr);
      return res.status(500).send({ error: "Prediction failed" });
    }

    if (stderr) {
      console.error("Python script stderr:", stderr);
    }

    // Clean up stdout to only include the JSON result
    try {
      const jsonString = stdout.trim().split("\n").pop(); // Clean the logging output
      const result = JSON.parse(jsonString);
      res.json(result);
    } catch (parseError) {
      console.error("Error parsing Python output:", parseError);
      res.status(500).send({ error: "Error parsing Python output" });
    }

    // Clean up uploaded image
    fs.unlinkSync(imagePath);
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
