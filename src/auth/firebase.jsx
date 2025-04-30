// firebase.jsx
import { initializeApp } from "firebase/app";
import { getAuth, GithubAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDlFlQ2H1zE4yjVcZaZxE3qxuQMmZcqCmU",
  authDomain: "devdash-b2266.firebaseapp.com",
  projectId: "devdash-b2266"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GithubAuthProvider();

// Request the 'repo' scope (for accessing repositories)
provider.addScope('repo');
// Optionally request 'read:user' scope if you need more user details
// provider.addScope('read:user');

export { auth, provider };