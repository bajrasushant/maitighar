// const suggestionRouter = require('express').Router();
// const Suggestion = require('../models/suggestion'); // Adjust the path as needed

// // Create a new suggestion
// suggestionRouter.post('/', async (req, res) => {
//   try {
//     const suggestion = new Suggestion(req.body);
//     await suggestion.save();
//     res.status(201).json(suggestion);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// // Get all suggestions
// suggestionRouter.get('/', async (req, res) => {
//   try {
//     const suggestions = await Suggestion.find();
//     res.json(suggestions);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Get a suggestion by ID
// suggestionRouter.get('/:id', async (req, res) => {
//   try {
//     const suggestion = await Suggestion.findById(req.params.id);
//     if (!suggestion) {
//       return res.status(404).json({ error: 'Suggestion not found' });
//     }
//     res.json(suggestion);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Update a suggestion
// suggestionRouter.put('/:id', async (req, res) => {
//   try {
//     const suggestion = await Suggestion.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
//     if (!suggestion) {
//       return res.status(404).json({ error: 'Suggestion not found' });
//     }
//     res.json(suggestion);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// // Delete a suggestion
// suggestionRouter.delete('/:id', async (req, res) => {
//   try {
//     const suggestion = await Suggestion.findByIdAndDelete(req.params.id);
//     if (!suggestion) {
//       return res.status(404).json({ error: 'Suggestion not found' });
//     }
//     res.json({ message: 'Suggestion deleted' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// module.exports = suggestionRouter;
