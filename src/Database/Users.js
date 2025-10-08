import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const UserSchema = new Schema({
  UserName: { type: String, required: true, unique: true },
  Email: { type: String, required: true, unique: true },
  Password: { type: String, required: true },
}, { timestamps: true }); 

export default model('User', UserSchema); 