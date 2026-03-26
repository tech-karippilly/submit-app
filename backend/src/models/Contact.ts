import mongoose, { Document, Schema } from "mongoose";

// Types
export interface IContact extends Document {
  name: string;
  email: string;
  phone: string;
  addressOne: string;
  addressTwo?: string;
  city: string;
  state: string;
  pinCode: string;
  googleLocation?: string;
  about: string;
  createdAt: Date;
  updatedAt: Date;
}

// Schema
const contactSchema = new Schema<IContact>(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Name is required'],
    },
    email: {
      type: String,
      trim: true,
      required: [true, 'Email is required'],
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
      required: [true, 'Phone number is required'],
    },
    addressOne: {
      type: String,
      trim: true,
      required: [true, 'Address line 1 is required'],
    },
    addressTwo: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
      required: [true, 'City is required'],
    },
    state: {
      type: String,
      trim: true,
      required: [true, 'State is required'],
    },
    pinCode: {
      type: String,
      trim: true,
      required: [true, 'Pin code is required'],
    },
    googleLocation: {
      type: String,
      trim: true,
    },
    about: {
      type: String,
      trim: true,
      required: [true, 'About is required'],
    },
  },
  {
    timestamps: true,
  }
);

export const Contact = mongoose.model<IContact>('Contact', contactSchema);