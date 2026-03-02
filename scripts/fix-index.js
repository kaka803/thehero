const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable inside .env.local');
  process.exit(1);
}

async function fixIndex() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('products');

    // Check if index exists
    const indexes = await collection.indexes();
    const hasIdIndex = indexes.some(idx => idx.name === 'id_1');

    if (hasIdIndex) {
      console.log('Found stale "id_1" index. Dropping it...');
      await collection.dropIndex('id_1');
      console.log('Successfully dropped "id_1" index.');
    } else {
      console.log('No "id_1" index found. It might have been already dropped or the name is different.');
      console.log('Current indexes:', indexes.map(idx => idx.name).join(', '));
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixIndex();
