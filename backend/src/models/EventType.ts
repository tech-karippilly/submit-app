import mongoose, { Document, Schema } from 'mongoose';

export interface IEventType extends Document {
  name: string;
  description?: string;
}

const eventTypeSchema = new Schema<IEventType>(
  {
    name: {
      type: String,
      required: [true, 'Event type name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const EventType = mongoose.model<IEventType>('EventType', eventTypeSchema);
