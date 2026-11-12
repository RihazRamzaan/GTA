import mongoose from 'mongoose';
import { DEFAULT_MILESTONES, DEFAULT_AGENDA, DEFAULT_EVENT } from '../config/eventDefaults.js';
export { DEFAULT_MILESTONES } from '../config/eventDefaults.js';

const agendaSchema = new mongoose.Schema({
  id: { type: String, required: true }, title: { type: String, required: true },
  description: String, startsAt: Date, endsAt: Date, location: String, url: String,
  milestoneKey: String, published: { type: Boolean, default: true }, order: Number,
}, { _id: false });
const sponsorSchema = new mongoose.Schema({
  id: { type: String, required: true }, name: { type: String, required: true }, category: String,
  logoUrl: String, websiteUrl: String, published: { type: Boolean, default: false }, order: Number,
}, { _id: false });

const eventSettingsSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: 'current',
    },
    agenda: { type: [agendaSchema], default: undefined },
    sponsors: { type: [sponsorSchema], default: [] },
    event: {
      name: { type: String, default: DEFAULT_EVENT.name },
      venue: { type: String, default: DEFAULT_EVENT.venue },
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
      agenda: DEFAULT_AGENDA,
      registrationMode: 'auto',
      submissionMode: 'auto',
    });
  }
  // Extend old settings without replacing dates or gate overrides edited by admins.
  if (!settings.agenda) {
    settings.agenda = DEFAULT_AGENDA.map(entry => entry.id === 'finale'
      ? { ...entry, endsAt: new Date(new Date(settings.milestones.resultsAt).getTime() + 8 * 60 * 60 * 1000) }
      : entry);
    await settings.save();
  }
  return settings;
};

export default mongoose.model('EventSettings', eventSettingsSchema);
