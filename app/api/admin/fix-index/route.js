import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import mongoose from "mongoose";

export async function GET() {
  try {
    await dbConnect();
    const db = mongoose.connection.db;
    const collection = db.collection('products');

    // Check if index exists
    const indexes = await collection.indexes();
    const hasIdIndex = indexes.some(idx => idx.name === 'id_1');

    if (hasIdIndex) {
      console.log('Found stale "id_1" index. Dropping it...');
      await collection.dropIndex('id_1');
      return NextResponse.json({ 
        success: true, 
        message: 'Successfully dropped "id_1" index.',
        indexes: await collection.indexes()
      });
    } else {
      return NextResponse.json({ 
        success: true, 
        message: 'No "id_1" index found. It might have been already dropped.',
        currentIndexes: indexes.map(idx => idx.name)
      });
    }

  } catch (error) {
    console.error('Error dropping index:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}
