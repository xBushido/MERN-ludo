import mongoose, { Schema } from "mongoose";

const gameSchema = new Schema({
    total_players: {type: Number, required: true},
    players: [{
        user_id: Schema.Types.ObjectId,
        username: String,
        color: {type: String, enum: ['red', 'blue', 'green', 'yellow']},
        rank: Number,
        coins_earned: Number
    }],
    status: {type: String, enum: ['waiting', 'playing', 'finished'], default: 'waiting'},
    started_at: Date,
    finished_at: Date
})

const Game = mongoose.model('Game', gameSchema);
export default Game;