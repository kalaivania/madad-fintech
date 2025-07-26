const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  contactPerson: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  monthlyTransaction: {
    type: Number,
    default: 0
  },
  creditScore: {
    type: Number,
    default: 0
  },
  documents: {
    commercialRegistration: {
      type: Boolean,
      default: false
    },
    taxCertificate: {
      type: Boolean,
      default: false
    },
    bankStatement: {
      type: Boolean,
      default: false
    },
    auditedReport: {
      type: Boolean,
      default: false
    },
    tradeLicense: {
      type: Boolean,
      default: false
    },
    financialStatements: {
      type: Boolean,
      default: false
    }
  },
  uploadedFiles: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected'],
    default: 'pending'
  },
  assignedLender: {
    lenderId: String,
    lenderName: String,
    creditLimit: Number,
    terms: String
  }
}, {
  timestamps: true,
  collection: 'applications'
});

// Transform _id to id for JSON output
applicationSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Application', applicationSchema);
