function calculateLenderAssignment(application, lenders) {
  // Log incoming lenders to debug duplicates
  console.log("=== LENDER CALCULATION DEBUG ===")
  console.log("Total lenders received:", lenders.length)
  console.log("Lender IDs:", lenders.map(l => `${l.id} (${l.name})`))
  
  // Check for duplicate IDs
  const lenderIds = lenders.map(l => l.id)
  const uniqueIds = [...new Set(lenderIds)]
  if (lenderIds.length !== uniqueIds.length) {
    console.log("⚠️  DUPLICATE LENDER IDS DETECTED!")
    console.log("All IDs:", lenderIds)
    console.log("Unique IDs:", uniqueIds)
  }
  
  const scores = lenders
    .filter(lender => lender.isActive)
    .map((lender) => {
      let score = 0
      const reasons = []
      let multiplier = 1.0

      // Credit score evaluation (40% weight)
      const creditScore = application.creditScore || 650
      if (creditScore >= lender.creditScore.high) {
        score += 40
        multiplier *= lender.creditScore.multipliers.high
        reasons.push(`High credit score (${creditScore})`)
      } else if (creditScore >= lender.creditScore.medium) {
        score += 25
        multiplier *= lender.creditScore.multipliers.medium
        reasons.push(`Medium credit score (${creditScore})`)
      } else {
        score += 10
        multiplier *= lender.creditScore.multipliers.low
        reasons.push(`Low credit score (${creditScore})`)
      }

      // Document completeness (25% weight) - Only count the 4 required documents
      // Required docs: CR, Trade License, Estd Certificate (taxCertificate), Tax Card (financialStatements)
      const docs = application.documents || {}
      let docCount = 0
      if (docs.commercialRegistration) docCount++ // A. CR (mandatory)
      if (docs.tradeLicense) docCount++           // B. Trade License  
      if (docs.taxCertificate) docCount++         // C. Estd Certificate
      if (docs.financialStatements) docCount++   // D. Tax Card

      if (docCount === 4) {
        score += 25
        multiplier *= lender.documents.all4
        reasons.push("All 4 required documents provided")
      } else if (docCount === 3) {
        score += 20
        multiplier *= lender.documents.any3
        reasons.push("3 required documents provided")
      } else if (docCount === 2) {
        score += 15
        multiplier *= lender.documents.any2
        reasons.push("2 required documents provided")
      } else {
        score += 5
        multiplier *= lender.documents.onlyCR
        reasons.push("Only CR provided")
      }

      // Bank statements availability (20% weight)
      if (docs.bankStatement) { // Match frontend field name
        score += 20
        multiplier *= lender.bankStatement.available
        reasons.push("Bank statements available")
      } else {
        score += 5
        multiplier *= lender.bankStatement.notAvailable
        reasons.push("No bank statements")
      }

      // Audited reports availability (15% weight)
      if (docs.auditedReport) { // Match frontend field name
        score += 15
        multiplier *= lender.auditedReport.available
        reasons.push("Audited reports available")
      } else {
        multiplier *= lender.auditedReport.notAvailable
      }

      const finalScore = score * multiplier
      
      // Credit Limit = Monthly Transaction × All Multipliers (as per specification)
      const monthlyTransaction = parseFloat(application.monthlyTransaction) || 50000
      const creditLimit = Math.round(monthlyTransaction * multiplier)

      return {
        lenderId: lender.id,
        lenderName: lender.name,
        score: Math.round(finalScore * 100) / 100,
        reasons,
        maxAmount: creditLimit, // Keep for backward compatibility
        multiplier: Math.round(multiplier * 100) / 100,
        // Add frontend-expected fields
        creditLimit: creditLimit,
        terms: `Credit limit: QAR ${creditLimit.toLocaleString()}, Multiplier: ${Math.round(multiplier * 100) / 100}x`
      }
    })

  const finalResults = scores
    .filter((score) => score.score > 10) // Lower minimum score threshold
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    
  console.log("=== FINAL RESULTS ===")
  console.log("Results count:", finalResults.length)
  console.log("Result lender IDs:", finalResults.map(r => `${r.lenderId} (${r.lenderName})`))
  
  // Check for duplicate result IDs
  const resultIds = finalResults.map(r => r.lenderId)
  const uniqueResultIds = [...new Set(resultIds)]
  if (resultIds.length !== uniqueResultIds.length) {
    console.log("⚠️  DUPLICATE RESULT IDS DETECTED!")
    console.log("All result IDs:", resultIds)
  }
  console.log("=== END DEBUG ===")
  
  return finalResults
}

function calculateRiskScore(application) {
  let risk = 50 // Base risk

  // Company age factor
  const companyAge = Number.parseInt(application.companyAge) || 0
  if (companyAge > 5) risk -= 10
  else if (companyAge < 2) risk += 15

  // Annual revenue factor
  const revenue = Number.parseFloat(application.annualRevenue) || 0
  if (revenue > 1000000) risk -= 15
  else if (revenue < 100000) risk += 20

  // Invoice amount vs revenue ratio
  const invoiceAmount = Number.parseFloat(application.invoiceAmount) || 0
  const ratio = revenue > 0 ? invoiceAmount / revenue : 1
  if (ratio > 0.5) risk += 25
  else if (ratio < 0.1) risk -= 10

  return Math.max(0, Math.min(100, risk))
}

module.exports = {
  calculateLenderAssignment,
  calculateRiskScore,
}
