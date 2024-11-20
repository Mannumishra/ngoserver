const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const SignupSchema = new mongoose.Schema({
    parentId: { type: String, required: false },
    referral: { type: String, required: false },
    placement: { type: String, required: false },
    logId: { type: String, default: "SBVKS001" },
    password: { type: String, required: true },
    confirmPassword: { type: String, required: true },
    firstName: { type: String, required: true },
    middleName: { type: String, required: false },
    lastName: { type: String, required: true },
    fathersName: { type: String, required: false },
    dateOfBirth: { type: Date, required: true },
    mobile: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: false },
    pincode: { type: String, required: true },
    landmark: { type: String, required: false },
    country: { type: String, required: true },
    role: { type: String, default: "USER" },
}, { timestamps: true });


// // Hash password before saving
// SignupSchema.pre("save", async function (next) {
//     if (!this.isModified("password")) return next();

//     try {
//         const salt = await bcrypt.genSalt(12); // Adjust the salt rounds as needed
//         this.password = await bcrypt.hash(this.password, salt);
//         this.confirmPassword = undefined; // Remove confirmPassword from storage
//         next();
//     } catch (err) {
//         next(err);
//     }
// });



const SignUp = mongoose.model("Signup", SignupSchema);


module.exports = SignUp

