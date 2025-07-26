const fs = require("fs").promises
const path = require("path")

const DATA_DIR = path.join(__dirname, "../data")
const APPLICATIONS_FILE = "applications"
const LENDERS_FILE = "lenders"
const UPLOADS_DIR = path.join(__dirname, "../uploads")

// Default lenders data - matching the specifications exactly
// Using stable UUIDs for default lenders to ensure consistent identification
const DEFAULT_LENDERS = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001", // Stable UUID for Lender 1
    name: "Lender 1",
    isActive: true,
    isDefault: true, // Flag to identify default lenders
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
    id: "550e8400-e29b-41d4-a716-446655440002", // Stable UUID for Lender 2
    name: "Lender 2",
    isActive: true,
    isDefault: true, // Flag to identify default lenders
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
    id: "550e8400-e29b-41d4-a716-446655440003", // Stable UUID for Lender 3
    name: "Lender 3",
    isActive: true,
    isDefault: true, // Flag to identify default lenders
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
]

// Function to validate and ensure default lenders have proper UUIDs
function ensureDefaultLenderUUIDs() {
  const { v4: uuidv4 } = require("uuid")
  
  // UUID v4 regex pattern
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  
  let needsUpdate = false
  
  DEFAULT_LENDERS.forEach((lender, index) => {
    // Check if ID exists and is a valid UUID
    if (!lender.id || !uuidPattern.test(lender.id)) {
      // Generate a new UUID
      const newUUID = uuidv4()
      DEFAULT_LENDERS[index].id = newUUID
      needsUpdate = true
      console.log(`Generated new UUID for ${lender.name}: ${newUUID}`)
    } else {
      console.log(`${lender.name} already has valid UUID: ${lender.id}`)
    }
  })
  
  if (needsUpdate) {
    console.log("Default lenders updated with new UUIDs")
  } else {
    console.log("All default lenders already have valid UUIDs")
  }
}

// Ensure UUIDs are present when module loads
ensureDefaultLenderUUIDs()

class DataStorage {
  constructor() {
    this.dataDir = DATA_DIR
    // Ensure data directory exists synchronously on startup
    this.ensureDataDir().catch(console.error)
  }

  async ensureDataDir() {
    try {
      await fs.access(this.dataDir)
    } catch {
      await fs.mkdir(this.dataDir, { recursive: true })
    }
  }

  async readData(filename) {
    try {
      const filePath = path.join(this.dataDir, `${filename}.json`)
      const data = await fs.readFile(filePath, "utf8")
      return JSON.parse(data)
    } catch (error) {
      if (error.code === "ENOENT") {
        return []
      }
      throw error
    }
  }

  async writeData(filename, data) {
    try {
      // Ensure directory exists before writing
      await this.ensureDataDir()
      const filePath = path.join(this.dataDir, `${filename}.json`)
      await fs.writeFile(filePath, JSON.stringify(data, null, 2))
    } catch (error) {
      console.error(`Error writing data to ${filename}:`, error)
      throw error
    }
  }

  async appendData(filename, newItem) {
    const data = await this.readData(filename)
    data.push(newItem)
    await this.writeData(filename, data)
    return newItem
  }

  async updateData(filename, id, updates) {
    const data = await this.readData(filename)
    const index = data.findIndex((item) => item.id === id)
    if (index === -1) {
      throw new Error("Item not found")
    }
    data[index] = { ...data[index], ...updates }
    await this.writeData(filename, data)
    return data[index]
  }

  async deleteData(filename, id) {
    const data = await this.readData(filename)
    const filteredData = data.filter((item) => item.id !== id)
    await this.writeData(filename, filteredData)
    return true
  }

  async getApplications() {
    return await this.readData(APPLICATIONS_FILE)
  }

  async saveApplication(application) {
    return await this.appendData(APPLICATIONS_FILE, application)
  }

  async updateApplication(id, updates) {
    return await this.updateData(APPLICATIONS_FILE, id, updates)
  }

  async getLenders() {
    try {
      const lenders = await this.readData(LENDERS_FILE)
      // If we get an empty array, it means file exists but is empty, so populate with defaults
      if (lenders.length === 0) {
        await this.saveLenders(DEFAULT_LENDERS)
        return DEFAULT_LENDERS
      }
      
      // Check for and remove any duplicate lenders by ID
      const uniqueLenders = []
      const seenIds = new Set()
      
      for (const lender of lenders) {
        if (!seenIds.has(lender.id)) {
          seenIds.add(lender.id)
          uniqueLenders.push(lender)
        } else {
          console.warn(`Duplicate lender detected and removed: ${lender.name} (${lender.id})`)
        }
      }
      
      // If we removed duplicates, save the cleaned data
      if (uniqueLenders.length !== lenders.length) {
        console.log(`Removed ${lenders.length - uniqueLenders.length} duplicate lenders`)
        await this.saveLenders(uniqueLenders)
      }
      
      return uniqueLenders
    } catch (error) {
      // File doesn't exist, create it with default lenders
      await this.saveLenders(DEFAULT_LENDERS)
      return DEFAULT_LENDERS
    }
  }

  async saveLenders(lenders) {
    try {
      await this.writeData(LENDERS_FILE, lenders)
    } catch (error) {
      console.error("Error saving lenders:", error)
      throw error
    }
  }

  async saveLender(lender) {
    try {
      // Read existing lenders directly to avoid triggering the default creation logic
      let lenders = []
      try {
        lenders = await this.readData(LENDERS_FILE)
      } catch (error) {
        // File doesn't exist, start with empty array
        lenders = []
      }
      
      const existingIndex = lenders.findIndex((l) => l.id === lender.id)
      if (existingIndex >= 0) {
        lenders[existingIndex] = lender
      } else {
        lenders.push(lender)
      }
      await this.saveLenders(lenders)
    } catch (error) {
      console.error("Error saving lender:", error)
      throw error
    }
  }

  async deleteLender(id) {
    return await this.deleteData(LENDERS_FILE, id)
  }

  async resetLendersToDefault() {
    const currentLenders = await this.getLenders()
    
    // Find user-added lenders (those that don't have isDefault flag)
    const userAddedLenders = currentLenders.filter(lender => 
      !lender.isDefault
    )
    
    // Combine default lenders with user-added lenders
    const resetLenders = [...DEFAULT_LENDERS, ...userAddedLenders]
    
    await this.saveLenders(resetLenders)
    return resetLenders
  }

  async getArchives() {
    try {
      await fs.access(UPLOADS_DIR)
      const files = await fs.readdir(UPLOADS_DIR)
      return files.filter((file) => file.endsWith(".zip"))
    } catch (error) {
      return []
    }
  }
}

module.exports = new DataStorage()
