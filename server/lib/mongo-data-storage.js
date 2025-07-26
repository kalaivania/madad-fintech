const Lender = require('../models/Lender');
const Application = require('../models/Application');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Load default lenders from JSON file
function loadDefaultLenders() {
  try {
    const defaultLendersPath = path.join(__dirname, '../data/default-lenders.json');
    const defaultLendersData = JSON.parse(fs.readFileSync(defaultLendersPath, 'utf8'));
    return defaultLendersData.lenders;
  } catch (error) {
    console.error('❌ Error loading default lenders from file:', error);
    // Fallback to hardcoded default lenders
    return [
      {
        _id: "550e8400-e29b-41d4-a716-446655440001",
        name: "Lender 1",
        isActive: true,
        isDefault: true,
        creditScore: {
          high: 725,
          medium: 700,
          multipliers: {
            high: 1.5,
            medium: 1.2,
            low: 0.9,
          },
        },
        documents: {
          all4: 1.25,
          any3: 1.1,
          any2: 1.05,
          onlyCR: 1.0,
        },
        bankStatement: {
          available: 1.2,
          notAvailable: 1.0,
        },
        auditedReport: {
          available: 1.5,
          notAvailable: 1.0,
        },
      },
      {
        _id: "550e8400-e29b-41d4-a716-446655440002",
        name: "Lender 2",
        isActive: true,
        isDefault: true,
        creditScore: {
          high: 750,
          medium: 700,
          multipliers: {
            high: 1.6,
            medium: 1.25,
            low: 0.8,
          },
        },
        documents: {
          all4: 1.5,
          any3: 1.2,
          any2: 1.05,
          onlyCR: 1.0,
        },
        bankStatement: {
          available: 1.25,
          notAvailable: 1.0,
        },
        auditedReport: {
          available: 1.25,
          notAvailable: 1.0,
        },
      },
      {
        _id: "550e8400-e29b-41d4-a716-446655440003",
        name: "Lender 3",
        isActive: true,
        isDefault: true,
        creditScore: {
          high: 740,
          medium: 700,
          multipliers: {
            high: 1.4,
            medium: 1.1,
            low: 0.9,
          },
        },
        documents: {
          all4: 1.3,
          any3: 1.15,
          any2: 1.05,
          onlyCR: 1.0,
        },
        bankStatement: {
          available: 1.2,
          notAvailable: 1.0,
        },
        auditedReport: {
          available: 1.4,
          notAvailable: 1.0,
        },
      },
    ];
  }
}

const DEFAULT_LENDERS = loadDefaultLenders();

class MongoDataStorage {
  constructor() {
    console.log('💾 MongoDB Data Storage initialized');
  }

  // Initialize default data if needed
  async initializeDefaultData() {
    try {
      const existingLenders = await Lender.countDocuments();
      
      if (existingLenders === 0) {
        console.log('📋 No lenders found, creating default lenders...');
        await Lender.insertMany(DEFAULT_LENDERS);
        console.log('✅ Default lenders created successfully');
      } else {
        console.log(`📊 Found ${existingLenders} existing lenders`);
      }
    } catch (error) {
      console.error('❌ Error initializing default data:', error);
      throw error;
    }
  }

  // Application methods
  async getApplications() {
    try {
      const applications = await Application.find({}).sort({ createdAt: -1 });
      return applications.map(app => app.toJSON());
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
  }

  async getApplicationById(id) {
    try {
      const application = await Application.findById(id);
      return application ? application.toJSON() : null;
    } catch (error) {
      console.error('Error fetching application:', error);
      throw error;
    }
  }

  async saveApplication(applicationData) {
    try {
      const application = new Application({
        _id: applicationData.id || uuidv4(),
        ...applicationData
      });
      
      const savedApplication = await application.save();
      return savedApplication.toJSON();
    } catch (error) {
      console.error('Error saving application:', error);
      throw error;
    }
  }

  async updateApplication(id, updates) {
    try {
      const application = await Application.findByIdAndUpdate(
        id, 
        updates, 
        { new: true, runValidators: true }
      );
      
      if (!application) {
        throw new Error('Application not found');
      }
      
      return application.toJSON();
    } catch (error) {
      console.error('Error updating application:', error);
      throw error;
    }
  }

  async deleteApplication(id) {
    try {
      const result = await Application.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting application:', error);
      throw error;
    }
  }

  // Lender methods
  async getLenders() {
    try {
      const lenders = await Lender.find({}).sort({ isDefault: -1, name: 1 });
      return lenders.map(lender => lender.toJSON());
    } catch (error) {
      console.error('Error fetching lenders:', error);
      throw error;
    }
  }

  async getLenderById(id) {
    try {
      const lender = await Lender.findById(id);
      return lender ? lender.toJSON() : null;
    } catch (error) {
      console.error('Error fetching lender:', error);
      throw error;
    }
  }

  async saveLender(lenderData) {
    try {
      // Check if lender exists
      const existingLender = await Lender.findById(lenderData.id);
      
      if (existingLender) {
        // Update existing lender
        const updatedLender = await Lender.findByIdAndUpdate(
          lenderData.id,
          lenderData,
          { new: true, runValidators: true }
        );
        return updatedLender.toJSON();
      } else {
        // Create new lender
        const lender = new Lender({
          _id: lenderData.id || uuidv4(),
          ...lenderData
        });
        
        const savedLender = await lender.save();
        return savedLender.toJSON();
      }
    } catch (error) {
      console.error('Error saving lender:', error);
      throw error;
    }
  }

  async saveApplications(applicationsData) {
    try {
      // Delete all existing and insert new ones
      await Application.deleteMany({});
      
      const applicationsToInsert = applicationsData.map(app => ({
        _id: app.id,
        ...app
      }));
      
      const savedApplications = await Application.insertMany(applicationsToInsert);
      return savedApplications.map(app => app.toJSON());
    } catch (error) {
      console.error('Error saving applications:', error);
      throw error;
    }
  }

  async deleteLender(id) {
    try {
      // Check if lender exists first
      const lender = await Lender.findById(id);
      if (!lender) {
        throw new Error('Lender not found');
      }
      
      // Prevent deletion of default lenders
      if (lender.isDefault) {
        throw new Error('Cannot delete default lenders. Default lenders are protected to ensure system functionality. Use the reset function to restore default lenders if needed.');
      }
      
      const result = await Lender.findByIdAndDelete(id);
      console.log(`✅ Deleted user-added lender: ${lender.name}`);
      return !!result;
    } catch (error) {
      console.error('Error deleting lender:', error);
      throw error;
    }
  }

  async resetLendersToDefault() {
    try {
      console.log('🔄 Resetting lenders to default configuration...');
      
      // Backup user-added lenders before reset
      const userAddedLenders = await Lender.find({ isDefault: { $ne: true } });
      console.log(`📋 Found ${userAddedLenders.length} user-added lenders to preserve`);
      
      // Remove all lenders
      await Lender.deleteMany({});
      console.log('🗑️ Cleared all existing lenders');
      
      // Reload default lenders from file (in case file was updated)
      const freshDefaultLenders = loadDefaultLenders();
      
      // Insert fresh default lenders
      await Lender.insertMany(freshDefaultLenders);
      console.log(`✅ Restored ${freshDefaultLenders.length} default lenders from configuration file`);
      
      // Re-insert user-added lenders
      if (userAddedLenders.length > 0) {
        await Lender.insertMany(userAddedLenders);
        console.log(`✅ Restored ${userAddedLenders.length} user-added lenders`);
      }
      
      // Return all lenders sorted (defaults first, then user-added)
      const allLenders = await Lender.find({}).sort({ isDefault: -1, name: 1 });
      console.log('🎉 Lender reset completed successfully');
      return allLenders.map(lender => lender.toJSON());
    } catch (error) {
      console.error('❌ Error resetting lenders:', error);
      throw error;
    }
  }

  // New method to check if a lender is deletable
  async isLenderDeletable(id) {
    try {
      const lender = await Lender.findById(id);
      if (!lender) {
        return { deletable: false, reason: 'Lender not found' };
      }
      
      if (lender.isDefault) {
        return { 
          deletable: false, 
          reason: 'Default lenders cannot be deleted. They are protected system lenders.' 
        };
      }
      
      return { deletable: true, reason: null };
    } catch (error) {
      return { deletable: false, reason: error.message };
    }
  }

  // New method to get lender info including protection status
  async getLenderInfo(id) {
    try {
      const lender = await Lender.findById(id);
      if (!lender) {
        return null;
      }
      
      return {
        ...lender.toJSON(),
        protection: {
          isDeletable: !lender.isDefault,
          isEditable: true, // All lenders can be edited
          reason: lender.isDefault ? 'Default lender - protected from deletion' : null
        }
      };
    } catch (error) {
      console.error('Error getting lender info:', error);
      throw error;
    }
  }

  // Archive methods (placeholder - can be implemented if needed)
  async getArchives() {
    try {
      // This would require a separate Archives collection or file system integration
      return [];
    } catch (error) {
      console.error('Error fetching archives:', error);
      return [];
    }
  }

  // Legacy methods for backward compatibility
  async readData(collection) {
    if (collection === 'applications') {
      return this.getApplications();
    } else if (collection === 'lenders') {
      return this.getLenders();
    }
    return [];
  }

  async writeData(collection, data) {
    if (collection === 'lenders') {
      return this.saveLenders(data);
    } else if (collection === 'applications') {
      return this.saveApplications(data);
    }
    throw new Error(`writeData not implemented for collection: ${collection}`);
  }

  async appendData(collection, item) {
    if (collection === 'applications') {
      return this.saveApplication(item);
    }
    throw new Error(`appendData not implemented for collection: ${collection}`);
  }

  async updateData(collection, id, updates) {
    if (collection === 'applications') {
      return this.updateApplication(id, updates);
    }
    throw new Error(`updateData not implemented for collection: ${collection}`);
  }

  async deleteData(collection, id) {
    if (collection === 'applications') {
      return this.deleteApplication(id);
    } else if (collection === 'lenders') {
      return this.deleteLender(id);
    }
    throw new Error(`deleteData not implemented for collection: ${collection}`);
  }
}

module.exports = new MongoDataStorage();
