import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  ticketPrice: { type: Number, required: true },
  category: { type: String },
  capacity: { type: Number, required: true },
  ticketsRemaining: { type: Number },
  isActive: { type: Boolean, default: true },
  translations: { 
    type: Map, 
    of: new mongoose.Schema({
      title: String,
      description: String
    }, { _id: false }) 
  },
});

export default mongoose.models.Event || mongoose.model('Event', EventSchema);