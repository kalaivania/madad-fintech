const mongoose = require('mongoose');

const lenderSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  creditScore: {
    high: {
      type: Number,
      required: true
    },
    medium: {
      type: Number,
      required: true
    },
    multipliers: {
      high: {
        type: Number,
        required: true
      },
      medium: {
        type: Number,
        required: true
      },
      low: {
        type: Number,
        required: true
      }
    }
  },
  documents: {
    all4: {
      type: Number,
      required: true
    },
    any3: {
      type: Number,
      required: true
    },
    any2: {
      type: Number,
      required: true
    },
    onlyCR: {
      type: Number,
      required: true
    }
  },
  bankStatement: {
    available: {
      type: Number,
      required: true
    },
    notAvailable: {
      type: Number,
      required: true
    }
  },
  auditedReport: {
    available: {
      type: Number,
      required: true
    },
    notAvailable: {
      type: Number,
      required: true
    }
  }
}, {
  timestamps: true,
  collection: 'lenders'
});

// Use _id as the primary key (will be the UUID)
lenderSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Lender', lenderSchema);
