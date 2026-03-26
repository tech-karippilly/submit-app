import mongoose, { Schema, Document } from "mongoose";

export interface IPolicy extends Document {
  privacyPolicy: string;
  refundPolicy: string;
  cancellationPolicy: string;
  confidentialityStatement: string;
  updatedAt: Date;
}

const PolicySchema: Schema = new Schema(
  {
    privacyPolicy: {
      type: String,
      default: "",
    },
    refundPolicy: {
      type: String,
      default: "",
    },
    cancellationPolicy: {
      type: String,
      default: "",
    },
    confidentialityStatement: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
  }
);

// Ensure only one policy document exists
PolicySchema.statics.getSingleton = async function (): Promise<IPolicy> {
  let policy = await this.findOne();
  if (!policy) {
    policy = await this.create({});
  }
  return policy;
};

export default mongoose.model<IPolicy>("Policy", PolicySchema);
