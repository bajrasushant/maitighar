const issueRouter = require("express").Router();
const express = require('express');
const Issue = require('../models/issue'); // Adjust the path as needed


// Create a new issue
issueRouter.post('/', async (req, res) => {
  try {
    console.log(req.body);
    const issue = new Issue(req.body);
    console.log(issue);
    await issue.save();
    res.status(201).json(issue);
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

// Get a issue by ID
issueRouter.get('/:id', async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ error: 'issue not found' });
    }
    res.json(issue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a issue
issueRouter.put('/:id', async (req, res) => {
  try {
    const issue = await Issue.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!issue) {
      return res.status(404).json({ error: 'issue not found' });
    }
    res.json(issue);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a issue
issueRouter.delete('/:id', async (req, res) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);
    if (!issue) {
      return res.status(404).json({ error: 'issue not found' });
    }
    res.json({ message: 'issue deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = issueRouter;
