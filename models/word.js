const wordSchema = new mongoose.Schema({
  listId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'List',
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  spanish: {
    type: String,
    required: true
  },
  english: {
    type: String,
    required: true
  },
  optionalClue: {    // Add this field
    type: String,
    required: false  // Make it optional
  },
  exampleSentences: [{
    spanish: String,
    english: String
  }],
  srs: {
    interval: Number,
    ease: Number,
    due: Date,
    reviews: Number
  }
});

module.exports = mongoose.model('Word', wordSchema);