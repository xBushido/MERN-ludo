import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    username: {type: String, required: true, unique: true, trim: true},
    password: {type: String, required: true},
    dob: {type: Date, required: true},
    coins: {type: Number, default: 100},
    total_played: {type: Number, default: 0}
})

const User = mongoose.model('User', userSchema);
export default User;