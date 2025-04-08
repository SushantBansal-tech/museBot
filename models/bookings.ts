import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;
  museumId: mongoose.Types.ObjectId;
  bookingDate: Date;
  status: 'pending' | 'confirmed' | 'cancelled';
  visitorCount: number;
  totalAmount: number;
  paymentId?: mongoose.Types.ObjectId;
  chatSessionId?: string;
  // We don't directly reference ticketId here since it's a one-to-one relationship
  // Ticket will reference the bookingId instead
}

const BookingSchema: Schema<IBooking> = new Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  museumId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Museum', 
    required: true 
  },
  bookingDate: { 
    type: Date, 
    default: Date.now 
  },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled'], 
    default: 'pending' 
  },
  visitorCount: { 
    type: Number, 
    required: true,
    min: 1
  },
  totalAmount: { 
    type: Number, 
    required: true 
  },
  paymentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Payment' 
  },
  chatSessionId: { 
    type: String 
  }
});

export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);