const express = require("express");
const multer = require("multer");
const path = require("path");
const { exec } = require("child_process");
const fs = require("fs");
const cors = require("cors");

const app = express();
const port = 5000;

app.use(cors());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

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
      const jsonString = stdout.trim().split("\n").pop();
      const result = JSON.parse(jsonString);
      res.json(result);
    } catch (parseError) {
      console.error("Error parsing Python output:", parseError);
      res.status(500).send({ error: "Error parsing Python output" });
    }

    fs.unlinkSync(imagePath);
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
