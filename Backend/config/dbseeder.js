// config/dbSeeder.js
import 'dotenv/config'; // Automatically reads your local hidden .env file
import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error("❌ Critical System Error: MONGODB_URI is missing from your .env file!");
    process.exit(1);
}

const client = new MongoClient(uri);

// ES Modules do not support __dirname directly, so we derive it here:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function executeSeeding() {
    try {
        console.log("🔌 Connecting to FindMeds Cloud Cluster...");
        await client.connect();
        
        const db = client.db('findmeds_db');
        const blocklistCollection = db.collection('cdsco_blocklist');

        // Resolve absolute path to your JSON data
        const dataPath = path.join(__dirname, '../data/schedule_h_list.json');
        const rawData = fs.readFileSync(dataPath, 'utf8');
        const restrictedDrugs = JSON.parse(rawData);

        console.log("🧹 Clearing old data entries from 'cdsco_blocklist'...");
        await blocklistCollection.deleteMany({});

        console.log(`🚀 Uploading ${restrictedDrugs.length} verified records to MongoDB Atlas...`);
        const result = await blocklistCollection.insertMany(restrictedDrugs);
        console.log(`✅ Success! Seeded ${result.insertedCount} master documents.`);

        // Programmatically enforce a high-speed text lookup index over the drug name field
        console.log("🏷️  Configuring performance text index rules over 'drugName'...");
        await blocklistCollection.createIndex({ drugName: "text" });
        console.log("🎯 Text-search index activated successfully!");

    } catch (err) {
        console.error("❌ Seeding pipeline failed:", err);
    } finally {
        await client.close();
        console.log("🔌 Database connection cleanly closed.");
    }
}

executeSeeding();
