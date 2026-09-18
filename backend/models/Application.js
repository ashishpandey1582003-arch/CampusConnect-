import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recruiter',
      required: true,
    },
    resume: {
      type: String, // Snapshot path of the resume at the time of application
      default: '',
    },
    status: {
      type: String,
      enum: ['Applied', 'Under Review', 'Shortlisted', 'Rejected', 'Selected'],
      default: 'Applied',
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    timeline: [
      {
        status: {
          type: String,
          required: true,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
        remarks: {
          type: String,
          default: '',
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Ensure a student can only apply once to a single recruiter drive
applicationSchema.index({ student: 1, recruiter: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);
export default Application;
