import mongoose from 'mongoose';

export const DEFAULT_MILESTONES = {
  registrationOpensAt: new Date('2026-11-05T00:00:00.000Z'),
  registrationClosesAt: new Date('2026-11-15T23:59:59.000Z'),
  buildingStartsAt: new Date('2026-11-16T09:00:00.000Z'),
  submissionOpensAt: new Date('2026-11-27T12:00:00.000Z'),
  submissionClosesAt: new Date('2026-12-10T18:00:00.000Z'),
  resultsAt: new Date('2026-12-15T15:00:00.000Z'),
};

const eventSettingsSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: 'current',
    },
    milestones: {
      registrationOpensAt: {
        type: Date,
        default: DEFAULT_MILESTONES.registrationOpensAt,
      },
      registrationClosesAt: {
        type: Date,
        default: DEFAULT_MILESTONES.registrationClosesAt,
      },
      buildingStartsAt: {
        type: Date,
        default: DEFAULT_MILESTONES.buildingStartsAt,
      },
      submissionOpensAt: {
        type: Date,
        default: DEFAULT_MILESTONES.submissionOpensAt,
      },
      submissionClosesAt: {
        type: Date,
        default: DEFAULT_MILESTONES.submissionClosesAt,
      },
      resultsAt: {
        type: Date,
        default: DEFAULT_MILESTONES.resultsAt,
      },
    },
    registrationMode: {
      type: String,
      enum: ['auto', 'force_open', 'force_closed'],
      default: 'auto',
    },
    submissionMode: {
      type: String,
      enum: ['auto', 'force_open', 'force_closed'],
      default: 'auto',
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Retrieves the singleton event settings document with _id = 'current'.
 * If it doesn't exist yet, creates it with default milestones and 'auto' modes.
 */
eventSettingsSchema.statics.getOrCreateSingleton = async function () {
  let settings = await this.findById('current');
  if (!settings) {
    settings = await this.create({
      _id: 'current',
      milestones: DEFAULT_MILESTONES,
      registrationMode: 'auto',
      submissionMode: 'auto',
    });
  }
  return settings;
};

export default mongoose.model('EventSettings', eventSettingsSchema);
