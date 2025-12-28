import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['fire', 'medical', 'accident', 'security', 'natural_disaster'],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    address: {
      type: String,
      default: null,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['reported', 'assigned', 'in_progress', 'resolved', 'UNVERIFIED', 'VERIFIED', 'IN_PROGRESS', 'FALSE_REPORT'],
      default: 'reported',
    },
    reportedBy: {
      type: String,
      required: true,
    },
    assignment: [
      {
        type: String,
        enum: ['Police', 'Fire', 'Medical', 'Multiple'],
      },
    ],
    assignedTo: {
      type: String,
      default: null,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    responder_notes: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      default: null,
    },
    verificationScore: {
      type: Number,
      default: 0,
    },
    verified_by: {
      type: String,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Incident', incidentSchema);
