import mongoose from 'mongoose';

// Conference Schema
const conferenceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
  },
  image: {
    type: String,
    required: [true, 'Please provide an image URL'],
  },
  eventDates: {
    start: {
      type: Date,
      required: [true, 'Please provide a start date'],
    },
    end: {
      type: Date,
      required: [true, 'Please provide an end date'],
    },
  },
  submissionDeadline: {
    type: Date,
    required: [true, 'Please provide a submission deadline'],
  },
  papers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Paper'
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Paper Schema
const paperSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
  },
  abstract: {
    type: String,
    required: [true, 'Please provide an abstract'],
  },
  fileUrl: {
    type: String,
    required: [true, 'Please provide a file URL'],
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  conference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conference',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Register models
export const Conference = mongoose.models.Conference || mongoose.model('Conference', conferenceSchema);
export const Paper = mongoose.models.Paper || mongoose.model('Paper', paperSchema); 