## Firebase Firestore Setup Instructions

1. **Create a Firebase Project:**
   - Go to the [Firebase Console](https://console.firebase.google.com/).
   - Click on "Add project" and follow the instructions to create a new project.

2. **Register your app with Firebase:**
   - In the Firebase Console, go to "Project settings".
   - Under "Your apps", click on the web icon (</>) to register your web app.
   - Follow the instructions to add Firebase to your web app.

3. **Setup the .env file:**
   - Create a `.env` file in the root of your project.
   - Copy the contents of `.env.example` to `.env`.
   - Replace the placeholder values (`your_api_key_here`, `your_project_id`, etc.) with the actual values from your Firebase project settings.

4. **Configure Firestore Rules:**
   - In the Firebase Console, go to "Firestore Database".
   - Click on the "Rules" tab.
   - Replace the default rules with the following:

   ```plaintext
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /feedback/{document=**} {
         allow read: if false;  // Only allow read access through admin console
         allow create: if true; // Allow anyone to submit feedback
         allow update, delete: if false; // Don't allow updates or deletions
       }
     }
   }
   ```

5. **Deploy Firestore Rules:**
   - Click on "Publish" to deploy the new rules.

6. **Setup Environment Variables on Vercel:**
   - Go to your project on [Vercel](https://vercel.com/).
   - Navigate to the "Settings" tab.
   - Click on "Environment Variables".
   - Add the following environment variables with the corresponding values from your `.env` file:

   ```
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

Your Firebase Firestore setup is now complete. Make sure to follow these steps carefully to ensure proper configuration.
Your Vercel environment is now configured with the necessary Firebase variables.
