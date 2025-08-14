
import mongoose, { Document, Schema } from 'mongoose';
import { type IPost } from './Post';

export interface IUser extends Document {
  name: string;
  email: string;
  password_hash: string;
  posts: IPost['_id'][];
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
});

export default mongoose.model<IUser>('User', UserSchema);
