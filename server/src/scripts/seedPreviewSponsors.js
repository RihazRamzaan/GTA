// Adds clearly labeled design placeholders, preserving existing sponsors and edits.
import mongoose from 'mongoose';
import { connectDatabase } from '../config/db.js';
import { env } from '../config/env.js';
import EventSettings from '../models/EventSettings.js';

const sponsors = ['Title', 'Gold', 'Silver', 'Community'].map((category, order) => ({
  id: `preview-${category.toLowerCase()}`,
  name: `Demo ${category} Partner (placeholder)`,
  category: `${category} Partner · Preview`,
  logoUrl: new URL(`/demo-sponsors/${category.toLowerCase()}.svg`, env.clientOrigin).href,
  websiteUrl: '',
  published: true,
  order: 100 + order,
}));

try {
  await connectDatabase();
  if (!await EventSettings.exists({ _id: 'current' })) throw new Error('Event settings must exist before adding preview sponsors.');
  let added = 0;
  for (const sponsor of sponsors) {
    const result = await EventSettings.updateOne(
      { _id: 'current', 'sponsors.id': { $ne: sponsor.id } },
      { $push: { sponsors: sponsor } },
      { runValidators: true },
    );
    added += result.modifiedCount;
  }
  const settings = await EventSettings.findById('current').select('sponsors').lean();
  const previews = settings.sponsors.filter(sponsor => sponsor.id.startsWith('preview-'));
  console.log(`Added ${added} placeholder sponsors; verified ${previews.length} preview entries in MongoDB.`);
  console.log(`Preview logo origin: ${new URL(env.clientOrigin).origin}. Hide or remove the placeholders in Admin → Sponsors after review.`);
} catch (error) {
  console.error(`Preview sponsor seed failed (${error.name}). Check database connectivity and the configured frontend origin.`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
