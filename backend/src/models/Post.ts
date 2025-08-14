
import mongoose, { Document, Schema } from 'mongoose';
import { type IUser } from './User';
import { type IComment } from './Comment';

export interface IPost extends Document {
  title: string;
  content: string;
  author: IUser['_id'];
  comments: IComment['_id'][];
}

const PostSchema: Schema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
});

export default mongoose.model<IPost>('Post', PostSchema);
