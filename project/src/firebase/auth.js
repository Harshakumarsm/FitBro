import {auth} from "./firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  updatePassword as updateUserPassword,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";

export function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
}

export async function login(email, password) {
    try {
        // Set persistence to LOCAL before signing in
        await setPersistence(auth, browserLocalPersistence);
        
        // Attempt to sign in
        const result = await signInWithEmailAndPassword(auth, email, password);
        console.log("Login successful:", result.user.email);
        return result;
    } catch (error) {
        console.error("Login error:", error.message);
        throw error;
    }
}   

export async function logout() {
    try {
        await signOut(auth);
        console.log("Logout successful");
    } catch (error) {
        console.error("Logout error:", error.message);
        throw error;
    }
}   

export function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
}   

export function updatePassword(password) {
    return updateUserPassword(auth.currentUser, password);
}

export async function googleLogin() {
    try {
        // Set persistence to LOCAL before signing in
        await setPersistence(auth, browserLocalPersistence);
        
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        console.log("Google login successful:", result.user.email);
        return result;
    } catch (error) {
        console.error("Google login error:", error.message);
        throw error;
    }
}

// Get the current user's ID token
export async function getCurrentUserToken() {
    const user = auth.currentUser;
    if (user) {
        return await user.getIdToken();
    }
    return null;
}

// Get the current user's ID token with force refresh
export async function getCurrentUserTokenForceRefresh() {
    const user = auth.currentUser;
    if (user) {
        return await user.getIdToken(true); // Force refresh the token
    }
    return null;
}

// Check if the user is authenticated
export function isAuthenticated() {
    return !!auth.currentUser;
}

// Get the current user
export function getCurrentUser() {
    return auth.currentUser;
}






