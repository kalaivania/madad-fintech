const express = require("express")
const multer = require("multer")
const path = require("path")
const fs = require("fs").promises

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads")
    try {
      await fs.access(uploadDir)
    } catch {
      await fs.mkdir(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|xls|xlsx/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error("Invalid file type"))
    }
  },
})

// Upload single file
router.post("/", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" })
    }

    res.json({
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      path: `/uploads/${req.file.filename}`,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Upload multiple files
router.post("/multiple", upload.array("files", 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" })
    }

    const files = req.files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      path: `/uploads/${file.filename}`,
    }))

    res.json(files)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Download file
router.get("/:filename", async (req, res) => {
  try {
    const filename = req.params.filename
    const filePath = path.join(__dirname, "../uploads", filename)

    await fs.access(filePath)
    res.download(filePath)
  } catch (error) {
    res.status(404).json({ error: "File not found" })
  }
})

module.exports = router
