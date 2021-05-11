const mongoose = require("mongoose");
const { compareSync, hashSync } = require("bcryptjs");

const ResetSchema = new mongoose.Schema({
    resetPasswordToken: {
        type: String,
        required: true
    },

    resetPasswordExpires: {
        type: Date,
        required: true
    },

    userId: {
        type: String,
        required: true,
        validate: {
            validator: userID => Reset.doesNotExist({ userID }),
            message: "Reset token is already generated"
        }
    }
}, { timestamps: true });

ResetSchema.statics.doesNotExist = async function (field) {
    return await this.where(field).countDocuments() === 0;
};
ResetSchema.pre('save', function () {
    if (this.isModified('resetPasswordToken')) {
        this.resetPasswordToken = hashSync(this.resetPasswordToken, 10);
    }
});
ResetSchema.methods.compareTokens = function (resetPasswordToken) {
    return compareSync(resetPasswordToken, this.resetPasswordToken);
}


const Reset = mongoose.model('Reset', ResetSchema);
module.exports = Reset;