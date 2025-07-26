#!/usr/bin/env node

/**
 * Default Lenders Management Script
 * 
 * This script provides utilities to manage default lenders:
 * - Backup current default lenders to JSON file
 * - Restore default lenders from JSON file
 * - Validate default lenders configuration
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Database connection
const database = require('./config/database');
const Lender = require('./models/Lender');

const DEFAULT_LENDERS_FILE = path.join(__dirname, 'data/default-lenders.json');

async function backupDefaultLenders() {
  try {
    console.log('🔄 Backing up current default lenders...');
    
    // Connect to database
    await database.connect();
    
    // Get all default lenders
    const defaultLenders = await Lender.find({ isDefault: true }).sort({ name: 1 });
    
    if (defaultLenders.length === 0) {
      console.log('⚠️ No default lenders found in database');
      return;
    }
    
    // Create backup object
    const backup = {
      version: "1.0",
      description: "Default lenders configuration for MSME Lender Platform",
      lastUpdated: new Date().toISOString(),
      backupDate: new Date().toISOString(),
      lenders: defaultLenders.map(lender => {
        const lenderObj = lender.toJSON();
        // Remove MongoDB-specific fields
        delete lenderObj.__v;
        delete lenderObj.createdAt;
        delete lenderObj.updatedAt;
        return lenderObj;
      })
    };
    
    // Create backup with timestamp
    const backupFileName = `default-lenders-backup-${new Date().toISOString().split('T')[0]}.json`;
    const backupPath = path.join(__dirname, 'data', backupFileName);
    
    // Ensure data directory exists
    const dataDir = path.dirname(backupPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Write backup file
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
    console.log(`✅ Backed up ${backup.lenders.length} default lenders to: ${backupPath}`);
    
    // Also update the main default-lenders.json file
    fs.writeFileSync(DEFAULT_LENDERS_FILE, JSON.stringify(backup, null, 2));
    console.log(`✅ Updated main configuration file: ${DEFAULT_LENDERS_FILE}`);
    
    await database.disconnect();
    
  } catch (error) {
    console.error('❌ Error backing up default lenders:', error);
    process.exit(1);
  }
}

async function restoreDefaultLenders(filePath = DEFAULT_LENDERS_FILE) {
  try {
    console.log(`🔄 Restoring default lenders from: ${filePath}`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      process.exit(1);
    }
    
    // Read and parse file
    const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (!fileContent.lenders || !Array.isArray(fileContent.lenders)) {
      console.error('❌ Invalid file format: missing or invalid lenders array');
      process.exit(1);
    }
    
    console.log(`📋 Found ${fileContent.lenders.length} lenders in file`);
    
    // Connect to database
    await database.connect();
    
    // Backup existing user-added lenders
    const userLenders = await Lender.find({ isDefault: { $ne: true } });
    console.log(`📋 Found ${userLenders.length} user-added lenders to preserve`);
    
    // Remove all default lenders
    const deletedCount = await Lender.deleteMany({ isDefault: true });
    console.log(`🗑️ Removed ${deletedCount.deletedCount} existing default lenders`);
    
    // Insert new default lenders
    const newDefaultLenders = await Lender.insertMany(fileContent.lenders);
    console.log(`✅ Restored ${newDefaultLenders.length} default lenders`);
    
    console.log('🎉 Default lenders restoration completed successfully');
    
    await database.disconnect();
    
  } catch (error) {
    console.error('❌ Error restoring default lenders:', error);
    process.exit(1);
  }
}

async function validateDefaultLenders(filePath = DEFAULT_LENDERS_FILE) {
  try {
    console.log(`🔍 Validating default lenders file: ${filePath}`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      return false;
    }
    
    // Read and parse file
    const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Validate structure
    const requiredFields = ['version', 'description', 'lenders'];
    for (const field of requiredFields) {
      if (!fileContent[field]) {
        console.error(`❌ Missing required field: ${field}`);
        return false;
      }
    }
    
    if (!Array.isArray(fileContent.lenders)) {
      console.error('❌ Lenders field must be an array');
      return false;
    }
    
    // Validate each lender
    const requiredLenderFields = ['_id', 'name', 'isDefault', 'creditScore', 'documents', 'bankStatement', 'auditedReport'];
    
    for (let i = 0; i < fileContent.lenders.length; i++) {
      const lender = fileContent.lenders[i];
      
      for (const field of requiredLenderFields) {
        if (!lender[field]) {
          console.error(`❌ Lender ${i + 1}: Missing required field: ${field}`);
          return false;
        }
      }
      
      if (!lender.isDefault) {
        console.error(`❌ Lender ${i + 1}: isDefault must be true for default lenders`);
        return false;
      }
    }
    
    console.log(`✅ File validation passed. Found ${fileContent.lenders.length} valid default lenders`);
    return true;
    
  } catch (error) {
    console.error('❌ Error validating default lenders file:', error);
    return false;
  }
}

// CLI Interface
const command = process.argv[2];
const filePath = process.argv[3];

switch (command) {
  case 'backup':
    backupDefaultLenders();
    break;
    
  case 'restore':
    restoreDefaultLenders(filePath);
    break;
    
  case 'validate':
    validateDefaultLenders(filePath).then(isValid => {
      process.exit(isValid ? 0 : 1);
    });
    break;
    
  default:
    console.log(`
Default Lenders Management Script

Usage:
  node manage-default-lenders.js backup                    - Backup current default lenders
  node manage-default-lenders.js restore [file]           - Restore default lenders from file
  node manage-default-lenders.js validate [file]          - Validate default lenders file

Examples:
  node manage-default-lenders.js backup
  node manage-default-lenders.js restore
  node manage-default-lenders.js restore data/backup.json
  node manage-default-lenders.js validate
    `);
    process.exit(1);
}
