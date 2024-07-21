const express = require("express");
const multer = require("multer");
const path = require("path");
const Issue = require("../models/issue");

const issueRouter = express.Router();

// Multer configuration for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/issues/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Limit file size to 5MB
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  }
});

// Create a new issue with image upload
issueRouter.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, description, department, latitude, longitude, status } = req.body;
    const imagePath = req.file ? req.file.path : null;

    const newIssue = new Issue({
      title,
      description,
      department,
      latitude,
      longitude,
      status,
      createdBy: req.user.id,
      imagePath, // Store the path of the uploaded image
    });

    await newIssue.save();

    res.status(201).json({ success: true, issue: newIssue });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all issues
issueRouter.get('/', async (req, res) => {
  try {
    const issues = await Issue.find();
    res.json(issues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get an issue by ID
issueRouter.get('/:id', async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    res.json(issue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update an issue
issueRouter.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const updates = req.body;
    if (req.file) {
      updates.imagePath = req.file.path;
    }
    
    const issue = await Issue.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    res.json(issue);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete an issue
issueRouter.delete('/:id', async (req, res) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    res.json({ message: 'Issue deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = issueRouter;
