import mongoose from "mongoose";
import bcrypt from "bcryptjs"; // Import bcrypt for password hashing
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6, // Minimum length for password
  },
  bio: {
    type: String,
    default: "", // Default value for bio
  },
  profilePic: {
    type: String,
    default: "", // Default value for profile picture
  },
  nativeLanguage: {
    type: String,
    default:""// Native language is required
  },
   learningLanguage: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    isOnboarded: {
      type: Boolean,
      default: false,
    },
     friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
},
{
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});
//pre hook for brcypting password by using bcrypt js

userSchema.pre("save", async function (next) {
    // Check if the password is modified or new
    if (!this.isModified("password")) {
        return next(); // If not modified, skip hashing
    }
    try{
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    }catch (error) {
        next(error);
    }
})
// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error("Password comparison failed");
    }
}
const User = mongoose.model("User", userSchema);



export default User;