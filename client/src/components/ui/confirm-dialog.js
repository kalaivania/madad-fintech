import React from "react"
import { Button } from "./button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card"

export function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  description = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "destructive"
}) {
  // React hooks must be called BEFORE any early returns
  const handleClose = React.useCallback(() => {
    if (onClose) onClose()
  }, [onClose])

  const handleConfirm = React.useCallback(() => {
    if (onConfirm) onConfirm()
  }, [onConfirm])

  const handleOverlayClick = React.useCallback((e) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }, [handleClose])

  // Early return AFTER all hooks
  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleClose}>
              {cancelText}
            </Button>
            <Button variant={variant} onClick={handleConfirm}>
              {confirmText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
