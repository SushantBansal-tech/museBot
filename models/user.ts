import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// Methods for password comparison
interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Interface for the User document
export interface IUser extends Document, IUserMethods {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  preferredLanguage: string;
  createdAt: Date;
  lastLogin?: Date;
  profilePicture?: string;
  nationality?: string;
  aadhaar?: string;
  passportNumber?: string;
  // Reference to bookings isn't stored here as it's a one-to-many relationship
  // We'll query bookings using the userId field in the Booking schema
}

// Schema definition
const UserSchema: Schema<IUser> = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  preferredLanguage: { type: String, default: 'en' },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date },
  profilePicture: { type: String },
  nationality: { type: String, trim: true },
  aadhaar: {
    type: String,
    match: /^[0-9]{12}$/, // basic validation for Aadhaar format
    unique: true,
    sparse: true
  },
  passportNumber: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  }
});

// Pre-save hook to hash password
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);