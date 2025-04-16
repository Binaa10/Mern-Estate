import { Client, Account, Storage, ID, Permission, Role } from "appwrite";

const client = new Client();

client
  .setEndpoint("https://fra.cloud.appwrite.io/v1") // Appwrite endpoint
  .setProject("67feced20039a094604c"); // Your project ID

const account = new Account(client);
const storage = new Storage(client);

// ✅ Upload file with read + update permissions
async function uploadFile(file, setImageUrl) {
  if (!file) {
    console.error("No file selected.");
    return;
  }

  try {
    const user = await account.get(); // Get current logged-in user

    const uploadedFile = await storage.createFile(
      "67fed0b9001c2550df97", // Your actual bucket ID
      ID.unique(), // ✅ Generates unique ID correctly
      file,
      [
        Permission.read(Role.user(user.$id)), // only this user can view
        Permission.update(Role.user(user.$id)), // optional: allow updating
      ]
    );

    // ✅ Generate preview URL
    const previewUrl = storage.getFileView(
      "67fed0b9001c2550df97",
      uploadedFile.$id
    );
    setImageUrl(previewUrl);
    console.log("File uploaded and preview ready:", previewUrl);

    return uploadedFile;
  } catch (err) {
    console.error("Upload failed:", err);
  }
}

export { client, account, storage, uploadFile };
