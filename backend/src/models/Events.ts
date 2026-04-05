import mongoose, { Document, Schema } from "mongoose";

// Types
export type EventStatus = 'scheduled' | 'on_time' | 'ongoing' | 'completed' | 'cancelled' | 'delayed';

export interface IEventItinerary {
  name: string;
  description: string;
  duration: string;
  time: string;
}

export interface IRegistrationFee {
  professional_individuals: number;
  student_individuals: number;
  student_group_per_head: number;
}

export interface IEvent extends Document {
  eventName: string;
  eventDate: Date;
  eventTime: string;
  eventLocation: string;
  eventGoogleLink: string;
  eventDescription: string;
  topic?: string;
  eventTypeId?: mongoose.Types.ObjectId;
  status: EventStatus;
  statusReason?: string;
  registrationFee: IRegistrationFee;
  eventItinerary: IEventItinerary[];
  participantCount: number;
  capacity?: number;
  seatsRemaining?: number;
  createdAt: Date;
  updatedAt: Date;
  isCommonFee: boolean;
  speakerId?: string;
  isExpired?: boolean;
}

// Schemas (must be defined before use)
const eventItinerarySchema = new Schema<IEventItinerary>(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Itinerary name is required'],
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'Itinerary description is required'],
    },
    duration: {
      type: String,
      required: false,
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
    },
  },
  { _id: true }
);

const registrationFeeSchema = new Schema<IRegistrationFee>(
  {
    professional_individuals: {
      type: Number,
      required: [true, 'Professional individual fee is required'],
    },
    student_individuals: {
      type: Number,
      required: [true, 'Student individual fee is required'],
    },
    student_group_per_head: {
      type: Number,
      required: [true, 'Student group per head fee is required'],
    },
  },
  { _id: false }
);

const eventSchema = new Schema<IEvent>(
  {
    eventName: {
      type: String,
      trim: true,
      required: [true, 'Event name is required'],
    },
    eventDate: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    speakerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Speaker',
    },
    eventTime: {
      type: String,
      required: [true, 'Event time is required'],
    },
    eventLocation: {
      type: String,
      trim: true,
      required: [true, 'Event location is required'],
    },
    eventGoogleLink: {
      type: String,
      trim: true,
      required: [true, 'Google link is required'],
    },
    eventDescription: {
      type: String,
      trim: true,
      required: [true, 'Event description is required'],
    },
    topic: {
      type: String,
      trim: true,
    },
    eventTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EventType',
    },
    status: {
      type: String,
      enum: {
        values: ['scheduled', 'on_time', 'ongoing', 'completed', 'cancelled', 'delayed'],
        message: 'Invalid event status',
      },
      default: 'scheduled',
    },
    statusReason: {
      type: String,
      trim: true,
    },
    isCommonFee: {
      type: Boolean,
      default: false,
    },
    registrationFee: {
      type: registrationFeeSchema,
      required: false, // Will be validated at service level based on isCommonFee
    },
    eventItinerary: [eventItinerarySchema],
    participantCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    capacity: {
      type: Number,
      min: 1,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Add virtual property for isExpired
eventSchema.virtual('isExpired').get(function() {
  const now = new Date();
  const eventDate = new Date(this.eventDate);
  return eventDate < now;
});

// Add virtual property for seatsRemaining
eventSchema.virtual('seatsRemaining').get(function() {
  if (!this.capacity) return null;
  return Math.max(0, this.capacity - (this.participantCount || 0));
});

// Add method to check if seats are available
eventSchema.methods.hasAvailableSeats = function(requestedSeats: number = 1): boolean {
  if (!this.capacity) return true;
  return (this.seatsRemaining || 0) >= requestedSeats;
};

// Include virtuals in JSON output
eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

export const Event = mongoose.model<IEvent>('Event', eventSchema);

// Export schema for reuse if needed
export { registrationFeeSchema, eventItinerarySchema };