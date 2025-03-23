import mongoose, { Document, Schema } from 'mongoose';

export interface ITemporaryPaymentStorage extends Document {
  details: Record<string, any>;
}

const testSchema = new Schema<ITemporaryPaymentStorage>({
    details: Object
});

export default mongoose.model<ITemporaryPaymentStorage>('testing', testSchema);