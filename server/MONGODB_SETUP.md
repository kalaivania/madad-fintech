# MongoDB Atlas Migration Guide

This guide will help you migrate from JSON file storage to MongoDB Atlas for better scalability and data management.

## 🚀 Quick Setup with MongoDB Atlas (Recommended)

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Sign up for a free account
3. Create a new cluster (free tier is sufficient for development)

### Step 2: Setup Database Access
1. Go to "Database Access" in your Atlas dashboard
2. Click "Add New Database User"
3. Create a username and password
4. Set user privileges to "Read and write to any database"

### Step 3: Setup Network Access
1. Go to "Network Access" in your Atlas dashboard
2. Click "Add IP Address"
3. For development, you can add "0.0.0.0/0" (allows access from anywhere)
4. For production, add your specific IP addresses

### Step 4: Get Connection String
1. Go to "Clusters" and click "Connect"
2. Choose "Connect your application"
3. Copy the connection string

### Step 5: Configure Environment
1. Open `server/.env` file
2. Replace the MONGODB_URI with your Atlas connection string:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/msme-lender-platform?retryWrites=true&w=majority
```
3. Replace `<username>`, `<password>`, and `<cluster>` with your actual values

## 📦 Installation & Migration

### Install Dependencies (if not already done)
```bash
cd server
npm install
```

### Migrate Existing Data (if you have JSON files)
```bash
npm run migrate
```

### Start with MongoDB
```bash
npm run dev
```

## 🔧 Alternative: Local MongoDB Setup

If you prefer to use local MongoDB:

### Install MongoDB Community Edition
1. Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Install and start MongoDB service
3. Keep the default connection string in `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/msme-lender-platform
```

## 📊 Database Schema

### Lenders Collection
```javascript
{
  _id: "uuid-string",
  name: "Lender Name",
  isActive: true,
  isDefault: false,
  creditScore: {
    high: 725,
    medium: 700,
    multipliers: { high: 1.5, medium: 1.2, low: 0.9 }
  },
  documents: {
    all4: 1.25, any3: 1.1, any2: 1.05, onlyCR: 1.0
  },
  bankStatement: { available: 1.2, notAvailable: 1.0 },
  auditedReport: { available: 1.5, notAvailable: 1.0 },
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

### Applications Collection
```javascript
{
  _id: "uuid-string",
  companyName: "Company Name",
  contactPerson: "Contact Person",
  email: "email@example.com",
  phone: "+1234567890",
  monthlyTransaction: 100000,
  creditScore: 710,
  documents: {
    commercialRegistration: true,
    taxCertificate: true,
    // ... other documents
  },
  uploadedFiles: { /* file metadata */ },
  status: "pending",
  assignedLender: { /* lender assignment data */ },
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

## 🔄 Switching Between Storage Types

### Use MongoDB (default)
```bash
npm run dev
```

### Use JSON files (legacy)
```bash
npm run dev:json
```

## 🛠️ Troubleshooting

### Connection Issues
- Check your MongoDB Atlas IP whitelist
- Verify username/password in connection string
- Ensure your network allows connections to MongoDB

### Migration Issues
- Ensure old JSON files exist in `server/data/` directory
- Check console output for detailed error messages
- Verify MongoDB connection before migration

### Performance
- MongoDB Atlas free tier has limitations
- For production, consider upgrading to a paid tier
- Monitor your database usage in Atlas dashboard

## 🔐 Security Best Practices

1. **Never commit credentials**: Use environment variables
2. **IP Whitelisting**: Restrict database access to known IPs
3. **Strong passwords**: Use complex database user passwords
4. **Regular backups**: Atlas provides automatic backups
5. **Monitoring**: Enable Atlas monitoring and alerts

## 📈 Benefits of MongoDB Migration

- **Scalability**: Handle larger datasets efficiently
- **Performance**: Faster queries and indexing
- **Reliability**: Built-in replication and backups
- **Cloud Native**: No server maintenance required
- **Advanced Features**: Aggregation, indexing, full-text search
- **Professional**: Industry-standard database solution

## 💡 Next Steps

After successful migration:
1. Test all functionality thoroughly
2. Set up database monitoring
3. Configure backup strategies
4. Consider implementing data indexes for better performance
5. Monitor database usage and optimize queries

---

Need help? Check the [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/) or contact support.
