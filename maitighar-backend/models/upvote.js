const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const upvoteSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  issue: {
    type: Schema.Types.ObjectId,
    ref: 'issue',
  },
  suggestion: {
    type: Schema.Types.ObjectId,
    ref: 'suggestion',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

upvoteSchema.set("toJSON", {
    transform: (document, returnedObject) => {
     returnedObject.id = returnedObject._id;
     delete returnedObject._id;
     delete returnedObject.__v;
    }
   })
  
module.exports = mongoose.model('Upvote', upvoteSchema);
