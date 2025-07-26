"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Building2, Banknote } from "lucide-react"

const PortalSelector = ({ onSelect }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Madad FinTech Platform</h1>
          <p className="text-xl text-gray-600">MSME Invoice Discounting - Qatar Financial Marketplace</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">MSME Portal</CardTitle>
              <CardDescription className="text-lg">
                Submit invoice discounting applications and track status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li>• Submit new applications</li>
                <li>• Upload required documents</li>
                <li>• Track application status</li>
                <li>• View lender matches</li>
              </ul>
              <Button onClick={() => onSelect("msme")} className="w-full" size="lg">
                Access MSME Portal
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                <Banknote className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Lender Portal</CardTitle>
              <CardDescription className="text-lg">
                Manage applications and configure lending preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li>• Review applications</li>
                <li>• Configure preferences</li>
                <li>• Manage lender profiles</li>
                <li>• Download reports</li>
              </ul>
              <Button onClick={() => onSelect("lender")} className="w-full" size="lg">
                Access Lender Portal
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default PortalSelector
