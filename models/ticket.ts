import mongoose, { Document, Schema } from 'mongoose';

export interface ITicket extends Document {
  bookingId: mongoose.Types.ObjectId;
  museumId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  ticketNumber: string;
  qrCode?: string;
  issuedAt: Date;
  validUntil: Date;
  isUsed: boolean;
  ticketType: 'standard' | 'premium' | 'group';
  price: number;
}

const TicketSchema: Schema<ITicket> = new Schema({
  bookingId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Booking',
    required: true,
    unique: true // One booking has exactly one ticket (one-to-one)
  },
  museumId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Museum',
    required: true
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  ticketNumber: { 
    type: String, 
    required: true, 
    unique: true 
  },
  qrCode: { 
    type: String 
  },
  issuedAt: { 
    type: Date, 
    default: Date.now 
  },
  validUntil: { 
    type: Date, 
    required: true 
  },
  isUsed: { 
    type: Boolean, 
    default: false 
  },
  ticketType: { 
    type: String, 
    enum: ['standard', 'premium', 'group'], 
    default: 'standard' 
  },
  price: { 
    type: Number, 
    required: true 
  }
});

// Generate unique ticket number
TicketSchema.pre('save', async function(next) {
  if (this.isNew) {
    const prefix = 'MUSEUM';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.ticketNumber = `${prefix}-${timestamp}-${random}`;
  }
  next();
});

export default mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', TicketSchema);