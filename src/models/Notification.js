import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['task_done', 'task_revision', 'task_comment', 'attendance', 'system'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      default: '',
    },
    read: {
      type: Boolean,
      default: false,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index untuk performa query
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

// Cek apakah model sudah ada untuk menghindari error "Cannot overwrite model"
const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);

export default Notification;

