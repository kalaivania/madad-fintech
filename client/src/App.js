"use client"

import { useState } from "react"
import PortalSelector from "./components/PortalSelector"
import MSMEPortal from "./components/MSMEPortal"
import LenderPortal from "./components/LenderPortal"

function App() {
  const [selectedPortal, setSelectedPortal] = useState(null)

  const renderPortal = () => {
    switch (selectedPortal) {
      case "msme":
        return <MSMEPortal onBack={() => setSelectedPortal(null)} />
      case "lender":
        return <LenderPortal onBack={() => setSelectedPortal(null)} />
      default:
        return <PortalSelector onSelect={setSelectedPortal} />
    }
  }

  return <div className="min-h-screen bg-gray-50">{renderPortal()}</div>
}

export default App
