// config/dbSeeder.js
import 'dotenv/config'; 
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import your unified team database connection helper
import connectDB from './db.js';

// Import your updated Mongoose Model
import Drug from '../models/Drug.js'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function executeSeeding() {
    try {
        console.log("🔌 Connecting to FindMeds Cloud Cluster via Mongoose...");
        await connectDB(); 
        
        // Resolve path and extract local master records
        const dataPath = path.join(__dirname, '../data/schedule_h_list.json');
        if (!fs.existsSync(dataPath)) {
            throw new Error(`Data file not found at path: ${dataPath}`);
        }
        
        const rawData = fs.readFileSync(dataPath, 'utf8');
        const restrictedDrugs = JSON.parse(rawData);

        // Clear out old records safely using your Mongoose Model
        console.log("🧹 Clearing old data entries from 'cdsco_blocklist'...");
        await Drug.deleteMany({});

        // Batch upload documents while respecting your Mongoose structural rules
        console.log(`🚀 Uploading ${restrictedDrugs.length} verified records to MongoDB Atlas...`);
        const result = await Drug.insertMany(restrictedDrugs);
        console.log(`✅ Success! Seeded ${result.length} master regulatory documents.`);
        console.log("🎯 Text-search indexes are actively compiling over 'drugName' via schema configuration.");

    } catch (err) {
        console.error("❌ Seeding pipeline failed:", err);
    } finally {
        // Safely detach from cloud cluster instance
        await mongoose.connection.close();
        console.log("🔌 Database connection cleanly closed.");
        process.exit(0);
    }
}

executeSeeding();