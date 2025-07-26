"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Badge } from "./ui/badge"
import { ConfirmDialog } from "./ui/confirm-dialog"
import {
  ArrowLeft,
  Settings,
  FileText,
  Plus,
  Building2,
  Edit,
  Trash2,
  RotateCcw,
  Download,
  Archive,
  AlertCircle,
} from "lucide-react"

function LenderPortal({ onBack }) {
  const [lenders, setLenders] = useState([])
  const [applications, setApplications] = useState([])
  const [archives, setArchives] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingLender, setEditingLender] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, type: '', lenderId: null })
  const [newLender, setNewLender] = useState({
    name: "",
    creditScore: {
      high: 725,
      medium: 700,
      multipliers: { high: 1.5, medium: 1.2, low: 0.9 },
    },
    documents: { all4: 1.25, any3: 1.1, any2: 1.05, onlyCR: 1.0 },
    bankStatement: { available: 1.2, notAvailable: 1.0 },
    auditedReport: { available: 1.5, notAvailable: 1.0 },
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch lenders
      const lendersResponse = await fetch("/api/lenders")
      const lendersResult = await lendersResponse.json()
      if (lendersResult.success) {
        setLenders(lendersResult.data || [])
      }

      // Fetch applications
      const appsResponse = await fetch("/api/applications")
      const appsResult = await appsResponse.json()
      if (appsResult.success) {
        setApplications(appsResult.data || [])
      }

      // Fetch archives
      const archivesResponse = await fetch("/api/archives")
      const archivesResult = await archivesResponse.json()
      if (archivesResult.success) {
        setArchives(archivesResult.data || [])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const handleAddLender = async () => {
    if (!newLender.name) return

    try {
      const response = await fetch("/api/lenders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newLender),
      })

      const result = await response.json()
      if (result.success) {
        setLenders((prev) => [...prev, result.data])
        setShowAddForm(false)
        setNewLender({
          name: "",
          creditScore: {
            high: 725,
            medium: 700,
            multipliers: { high: 1.5, medium: 1.2, low: 0.9 },
          },
          documents: { all4: 1.25, any3: 1.1, any2: 1.05, onlyCR: 1.0 },
          bankStatement: { available: 1.2, notAvailable: 1.0 },
          auditedReport: { available: 1.5, notAvailable: 1.0 },
        })
      }
    } catch (error) {
      console.error("Error adding lender:", error)
      setError("Failed to add lender")
    }
  }

  const handleEditLender = async () => {
    if (!editingLender) return

    try {
      const response = await fetch(`/api/lenders/${editingLender.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingLender),
      })

      const result = await response.json()
      if (result.success) {
        setLenders((prev) => prev.map((l) => (l.id === editingLender.id ? result.data : l)))
        setEditingLender(null)
      }
    } catch (error) {
      console.error("Error updating lender:", error)
      setError("Failed to update lender")
    }
  }

  const handleDeleteLender = async (id) => {
    // Find the lender to check if it's a default lender
    const lender = lenders.find(l => l.id === id)
    
    // Prevent deletion of default lenders
    if (lender?.isDefault) {
      setError("Default lenders cannot be deleted. They are protected system lenders.")
      return
    }
    
    setConfirmDialog({ 
      isOpen: true, 
      type: 'delete', 
      lenderId: id 
    })
  }

  const confirmDeleteLender = async () => {
    const { lenderId } = confirmDialog
    setConfirmDialog({ isOpen: false, type: '', lenderId: null })

    try {
      const response = await fetch(`/api/lenders/${lenderId}`, {
        method: "DELETE",
      })

      const result = await response.json()
      if (result.success) {
        setLenders((prev) => prev.filter((l) => l.id !== lenderId))
      }
    } catch (error) {
      console.error("Error deleting lender:", error)
      setError("Failed to delete lender")
    }
  }

  const handleResetLenders = async () => {
    setConfirmDialog({ 
      isOpen: true, 
      type: 'reset', 
      lenderId: null 
    })
  }

  const confirmResetLenders = async () => {
    setConfirmDialog({ isOpen: false, type: '', lenderId: null })

    try {
      const response = await fetch("/api/lenders/reset", {
        method: "POST",
      })

      const result = await response.json()
      if (result.success) {
        setLenders(result.data || [])
      }
    } catch (error) {
      console.error("Error resetting lenders:", error)
      setError("Failed to reset lenders")
    }
  }

  const downloadArchive = async (filename) => {
    try {
      const response = await fetch(`/api/archives/download/${filename}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.style.display = "none"
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Error downloading archive:", error)
    }
  }

  const formatDate = (date) => {
    if (!date) return "N/A"
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date
      if (isNaN(dateObj.getTime())) return "Invalid Date"
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(dateObj)
    } catch (error) {
      return "Invalid Date"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lender portal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button onClick={onBack} variant="outline" className="mr-4 bg-transparent">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Portal Selection
          </Button>
          <div className="flex items-center">
            <Building2 className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Lender Portal</h1>
              <p className="text-gray-600">Manage applications, algorithms, and lender configurations</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 border-red-200 bg-red-50 p-4 rounded-lg flex items-center">
            <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white">
            <TabsTrigger value="applications" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Applications
            </TabsTrigger>
            <TabsTrigger value="algorithm" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Algorithm
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Manage Lenders
            </TabsTrigger>
            <TabsTrigger value="archives" className="flex items-center gap-2">
              <Archive className="w-4 h-4" />
              Archives
            </TabsTrigger>
          </TabsList>

          {/* Applications Tab */}
          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>MSME Applications</CardTitle>
                <CardDescription>Review and manage submitted applications</CardDescription>
              </CardHeader>
              <CardContent>
                {applications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p>No applications submitted yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3">
                            Company
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Contact
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Monthly Transaction
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Credit Score
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Assigned Lender
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Credit Limit
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Submitted
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {applications.map((app) => (
                          <tr key={app.id} className="bg-white border-b hover:bg-gray-50">
                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                              {app.companyName}
                            </th>
                            <td className="px-6 py-4">
                              <div className="text-sm">
                                <div className="font-medium">{app.contactPerson}</div>
                                <div className="text-gray-500">{app.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium">
                              QAR {app.monthlyTransaction?.toLocaleString() || "N/A"}
                            </td>
                            <td className="px-6 py-4 font-medium">{app.creditScore || "N/A"}</td>
                            <td className="px-6 py-4">
                              <Badge
                                variant={
                                  app.status === "approved"
                                    ? "default"
                                    : app.status === "under_review"
                                      ? "secondary"
                                      : app.status === "rejected"
                                        ? "destructive"
                                        : "outline"
                                }
                              >
                                {app.status?.replace("_", " ").toUpperCase() || "PENDING"}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              {app.assignedLender ? (
                                <div className="text-sm">
                                  <div className="font-medium">{app.assignedLender.lenderName}</div>
                                </div>
                              ) : (
                                <span className="text-gray-400">Not assigned</span>
                              )}
                            </td>
                            <td className="px-6 py-4 font-medium">
                              {app.assignedLender ? (
                                <span className="text-green-600">
                                  QAR {app.assignedLender.creditLimit?.toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">{formatDate(app.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Algorithm Tab */}
          <TabsContent value="algorithm">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Algorithm Overview</CardTitle>
                  <CardDescription>How the credit limit calculation works</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Base Calculation</h4>
                    <p className="text-sm text-gray-600">Credit Limit = Monthly Transaction × Multipliers</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Example Calculation</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Monthly Transaction: QAR 100,000</p>
                      <p>Credit Score 710 (Lender 1): 1.2x</p>
                      <p>All 4 Documents: 1.25x</p>
                      <p>Bank Statement Available: 1.2x</p>
                      <p>Audited Report Available: 1.5x</p>
                      <p className="font-semibold text-green-600">
                        Result: QAR 100,000 × 1.2 × 1.25 × 1.2 × 1.5 = QAR 270,000
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Current Lender Criteria</CardTitle>
                  <CardDescription>Active lending parameters</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {lenders.map((lender) => (
                      <div key={lender.id} className="border rounded-lg p-3">
                        <h4 className="font-semibold text-sm">{lender.name}</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mt-2">
                          <div>High Credit: {lender.creditScore?.high || "N/A"}+</div>
                          <div>Medium Credit: {lender.creditScore?.medium || "N/A"}+</div>
                          <div>High Multiplier: {lender.creditScore?.multipliers?.high || "N/A"}x</div>
                          <div>Medium Multiplier: {lender.creditScore?.multipliers?.medium || "N/A"}x</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Manage Lenders Tab */}
          <TabsContent value="manage">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Manage Lenders</h2>
                  <p className="text-gray-600">Configure lender criteria and parameters</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleResetLenders} variant="outline" className="bg-white">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset to Default Lender Data
                  </Button>
                  <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Lender
                  </Button>
                </div>
              </div>

              {/* Lenders List */}
              <div className="grid gap-4">
                {lenders.map((lender) => (
                  <Card key={lender.id}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{lender.name}</CardTitle>
                          {lender.isDefault && (
                            <Badge variant="secondary" className="text-xs">
                              Default
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => setEditingLender(lender)} 
                            variant="outline" 
                            size="sm"
                            title="Edit this lender"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteLender(lender.id)}
                            variant="outline"
                            size="sm"
                            className={`${
                              lender.isDefault 
                                ? 'text-gray-400 cursor-not-allowed' 
                                : 'text-red-600 hover:text-red-700'
                            }`}
                            disabled={lender.isDefault}
                            title={
                              lender.isDefault 
                                ? 'Default lenders cannot be deleted. They are protected system lenders.' 
                                : 'Delete this lender'
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="font-medium">Credit Score Thresholds</div>
                          <div>High: {lender.creditScore?.high || "N/A"}+</div>
                          <div>Medium: {lender.creditScore?.medium || "N/A"}+</div>
                        </div>
                        <div>
                          <div className="font-medium">Credit Multipliers</div>
                          <div>High: {lender.creditScore?.multipliers?.high || "N/A"}x</div>
                          <div>Medium: {lender.creditScore?.multipliers?.medium || "N/A"}x</div>
                          <div>Low: {lender.creditScore?.multipliers?.low || "N/A"}x</div>
                        </div>
                        <div>
                          <div className="font-medium">Document Multipliers</div>
                          <div>All 4: {lender.documents?.all4 || "N/A"}x</div>
                          <div>Any 3: {lender.documents?.any3 || "N/A"}x</div>
                          <div>Any 2: {lender.documents?.any2 || "N/A"}x</div>
                          <div>Only CR: {lender.documents?.onlyCR || "N/A"}x</div>
                        </div>
                        <div>
                          <div className="font-medium">Additional Multipliers</div>
                          <div>Bank Statement: {lender.bankStatement?.available || "N/A"}x</div>
                          <div>Audited Report: {lender.auditedReport?.available || "N/A"}x</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Archives Tab */}
          <TabsContent value="archives">
            <Card>
              <CardHeader>
                <CardTitle>Document Archives</CardTitle>
                <CardDescription>Download application document packages</CardDescription>
              </CardHeader>
              <CardContent>
                {archives.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p>No archived documents yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {archives.map((filename) => (
                      <div key={filename} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center">
                          <Archive className="w-4 h-4 text-blue-500 mr-3" />
                          <div>
                            <div className="font-medium">{filename}</div>
                            <div className="text-sm text-gray-500">
                              Company: {filename.split("_")[0]?.replace(/_/g, " ")}
                            </div>
                          </div>
                        </div>
                        <Button onClick={() => downloadArchive(filename)} variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Lender Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Add New Lender</CardTitle>
              <CardDescription>Configure a new lender with credit scoring parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Lender Name</label>
                  <input
                    type="text"
                    value={newLender.name}
                    onChange={(e) => setNewLender(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter lender name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">High Credit Score Threshold</label>
                    <input
                      type="number"
                      value={newLender.creditScore.high}
                      onChange={(e) => setNewLender(prev => ({
                        ...prev,
                        creditScore: { ...prev.creditScore, high: parseInt(e.target.value) }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Medium Credit Score Threshold</label>
                    <input
                      type="number"
                      value={newLender.creditScore.medium}
                      onChange={(e) => setNewLender(prev => ({
                        ...prev,
                        creditScore: { ...prev.creditScore, medium: parseInt(e.target.value) }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Credit Score Multipliers</label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">High</label>
                      <input
                        type="number"
                        step="0.1"
                        value={newLender.creditScore.multipliers.high}
                        onChange={(e) => setNewLender(prev => ({
                          ...prev,
                          creditScore: {
                            ...prev.creditScore,
                            multipliers: { ...prev.creditScore.multipliers, high: parseFloat(e.target.value) }
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Medium</label>
                      <input
                        type="number"
                        step="0.1"
                        value={newLender.creditScore.multipliers.medium}
                        onChange={(e) => setNewLender(prev => ({
                          ...prev,
                          creditScore: {
                            ...prev.creditScore,
                            multipliers: { ...prev.creditScore.multipliers, medium: parseFloat(e.target.value) }
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Low</label>
                      <input
                        type="number"
                        step="0.1"
                        value={newLender.creditScore.multipliers.low}
                        onChange={(e) => setNewLender(prev => ({
                          ...prev,
                          creditScore: {
                            ...prev.creditScore,
                            multipliers: { ...prev.creditScore.multipliers, low: parseFloat(e.target.value) }
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Document Multipliers</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">All 4 Documents</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newLender.documents.all4}
                        onChange={(e) => setNewLender(prev => ({
                          ...prev,
                          documents: { ...prev.documents, all4: parseFloat(e.target.value) }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Any 3 Documents</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newLender.documents.any3}
                        onChange={(e) => setNewLender(prev => ({
                          ...prev,
                          documents: { ...prev.documents, any3: parseFloat(e.target.value) }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Any 2 Documents</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newLender.documents.any2}
                        onChange={(e) => setNewLender(prev => ({
                          ...prev,
                          documents: { ...prev.documents, any2: parseFloat(e.target.value) }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Only Commercial Registration</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newLender.documents.onlyCR}
                        onChange={(e) => setNewLender(prev => ({
                          ...prev,
                          documents: { ...prev.documents, onlyCR: parseFloat(e.target.value) }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Bank Statement Multipliers</label>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Available</label>
                        <input
                          type="number"
                          step="0.01"
                          value={newLender.bankStatement.available}
                          onChange={(e) => setNewLender(prev => ({
                            ...prev,
                            bankStatement: { ...prev.bankStatement, available: parseFloat(e.target.value) }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Not Available</label>
                        <input
                          type="number"
                          step="0.01"
                          value={newLender.bankStatement.notAvailable}
                          onChange={(e) => setNewLender(prev => ({
                            ...prev,
                            bankStatement: { ...prev.bankStatement, notAvailable: parseFloat(e.target.value) }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Audited Report Multipliers</label>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Available</label>
                        <input
                          type="number"
                          step="0.01"
                          value={newLender.auditedReport.available}
                          onChange={(e) => setNewLender(prev => ({
                            ...prev,
                            auditedReport: { ...prev.auditedReport, available: parseFloat(e.target.value) }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Not Available</label>
                        <input
                          type="number"
                          step="0.01"
                          value={newLender.auditedReport.notAvailable}
                          onChange={(e) => setNewLender(prev => ({
                            ...prev,
                            auditedReport: { ...prev.auditedReport, notAvailable: parseFloat(e.target.value) }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowAddForm(false)
                      setNewLender({
                        name: "",
                        creditScore: {
                          high: 725,
                          medium: 700,
                          multipliers: { high: 1.5, medium: 1.2, low: 0.9 },
                        },
                        documents: { all4: 1.25, any3: 1.1, any2: 1.05, onlyCR: 1.0 },
                        bankStatement: { available: 1.2, notAvailable: 1.0 },
                        auditedReport: { available: 1.5, notAvailable: 1.0 },
                      })
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddLender} className="bg-blue-600 hover:bg-blue-700">
                    Create Lender
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Lender Form */}
      {editingLender && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Edit Lender</CardTitle>
              <CardDescription>Modify lender configuration and scoring parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Lender Name</label>
                  <input
                    type="text"
                    value={editingLender.name}
                    onChange={(e) => setEditingLender(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter lender name"
                  />
                </div>

                {/* Credit Score Configuration */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Credit Score Configuration</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">High Credit Threshold</label>
                      <input
                        type="number"
                        value={editingLender.creditScore?.high || 725}
                        onChange={(e) => setEditingLender(prev => ({
                          ...prev,
                          creditScore: {
                            ...prev.creditScore,
                            high: parseInt(e.target.value)
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Medium Credit Threshold</label>
                      <input
                        type="number"
                        value={editingLender.creditScore?.medium || 700}
                        onChange={(e) => setEditingLender(prev => ({
                          ...prev,
                          creditScore: {
                            ...prev.creditScore,
                            medium: parseInt(e.target.value)
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <h4 className="text-md font-medium mt-4 mb-2">Credit Score Multipliers</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">High Multiplier</label>
                      <input
                        type="number"
                        step="0.1"
                        value={editingLender.creditScore?.multipliers?.high || 1.5}
                        onChange={(e) => setEditingLender(prev => ({
                          ...prev,
                          creditScore: {
                            ...prev.creditScore,
                            multipliers: {
                              ...prev.creditScore?.multipliers,
                              high: parseFloat(e.target.value)
                            }
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Medium Multiplier</label>
                      <input
                        type="number"
                        step="0.1"
                        value={editingLender.creditScore?.multipliers?.medium || 1.2}
                        onChange={(e) => setEditingLender(prev => ({
                          ...prev,
                          creditScore: {
                            ...prev.creditScore,
                            multipliers: {
                              ...prev.creditScore?.multipliers,
                              medium: parseFloat(e.target.value)
                            }
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Low Multiplier</label>
                      <input
                        type="number"
                        step="0.1"
                        value={editingLender.creditScore?.multipliers?.low || 0.9}
                        onChange={(e) => setEditingLender(prev => ({
                          ...prev,
                          creditScore: {
                            ...prev.creditScore,
                            multipliers: {
                              ...prev.creditScore?.multipliers,
                              low: parseFloat(e.target.value)
                            }
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>

                {/* Document Multipliers */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Document Multipliers</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">All 4 Documents</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingLender.documents?.all4 || 1.25}
                        onChange={(e) => setEditingLender(prev => ({
                          ...prev,
                          documents: {
                            ...prev.documents,
                            all4: parseFloat(e.target.value)
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Any 3 Documents</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingLender.documents?.any3 || 1.1}
                        onChange={(e) => setEditingLender(prev => ({
                          ...prev,
                          documents: {
                            ...prev.documents,
                            any3: parseFloat(e.target.value)
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Any 2 Documents</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingLender.documents?.any2 || 1.05}
                        onChange={(e) => setEditingLender(prev => ({
                          ...prev,
                          documents: {
                            ...prev.documents,
                            any2: parseFloat(e.target.value)
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Only Commercial Registration</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingLender.documents?.onlyCR || 1.0}
                        onChange={(e) => setEditingLender(prev => ({
                          ...prev,
                          documents: {
                            ...prev.documents,
                            onlyCR: parseFloat(e.target.value)
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>

                {/* Bank Statement & Audited Report Multipliers */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Additional Document Multipliers</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-md font-medium mb-2">Bank Statement</h4>
                      <div className="space-y-2">
                        <div>
                          <label className="block text-sm font-medium mb-1">Available</label>
                          <input
                            type="number"
                            step="0.01"
                            value={editingLender.bankStatement?.available || 1.2}
                            onChange={(e) => setEditingLender(prev => ({
                              ...prev,
                              bankStatement: {
                                ...prev.bankStatement,
                                available: parseFloat(e.target.value)
                              }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Not Available</label>
                          <input
                            type="number"
                            step="0.01"
                            value={editingLender.bankStatement?.notAvailable || 1.0}
                            onChange={(e) => setEditingLender(prev => ({
                              ...prev,
                              bankStatement: {
                                ...prev.bankStatement,
                                notAvailable: parseFloat(e.target.value)
                              }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-md font-medium mb-2">Audited Report</h4>
                      <div className="space-y-2">
                        <div>
                          <label className="block text-sm font-medium mb-1">Available</label>
                          <input
                            type="number"
                            step="0.01"
                            value={editingLender.auditedReport?.available || 1.5}
                            onChange={(e) => setEditingLender(prev => ({
                              ...prev,
                              auditedReport: {
                                ...prev.auditedReport,
                                available: parseFloat(e.target.value)
                              }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Not Available</label>
                          <input
                            type="number"
                            step="0.01"
                            value={editingLender.auditedReport?.notAvailable || 1.0}
                            onChange={(e) => setEditingLender(prev => ({
                              ...prev,
                              auditedReport: {
                                ...prev.auditedReport,
                                notAvailable: parseFloat(e.target.value)
                              }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setEditingLender(null)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleEditLender} className="bg-blue-600 hover:bg-blue-700">
                    Update Lender
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <ConfirmDialog
        key={`confirm-${confirmDialog.type}-${confirmDialog.lenderId}`}
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, type: '', lenderId: null })}
        onConfirm={confirmDialog.type === 'delete' ? confirmDeleteLender : confirmResetLenders}
        title={confirmDialog.type === 'delete' ? "Delete Lender" : "Reset Lenders"}
        description={
          confirmDialog.type === 'delete' 
            ? "Are you sure you want to delete this lender? This action cannot be undone."
            : "Are you sure you want to reset all lenders to default values? This will overwrite all current lender configurations."
        }
        confirmText={confirmDialog.type === 'delete' ? "Delete" : "Reset"}
        variant="destructive"
      />
    </div>
  )
}

export default LenderPortal
