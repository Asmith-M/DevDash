import React from 'react';
import { signInWithPopup, signOut, GithubAuthProvider } from "firebase/auth";
import { auth, provider } from "../auth/firebase";
import { useAuth } from "../auth/AuthProvider";
import { Button } from "@mui/material";
import { useTheme } from '@mui/material/styles';

const AuthButton = () => {
  const { user } = useAuth();
  const theme = useTheme();

  const login = async () => {
    try {
      // Make sure your provider is a GithubAuthProvider
      if (!(provider instanceof GithubAuthProvider)) {
        throw new Error("Provider is not configured for GitHub authentication");
      }
      
      // Add required scopes for repo access
      provider.addScope('repo');
      provider.addScope('user');
      
      // Sign in with popup
      const result = await signInWithPopup(auth, provider);
      
      // Get and store the token
      const credential = GithubAuthProvider.credentialFromResult(result);
      if (credential && credential.accessToken) {
        localStorage.setItem('githubAccessToken', credential.accessToken);
        console.log("GitHub token stored in localStorage");
        
        // Force a reload to update user object with token
        window.location.reload();
      } else {
        console.error("No credential or access token returned");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("GitHub login failed. Please try again.");
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('githubAccessToken');
      console.log("User logged out and token removed");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return user ? (
    <Button
      variant="outlined"
      onClick={logout}
      sx={{
        color: theme.palette.mode === 'dark' ? 'white' : 'primary.main',
        borderColor: theme.palette.mode === 'dark' ? 'white' : 'primary.main',
        '&:hover': {
          backgroundColor:
            theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(0, 0, 0, 0.04)',
        },
      }}
    >
      Logout ({user.displayName})
    </Button>
  ) : (
    <Button
      variant="contained"
      onClick={login}
      sx={{
        backgroundColor:
          theme.palette.mode === 'dark' ? '#1e88e5' : 'primary.main',
        color: 'white',
        '&:hover': {
          backgroundColor:
            theme.palette.mode === 'dark'
              ? '#1565c0'
              : 'darken(primary.main, 0.1)',
        },
      }}
    >
      Login with GitHub
    </Button>
  );
};

export default AuthButton;