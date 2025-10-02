import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IntegrationDoc extends Document {
  provider: 'mailchimp' | 'getresponse';
  apiKey: string; // encrypted string
  label?: string;
  createdAt: Date;
  updatedAt: Date;
}

const IntegrationSchema = new Schema<IntegrationDoc>(
  {
    provider: { type: String, enum: ['mailchimp', 'getresponse'], required: true, index: true },
    apiKey: { type: String, required: true },
    label: { type: String },
  },
  { timestamps: true }
);

export const Integration: Model<IntegrationDoc> =
  mongoose.models.Integration || mongoose.model<IntegrationDoc>('Integration', IntegrationSchema);

