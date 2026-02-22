import mongoose from 'mongoose';

const RegistrationCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      length: 6,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index untuk query yang efisien
RegistrationCodeSchema.index({ code: 1, isActive: 1 });
RegistrationCodeSchema.index({ expiresAt: 1 });

// Method untuk generate code baru (6 digit angka)
RegistrationCodeSchema.statics.generateNewCode = function() {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Method untuk get active code
RegistrationCodeSchema.statics.getActiveCode = async function() {
  const now = new Date();
  const activeCode = await this.findOne({
    isActive: true,
    expiresAt: { $gt: now },
  }).sort({ createdAt: -1 });
  
  return activeCode;
};

// Method untuk validate code
RegistrationCodeSchema.statics.validateCode = async function(code) {
  const now = new Date();
  const validCode = await this.findOne({
    code: code,
    isActive: true,
    expiresAt: { $gt: now },
  });
  
  return !!validCode;
};

const RegistrationCode = mongoose.models.RegistrationCode || mongoose.model('RegistrationCode', RegistrationCodeSchema);

export default RegistrationCode;

