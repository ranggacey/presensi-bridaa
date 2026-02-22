import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Judul tugas diperlukan'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Deskripsi tugas diperlukan'],
      trim: true,
    },
    file: {
      type: String,
      default: '',
    },
    fileName: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'review', 'revision', 'done'],
      default: 'pending',
    },
    comments: [
      {
        comment: {
          type: String,
          required: true,
        },
        commentedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        commentedByName: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index untuk performa query
TaskSchema.index({ userId: 1, createdAt: -1 });
TaskSchema.index({ status: 1, createdAt: -1 });

// Cek apakah model sudah ada untuk menghindari error "Cannot overwrite model"
const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);

export default Task;

