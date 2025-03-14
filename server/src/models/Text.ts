import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IText extends Document {
  _id: mongoose.Types.ObjectId;
  content: string;
  encryptionKey: string;
  accessToken: string;
  userId?: mongoose.Types.ObjectId;
  isProtected: boolean;
  password?: string;
  viewCount: number;
  maxViews?: number;
  viewOnce: boolean;
  expiresAt: Date;
  createdAt: Date;
  isMarkdown: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const textSchema = new Schema({
  content: {
    type: String,
    required: [true, "Content is required"],
    maxlength: [100000, "Content cannot exceed 100,000 characters"],
  },
  encryptionKey: {
    type: String,
    required: [true, "Encryption key is required"],
  },
  accessToken: {
    type: String,
    required: true,
    unique: true,
    index: true, // Already indexed through unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true,
  },
  isProtected: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    select: false, // Don't include password in queries by default
  },
  viewCount: {
    type: Number,
    default: 0,
  },
  maxViews: {
    type: Number,
  },
  viewOnce: {
    type: Boolean,
    default: false,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  isMarkdown: {
    type: Boolean,
    default: false,
  },
});

// Hash password before saving
textSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
textSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Index for querying by userId
textSchema.index({ userId: 1 });

// Index for querying by expiration
textSchema.index({ expiresAt: 1 });

export default mongoose.model<IText>("Text", textSchema);
