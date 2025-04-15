import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default:
        "https://www.google.https://images.unsplash.com/photo-1511367461989-f85a21fda167?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D/url?sa=i&url=https%3A%2F%2Funsplash.com%2Fs%2Fphotos%2Fprofile&psig=AOvVaw3046Gp-67O4A62TwHDSNeP&ust=1742065818270000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCIiBm4ujiowDFQAAAAAdAAAAABAK",
    },
  },
  { timmestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
