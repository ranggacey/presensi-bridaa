import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Nama skema yang berbeda untuk menghindari konflik
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username diperlukan'],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email diperlukan'],
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email tidak valid'],
  },
  password: {
    type: String,
    required: [true, 'Password diperlukan'],
    minlength: [6, 'Password minimal 6 karakter'],
    select: false, // Jangan sertakan password saat query
  },
  name: {
    type: String,
    required: [true, 'Nama diperlukan'],
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  faceData: {
    type: Array,
    default: null
  },
  // Field baru untuk identitas
  profileImage: {
    type: String,
    default: ''
  },
  birthDate: {
    type: Date,
    default: null
  },
  birthPlace: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  university: {
    type: String,
    default: ''
  },
  faculty: {
    type: String,
    default: ''
  },
  studyProgram: {
    type: String,
    default: ''
  },
  internshipStartDate: {
    type: Date,
    default: null
  },
  phoneNumber: {
    type: String,
    default: ''
  },
  applicationLetter: {
    type: String,
    default: ''
  }
},
{
  timestamps: true, // Tambahkan createdAt dan updatedAt
}
);

// Hash password sebelum disimpan
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method untuk membandingkan password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Cek apakah model sudah ada untuk menghindari error "Cannot overwrite model"
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;