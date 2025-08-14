
import mongoose, { Document, Schema } from 'mongoose';
import { type IUser } from './User';
import { type IPost } from './Post';

export interface IBookmark extends Document {
  user: IUser['_id'];
  post: IPost['_id'];
}

const BookmarkSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
});

export default mongoose.model<IBookmark>('Bookmark', BookmarkSchema);
