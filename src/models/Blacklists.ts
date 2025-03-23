import mongoose, { Document, Schema } from "mongoose";

export interface IBlacklist extends Document {
  token: string;
  createdAt: Date;
}

const blacklistSchema = new Schema<IBlacklist>({
  token: { type: String, required: true },
  createdAt: { type: Date, expires: '1h', default: Date.now }
});

const Blacklist = mongoose.model<IBlacklist>("Blacklists", blacklistSchema);
export default Blacklist;