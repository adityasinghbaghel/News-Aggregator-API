var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var userSchema = new Schema({
    fullName: {
        type: String,
        required: [true, "Full name not provided"]
    },
    email: {
        type: String,
        unique: true, // Corrected syntax for unique
        lowercase: true,
        trim: true,
        required: [true, "Email not provided"],
        validate: {
            validator: function(v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now // Corrected the typo here from Data.now to Date.now
    },
    preference:{
        type: [String], // Allow multiple preferences as an array
        enum: ["technology", "sports"],
        required: true
    }
});

module.exports = mongoose.model('User', userSchema);
