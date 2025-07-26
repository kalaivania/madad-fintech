# Default Lender Protection System

This system protects default lenders from accidental deletion while providing flexible management options.

## Features

### 🔒 Protection Mechanisms

1. **Deletion Protection**: Default lenders cannot be deleted via the API
2. **Clear Error Messages**: Users receive informative error messages when attempting to delete protected lenders
3. **Status Indicators**: API endpoints to check if a lender is deletable

### 📁 File-Based Configuration

- **Default Configuration**: `data/default-lenders.json` contains the master configuration
- **Automatic Loading**: System loads default lenders from JSON file on startup
- **Backup & Restore**: Built-in scripts for backing up and restoring configurations

### 🔄 Reset Functionality

- **Smart Reset**: Restores default lenders while preserving user-added lenders
- **Configuration Reload**: Reloads fresh configuration from JSON file during reset
- **Detailed Logging**: Comprehensive logging of reset operations

## API Endpoints

### Check Lender Protection Status
```
GET /api/lenders/:id/deletable
```
Returns whether a lender can be deleted and the reason if not.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "lender-id",
    "deletable": false,
    "reason": "Default lenders cannot be deleted. They are protected system lenders."
  }
}
```

### Get Lender with Protection Info
```
GET /api/lenders/:id
```
Returns lender data with protection status included.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "lender-id",
    "name": "Lender 1",
    "isDefault": true,
    "protection": {
      "isDeletable": false,
      "isEditable": true,
      "reason": "Default lender - protected from deletion"
    }
  }
}
```

### Delete Lender (Protected)
```
DELETE /api/lenders/:id
```
Attempts to delete a lender with proper protection checks.

**Error Response for Protected Lenders:**
```json
{
  "success": false,
  "error": "Cannot delete default lenders. Default lenders are protected to ensure system functionality. Use the reset function to restore default lenders if needed.",
  "code": "LENDER_PROTECTED"
}
```

### Reset to Default Configuration
```
POST /api/lenders/reset
```
Resets default lenders to the configuration in `default-lenders.json` while preserving user-added lenders.

**Response:**
```json
{
  "success": true,
  "data": [...],
  "message": "Successfully reset to default configuration. Restored 4 default lenders and preserved 2 user-added lenders."
}
```

## Management Scripts

### Backup Current Default Lenders
```bash
npm run backup-defaults
```
Creates a timestamped backup of current default lenders and updates the main configuration file.

### Restore Default Lenders
```bash
npm run restore-defaults
```
Restores default lenders from the configuration file, preserving user-added lenders.

### Validate Configuration File
```bash
npm run validate-defaults
```
Validates the structure and content of the default lenders configuration file.

## File Structure

```
server/
├── data/
│   ├── default-lenders.json              # Master configuration
│   └── default-lenders-backup-*.json     # Timestamped backups
├── lib/
│   └── mongo-data-storage.js             # Enhanced storage with protection
├── routes/
│   └── lenders.js                        # Protected API endpoints
└── manage-default-lenders.js             # Management script
```

## Configuration File Format

```json
{
  "version": "1.0",
  "description": "Default lenders configuration for MSME Lender Platform",
  "lastUpdated": "2025-01-26T00:00:00.000Z",
  "lenders": [
    {
      "_id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Lender 1",
      "isActive": true,
      "isDefault": true,
      "creditScore": {
        "high": 725,
        "medium": 700,
        "multipliers": {
          "high": 1.5,
          "medium": 1.2,
          "low": 0.9
        }
      },
      "documents": {
        "all4": 1.25,
        "any3": 1.1,
        "any2": 1.05,
        "onlyCR": 1.0
      },
      "bankStatement": {
        "available": 1.2,
        "notAvailable": 1.0
      },
      "auditedReport": {
        "available": 1.5,
        "notAvailable": 1.0
      }
    }
  ]
}
```

## Error Codes

- `LENDER_PROTECTED`: Attempting to delete a protected default lender
- `LENDER_NOT_FOUND`: Lender ID does not exist
- `INVALID_CONFIGURATION`: Configuration file format is invalid

## Best Practices

1. **Regular Backups**: Use `npm run backup-defaults` before making changes
2. **Validate Changes**: Always run `npm run validate-defaults` after editing configuration
3. **Test Reset**: Test the reset functionality in development before deploying changes
4. **Monitor Logs**: Check server logs for detailed information about protection actions

## Security Features

- Default lenders are marked with `isDefault: true` in the database
- Multiple validation layers prevent accidental deletion
- User-added lenders are preserved during reset operations
- Configuration file validation ensures data integrity
