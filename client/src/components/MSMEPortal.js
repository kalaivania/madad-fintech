"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Badge } from "./ui/badge"
import { Alert, AlertDescription } from "./ui/alert"
import {
  ArrowLeft,
  Building2,
  Upload,
  FileText,
  CheckCircle,
  X,
  TestTube,
  AlertCircle,
  Loader2,
  Eye,
  Send,
  RotateCcw,
} from "lucide-react"

function MSMEPortal({ onBack }) {
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    monthlyTransaction: "",
    creditScore: "",
  })

  const [documents, setDocuments] = useState({
    commercialRegistration: false,
    taxCertificate: false,
    bankStatement: false,
    auditedReport: false,
    tradeLicense: false,
    financialStatements: false,
  })

  const [uploadedFiles, setUploadedFiles] = useState({})
  const [availableOffers, setAvailableOffers] = useState([])
  const [submittedApplications, setSubmittedApplications] = useState([])
  const [showOffers, setShowOffers] = useState(false)
  const [showSubmittedApps, setShowSubmittedApps] = useState(false)
  const [error, setError] = useState(null)
  const [calculatingOffers, setCalculatingOffers] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const documentLabels = {
    commercialRegistration: "Commercial Registration (Mandatory)",
    tradeLicense: "Trade License", 
    taxCertificate: "Estd Certificate",
    financialStatements: "Tax Card",
    bankStatement: "Bank Statement (Separate Multiplier)",
    auditedReport: "Audited Financial Report (Separate Multiplier)",
  }

  const loadTestData = () => {
    setFormData({
      companyName: "Global Trading Solutions",
      contactPerson: "John Smith",
      email: "john.smith@globaltrade.com",
      phone: "+1 555 123 4567",
      monthlyTransaction: "100000",
      creditScore: "710",
    })

    setDocuments({
      commercialRegistration: true,
      taxCertificate: true,
      bankStatement: true,
      auditedReport: true,
      tradeLicense: true,
      financialStatements: true,
    })

    // Create mock file data for test
    const mockFiles = {
      commercialRegistration: {
        filename: "mock_cr_global_trading.pdf",
        originalName: "Commercial_Registration_Global_Trading.pdf",
        size: 245760,
        type: "application/pdf",
        uploadedAt: new Date(),
        isMock: true,
      },
      taxCertificate: {
        filename: "mock_tax_cert_global.pdf",
        originalName: "Tax_Certificate_2024.pdf",
        size: 189440,
        type: "application/pdf",
        uploadedAt: new Date(),
        isMock: true,
      },
      bankStatement: {
        filename: "mock_bank_statement_global.pdf",
        originalName: "Bank_Statement_Q4_2024.pdf",
        size: 512000,
        type: "application/pdf",
        uploadedAt: new Date(),
        isMock: true,
      },
      auditedReport: {
        filename: "mock_audit_report_global.pdf",
        originalName: "Audited_Report_2024.pdf",
        size: 1048576,
        type: "application/pdf",
        uploadedAt: new Date(),
        isMock: true,
      },
      tradeLicense: {
        filename: "mock_trade_license_global.pdf",
        originalName: "Trade_License_Global_Trading.pdf",
        size: 156672,
        type: "application/pdf",
        uploadedAt: new Date(),
        isMock: true,
      },
      financialStatements: {
        filename: "mock_financial_statements_global.pdf",
        originalName: "Financial_Statements_2024.pdf",
        size: 768000,
        type: "application/pdf",
        uploadedAt: new Date(),
        isMock: true,
      },
    }

    setUploadedFiles(mockFiles)
    setError(null)
    setShowOffers(false)
    setAvailableOffers([])
    setSuccessMessage("Sample data loaded successfully! Ready to calculate offers.")
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  const resetForm = () => {
    setFormData({
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
      monthlyTransaction: "",
      creditScore: "",
    })

    setDocuments({
      commercialRegistration: false,
      taxCertificate: false,
      bankStatement: false,
      auditedReport: false,
      tradeLicense: false,
      financialStatements: false,
    })

    setUploadedFiles({})
    setError(null)
    setShowOffers(false)
    setAvailableOffers([])
    setSubmittedApplications([])
    setSuccessMessage("Form reset successfully! Ready for new application.")
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = async (docType, file) => {
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("docType", docType)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const result = await response.json()

      if (result.success) {
        setUploadedFiles((prev) => ({
          ...prev,
          [docType]: {
            filename: result.filename,
            originalName: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date(),
            isMock: false,
          },
        }))

        setDocuments((prev) => ({ ...prev, [docType]: true }))
      }
    } catch (error) {
      console.error("Upload error:", error)
      setError("Failed to upload file")
    }
  }

  const removeFile = (docType) => {
    setUploadedFiles((prev) => {
      const updated = { ...prev }
      delete updated[docType]
      return updated
    })
    setDocuments((prev) => ({ ...prev, [docType]: false }))
  }

  const calculateOffers = async (e) => {
    e.preventDefault()
    setError(null)

    // Prevent multiple simultaneous requests
    if (calculatingOffers) {
      console.log("Already calculating offers, ignoring duplicate request")
      return
    }

    // Validation
    if (!documents.commercialRegistration) {
      setError("Commercial Registration is mandatory")
      return
    }

    if (!formData.companyName || !formData.contactPerson || !formData.email) {
      setError("Please fill in all required fields")
      return
    }

    const applicationData = {
      id: `app-${Date.now()}`,
      companyName: formData.companyName,
      contactPerson: formData.contactPerson,
      email: formData.email,
      phone: formData.phone,
      monthlyTransaction: Number.parseFloat(formData.monthlyTransaction) || 0,
      creditScore: Number.parseInt(formData.creditScore) || 0,
      documents,
      bankStatement: documents.bankStatement,
      auditedReport: documents.auditedReport,
      uploadedFiles,
      status: "pending",
      createdAt: new Date().toISOString(),
    }

    try {
      setCalculatingOffers(true)

      // Call the calculate assignment API to get all lender offers
      const response = await fetch("/api/applications/calculate-assignment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(applicationData),
      })

      if (!response.ok) {
        throw new Error("Failed to calculate offers")
      }

      const result = await response.json()

      if (result.success && result.data) {
        const offersArray = Array.isArray(result.data) ? result.data : []

        const formattedOffers = offersArray.map((assignment) => ({
          lenderId: assignment.lenderId || `lender-${Math.random()}`,
          lenderName: assignment.lenderName || "Unknown Lender",
          creditLimit: assignment.creditLimit || 0,
          terms: assignment.terms || "Standard terms apply",
        }))

        // Remove duplicates based on lenderId to prevent duplicate displays
        const uniqueOffers = formattedOffers.reduce((acc, current) => {
          const existingOffer = acc.find(offer => offer.lenderId === current.lenderId)
          if (!existingOffer) {
            acc.push(current)
          } else {
            console.warn(`Duplicate lender offer detected and removed: ${current.lenderName} (${current.lenderId})`)
          }
          return acc
        }, [])

        console.log("Original offers:", formattedOffers.length, "Unique offers:", uniqueOffers.length)
        setAvailableOffers(uniqueOffers)
        setShowOffers(true)

        if (uniqueOffers.length === 0) {
          setError("No offers available for your profile")
        }
      } else {
        setAvailableOffers([])
        setError(result.error || "No offers available")
      }
    } catch (error) {
      console.error("Error calculating offers:", error)
      setError("Failed to calculate lender offers")
      setAvailableOffers([])
    } finally {
      setCalculatingOffers(false)
    }
  }

  const applyToLender = async (lenderOffer) => {
    const applicationData = {
      id: `app-${Date.now()}`,
      companyName: formData.companyName,
      contactPerson: formData.contactPerson,
      email: formData.email,
      phone: formData.phone,
      monthlyTransaction: Number.parseFloat(formData.monthlyTransaction) || 0,
      creditScore: Number.parseInt(formData.creditScore) || 0,
      documents,
      bankStatement: documents.bankStatement,
      auditedReport: documents.auditedReport,
      uploadedFiles,
      status: "under_review",
      assignedLender: {
        lenderId: lenderOffer.lenderId,
        lenderName: lenderOffer.lenderName,
        creditLimit: lenderOffer.creditLimit,
        terms: lenderOffer.terms,
      },
      createdAt: new Date().toISOString(),
    }

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(applicationData),
      })

      const result = await response.json()

      if (result.success && result.data) {
        setSubmittedApplications((prev) => [...prev, result.data])
        setError(null)
        alert(`Successfully applied to ${lenderOffer.lenderName} for QAR ${lenderOffer.creditLimit.toLocaleString()}`)
      } else {
        setError(result.error || "Failed to submit application")
      }
    } catch (error) {
      console.error("Error submitting application:", error)
      setError("Failed to submit application")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button onClick={onBack} variant="outline" className="mr-4 bg-transparent">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Portal Selection
          </Button>
          <div className="flex items-center">
            <Building2 className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">MSME Portal</h1>
              <p className="text-gray-600">Apply for invoice discounting services</p>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => {
              resetForm()
              setShowOffers(false)
              setShowSubmittedApps(false)
            }}
            variant={!showOffers && !showSubmittedApps ? "default" : "outline"}
          >
            New Application
          </Button>
          <Button
            onClick={loadTestData}
            variant="outline"
            className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
          >
            <TestTube className="w-4 h-4 mr-2" />
            Load Sample Data
          </Button>
          {submittedApplications.length > 0 && (
            <Button
              onClick={() => {
                setShowSubmittedApps(true)
                setShowOffers(false)
              }}
              variant={showSubmittedApps ? "default" : "outline"}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Submitted Applications ({submittedApplications.length})
            </Button>
          )}
        </div>

        {/* Quick Help Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <TestTube className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">Quick Start Options</h4>
              <p className="text-xs text-blue-700">
                • <strong>New Application:</strong> Clears all fields for a fresh start<br/>
                • <strong>Load Sample Data:</strong> Fills the form with test data (Global Trading Solutions, QAR 100,000 monthly transactions, 710 credit score)<br/>
                • Use sample data to see how different credit scores and documents affect lender offers
              </p>
            </div>
          </div>
        </div>

        {/* Submitted Applications View */}
        {showSubmittedApps && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Your Submitted Applications</CardTitle>
              <CardDescription>Track your applications to different lenders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {submittedApplications.map((app, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{app.companyName}</h3>
                      <Badge variant="secondary">{app.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Lender:</span>
                        <p className="font-medium">{app.assignedLender?.lenderName || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Credit Limit:</span>
                        <p className="font-medium">QAR {app.assignedLender?.creditLimit?.toLocaleString() || "0"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Submitted:</span>
                        <p>{new Date(app.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Offers View */}
        {showOffers && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Available Lender Offers</CardTitle>
              <CardDescription>Choose from the following lenders based on your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availableOffers.length > 0 ? (
                  availableOffers.map((offer, index) => (
                    <div key={`${offer.lenderId}-${index}`} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold">{offer.lenderName}</h3>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">QAR {offer.creditLimit.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">Credit Limit</p>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 mb-3">{offer.terms}</p>

                      <div className="flex justify-end">
                        <Button
                          onClick={() => applyToLender(offer)}
                          disabled={submittedApplications.some(
                            (app) => app.assignedLender?.lenderId === offer.lenderId,
                          )}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          {submittedApplications.some((app) => app.assignedLender?.lenderId === offer.lenderId)
                            ? "Already Applied"
                            : "Apply to This Lender"}
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No lender offers available for your profile.</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Please ensure Commercial Registration is uploaded and try again.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-center">
                <Button onClick={() => setShowOffers(false)} variant="outline">
                  Back to Form
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Application Form */}
        {!showOffers && !showSubmittedApps && (
          <>
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={calculateOffers} className="space-y-6">
              {/* Company Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>Enter your company details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        value={formData.companyName}
                        onChange={(e) => handleInputChange("companyName", e.target.value)}
                        placeholder="Enter company name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactPerson">Contact Person *</Label>
                      <Input
                        id="contactPerson"
                        value={formData.contactPerson}
                        onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                        placeholder="Enter contact person name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="Enter email address"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Financial Information</CardTitle>
                  <CardDescription>Provide your financial details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="monthlyTransaction">Average Monthly Transaction (QAR)</Label>
                      <Input
                        id="monthlyTransaction"
                        type="number"
                        value={formData.monthlyTransaction}
                        onChange={(e) => handleInputChange("monthlyTransaction", e.target.value)}
                        placeholder="Enter monthly transaction amount"
                      />
                    </div>
                    <div>
                      <Label htmlFor="creditScore">Credit Score</Label>
                      <Input
                        id="creditScore"
                        type="number"
                        value={formData.creditScore}
                        onChange={(e) => handleInputChange("creditScore", e.target.value)}
                        placeholder="Enter credit score"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Document Upload */}
              <Card>
                <CardHeader>
                  <CardTitle>Document Upload</CardTitle>
                  <CardDescription>Upload required documents (Commercial Registration is mandatory)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {Object.entries(documentLabels).map(([key, label]) => (
                      <div key={key} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium">{label}</Label>
                          {documents[key] && <CheckCircle className="w-4 h-4 text-green-500" />}
                        </div>

                        {uploadedFiles[key] ? (
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <FileText className="w-4 h-4 mr-1" />
                              <span className="truncate" title={uploadedFiles[key].originalName}>
                                {uploadedFiles[key].originalName.length > 20
                                  ? `${uploadedFiles[key].originalName.substring(0, 20)}...`
                                  : uploadedFiles[key].originalName}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                {(uploadedFiles[key].size / 1024).toFixed(1)} KB
                              </span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeFile(key)}
                                className="h-6 w-6 p-0"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <input
                              type="file"
                              id={`file-${key}`}
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  handleFileUpload(key, file)
                                }
                              }}
                            />
                            <Label
                              htmlFor={`file-${key}`}
                              className="flex items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                            >
                              <div className="text-center">
                                <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                                <span className="text-xs text-gray-500">Click to upload</span>
                              </div>
                            </Label>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  size="lg"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Form
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  disabled={calculatingOffers}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {calculatingOffers ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Calculating Offers...
                    </>
                  ) : (
                    "Get Lender Offers"
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default MSMEPortal
