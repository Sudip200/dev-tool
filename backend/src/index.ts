
import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/auth';
import postRoutes from './routes/post';
import cors from 'cors';
import dotenev  from 'dotenv';
import { data } from './routes/seed_posts';
import Post from './models/Post';
const app = express();
dotenev.config();
app.use(express.json());
app.use(cors(
  {
    origin:'*'
  }
));
app.use('/api/auth', authRoutes);
app.use('/api',  postRoutes);

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || '';

mongoose.connect(MONGO_URI)
.then(() => {  
  console.log('Connected to MongoDB');

   app.listen(PORT, () => {
     console.log(`Server is running on port ${PORT}`);
   }); 
})
.catch(err => {
  console.error('Failed to connect to MongoDB', err);
});
