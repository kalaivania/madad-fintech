const express = require("express")
const { v4: uuidv4 } = require("uuid")
const dataStorage = require("../lib/mongo-data-storage")
const { calculateLenderAssignment } = require("../utils/lender-calculations")

const router = express.Router()

// Get all applications
router.get("/", async (req, res) => {
  try {
    const applications = await dataStorage.readData("applications")
    res.json({ success: true, data: applications })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Get single application
router.get("/:id", async (req, res) => {
  try {
    const applications = await dataStorage.readData("applications")
    const application = applications.find((app) => app.id === req.params.id)

    if (!application) {
      return res.status(404).json({ success: false, error: "Application not found" })
    }

    res.json({ success: true, data: application })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Create new application
router.post("/", async (req, res) => {
  try {
    const application = {
      id: uuidv4(),
      ...req.body,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const savedApplication = await dataStorage.saveApplication(application)
    res.status(201).json({ success: true, data: savedApplication })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Update application
router.put("/:id", async (req, res) => {
  try {
    const updates = {
      ...req.body,
      updatedAt: new Date().toISOString(),
    }

    const updatedApplication = await dataStorage.updateApplication(req.params.id, updates)
    
    if (!updatedApplication) {
      return res.status(404).json({ success: false, error: "Application not found" })
    }

    res.json({ success: true, data: updatedApplication })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Delete application
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await dataStorage.deleteApplication(req.params.id)
    
    if (!deleted) {
      return res.status(404).json({ success: false, error: "Application not found" })
    }

    res.json({ success: true, message: "Application deleted successfully" })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Calculate lender assignment directly from application data
router.post("/calculate-assignment", async (req, res) => {
  try {
    const applicationData = req.body

    if (!applicationData) {
      return res.status(400).json({ success: false, error: "Application data is required" })
    }

    const lenders = await dataStorage.getLenders()
    const assignment = calculateLenderAssignment(applicationData, lenders)

    res.json({ success: true, data: assignment })
  } catch (error) {
    console.error("Calculate assignment error:", error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Calculate lender assignment for existing application
router.post("/:id/calculate-assignment", async (req, res) => {
  try {
    const applications = await dataStorage.readData("applications")
    const application = applications.find((app) => app.id === req.params.id)

    if (!application) {
      return res.status(404).json({ success: false, error: "Application not found" })
    }

    const lenders = await dataStorage.getLenders()
    const assignment = calculateLenderAssignment(application, lenders)

    res.json({ success: true, data: assignment })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

module.exports = router
