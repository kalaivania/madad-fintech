#!/usr/bin/env node

/**
 * Migration script to move data from JSON files to MongoDB
 * Run this script to migrate your existing data
 */

require('dotenv').config();
const database = require('./config/database');
const mongoDataStorage = require('./lib/mongo-data-storage');
const jsonDataStorage = require('./lib/data-storage');
const path = require('path');
const fs = require('fs').promises;

async function migrateData() {
  console.log('🔄 Starting data migration from JSON to MongoDB...');
  
  try {
    // Connect to MongoDB
    await database.connect();
    console.log('✅ Connected to MongoDB');
    
    // Check if JSON data files exist
    const dataDir = path.join(__dirname, 'data');
    const lendersFile = path.join(dataDir, 'lenders.json');
    const applicationsFile = path.join(dataDir, 'applications.json');
    
    let migrationCount = 0;
    
    // Migrate lenders
    try {
      await fs.access(lendersFile);
      console.log('📋 Found lenders.json, migrating lenders...');
      
      const lenders = await jsonDataStorage.getLenders();
      if (lenders.length > 0) {
        await mongoDataStorage.saveLenders(lenders);
        console.log(`✅ Migrated ${lenders.length} lenders to MongoDB`);
        migrationCount++;
      }
    } catch (error) {
      console.log('ℹ️  No lenders.json found or error reading file');
    }
    
    // Migrate applications
    try {
      await fs.access(applicationsFile);
      console.log('📄 Found applications.json, migrating applications...');
      
      const applications = await jsonDataStorage.getApplications();
      if (applications.length > 0) {
        for (const app of applications) {
          await mongoDataStorage.saveApplication(app);
        }
        console.log(`✅ Migrated ${applications.length} applications to MongoDB`);
        migrationCount++;
      }
    } catch (error) {
      console.log('ℹ️  No applications.json found or error reading file');
    }
    
    if (migrationCount === 0) {
      console.log('ℹ️  No data found to migrate');
    }
    
    // Initialize default data if needed
    await mongoDataStorage.initializeDefaultData();
    
    console.log('🎉 Migration completed successfully!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('1. Update your application to use MongoDB (already done)');
    console.log('2. Start your server with: npm run dev');
    console.log('3. Optionally backup and remove old JSON files from data/ directory');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await database.disconnect();
    process.exit(0);
  }
}

// Run migration
migrateData();
