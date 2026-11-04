import mongoose from 'mongoose';
const memberSchema = new mongoose.Schema({ name: { type: String, required: true, trim: true }, email: { type: String, required: true, lowercase: true, trim: true } }, { _id: false });
const teamSchema = new mongoose.Schema({ name: { type: String, required: true, unique: true, trim: true }, leaderName: { type: String, required: true, trim: true }, leaderEmail: { type: String, required: true, unique: true, lowercase: true, trim: true }, members: { type: [memberSchema], default: [] } }, { timestamps: true });
export default mongoose.model('Team', teamSchema);
