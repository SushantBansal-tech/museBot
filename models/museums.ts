import mongoose, { Document, Schema } from 'mongoose';

export interface IMuseum extends Document {
  name: string;
  description?: string;
  location: string;
  ticketPrice: number;
  types: string[];
  timeStart: string;
  timeEnd: string;
  ratings: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const MuseumSchema: Schema<IMuseum> = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  ticketPrice: {
    type: Number,
    required: true,
    min: 0
  },
  types: {
    type: [String],
    default: []
  },
  timeStart: {
    type: String,
    required: true
  },
  timeEnd: {
    type: String,
    required: true
  },
  ratings: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.models.Museum || mongoose.model<IMuseum>('Museum', MuseumSchema);
