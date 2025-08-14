
import mongoose, { Document, Schema } from 'mongoose';
import { type IUser } from './User';

export interface IComment extends Document {
  text: string;
  author: IUser['_id'];
  comments: IComment['_id'][];
}

const CommentSchema: Schema = new Schema({
  text: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
});

export default mongoose.model<IComment>('Comment', CommentSchema);
