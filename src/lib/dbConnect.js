import { connectToDatabase } from './mongodb';

async function dbConnect() {
  return await connectToDatabase();
}

export default dbConnect;