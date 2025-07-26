const express = require("express")
const { v4: uuidv4 } = require("uuid")
const dataStorage = require("../lib/mongo-data-storage")

const router = express.Router()

// Get all lenders
router.get("/", async (req, res) => {
  try {
    const lenders = await dataStorage.getLenders()
    res.json({ success: true, data: lenders })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Get single lender with protection info
router.get("/:id", async (req, res) => {
  try {
    const lenderInfo = await dataStorage.getLenderInfo(req.params.id)

    if (!lenderInfo) {
      return res.status(404).json({ success: false, error: "Lender not found" })
    }

    res.json({ success: true, data: lenderInfo })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Create new lender
router.post("/", async (req, res) => {
  try {
    const lender = {
      id: uuidv4(),
      ...req.body,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      isDefault: false, // User-added lenders are never default
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await dataStorage.saveLender(lender)
    res.status(201).json({ success: true, data: lender })
  } catch (error) {
    console.error("Error creating lender:", error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Update lender
router.put("/:id", async (req, res) => {
  try {
    const updates = {
      ...req.body,
      updatedAt: new Date().toISOString(),
    }
    
    // Prevent modification of isDefault flag via API
    delete updates.isDefault

    const lenders = await dataStorage.getLenders()
    const lenderIndex = lenders.findIndex(l => l.id === req.params.id)
    
    if (lenderIndex === -1) {
      return res.status(404).json({ success: false, error: "Lender not found" })
    }

    const updatedLender = { ...lenders[lenderIndex], ...updates }
    await dataStorage.saveLender(updatedLender)
    
    res.json({ success: true, data: updatedLender })
  } catch (error) {
    console.error("Error updating lender:", error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Delete lender with protection check
router.delete("/:id", async (req, res) => {
  try {
    // Check if lender is deletable first
    const deletableCheck = await dataStorage.isLenderDeletable(req.params.id);
    
    if (!deletableCheck.deletable) {
      return res.status(403).json({ 
        success: false, 
        error: deletableCheck.reason,
        code: 'LENDER_PROTECTED'
      });
    }
    
    await dataStorage.deleteLender(req.params.id);
    res.json({ success: true, message: "Lender deleted successfully" });
  } catch (error) {
    console.error("Error deleting lender:", error);
    
    // Provide specific error messages
    if (error.message.includes('Cannot delete default lenders')) {
      res.status(403).json({ 
        success: false, 
        error: error.message,
        code: 'LENDER_PROTECTED'
      });
    } else if (error.message.includes('not found')) {
      res.status(404).json({ 
        success: false, 
        error: "Lender not found",
        code: 'LENDER_NOT_FOUND'
      });
    } else {
      res.status(500).json({ success: false, error: error.message });
    }
  }
});

// Check if lender is deletable
router.get("/:id/deletable", async (req, res) => {
  try {
    const deletableCheck = await dataStorage.isLenderDeletable(req.params.id);
    res.json({ 
      success: true, 
      data: {
        id: req.params.id,
        deletable: deletableCheck.deletable,
        reason: deletableCheck.reason
      }
    });
  } catch (error) {
    console.error("Error checking lender deletability:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Reset lenders to default
router.post("/reset", async (req, res) => {
  try {
    console.log("🔄 Reset lenders request received");
    const defaultLenders = await dataStorage.resetLendersToDefault();
    
    res.json({ 
      success: true, 
      data: defaultLenders,
      message: `Successfully reset to default configuration. Restored ${defaultLenders.filter(l => l.isDefault).length} default lenders and preserved ${defaultLenders.filter(l => !l.isDefault).length} user-added lenders.`
    });
  } catch (error) {
    console.error("Error resetting lenders:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router
