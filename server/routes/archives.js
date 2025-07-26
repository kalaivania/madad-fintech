const express = require("express")
const path = require("path")
const fs = require("fs").promises
const JSZip = require("jszip")
const dataStorage = require("../lib/mongo-data-storage")

const router = express.Router()

// GET /api/archives
router.get("/", async (req, res) => {
  try {
    const archives = await getArchives()
    res.json({
      success: true,
      data: archives,
    })
  } catch (error) {
    console.error("Error fetching archives:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch archives",
    })
  }
})

// GET /api/archives/download/:filename
router.get("/download/:filename", async (req, res) => {
  try {
    const { filename } = req.params
    const filePath = path.join(__dirname, "../uploads", filename)

    // Check if file exists
    await fs.access(filePath)

    res.download(filePath, filename, (err) => {
      if (err) {
        console.error("Download error:", err)
        res.status(404).json({
          success: false,
          error: "File not found",
        })
      }
    })
  } catch (error) {
    console.error("Error downloading file:", error)
    res.status(404).json({
      success: false,
      error: "File not found",
    })
  }
})

// Create archive of applications
router.post("/", async (req, res) => {
  try {
    const { applicationIds } = req.body

    if (!applicationIds || !Array.isArray(applicationIds)) {
      return res.status(400).json({ error: "Invalid application IDs" })
    }

    const applications = await dataStorage.readData("applications")
    const selectedApps = applications.filter((app) => applicationIds.includes(app.id))

    if (selectedApps.length === 0) {
      return res.status(404).json({ error: "No applications found" })
    }

    const zip = new JSZip()

    // Add applications data
    zip.file("applications.json", JSON.stringify(selectedApps, null, 2))

    // Add summary
    const summary = {
      totalApplications: selectedApps.length,
      totalAmount: selectedApps.reduce((sum, app) => sum + Number.parseFloat(app.invoiceAmount || 0), 0),
      industries: [...new Set(selectedApps.map((app) => app.industry))],
      regions: [...new Set(selectedApps.map((app) => app.region))],
      generatedAt: new Date().toISOString(),
    }

    zip.file("summary.json", JSON.stringify(summary, null, 2))

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" })

    res.setHeader("Content-Type", "application/zip")
    res.setHeader("Content-Disposition", "attachment; filename=applications-archive.zip")
    res.send(zipBuffer)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
