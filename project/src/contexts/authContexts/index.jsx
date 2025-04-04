import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../../firebase/firebase";
import { onAuthStateChanged, setPersistence, browserLocalPersistence } from "firebase/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [currentuser, setcurrentUser] = useState(null);
    const [userlogin, setuserlogin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Set persistence to LOCAL to maintain auth state across page refreshes
        setPersistence(auth, browserLocalPersistence)
            .then(() => {
                console.log("Authentication persistence set to LOCAL");
            })
            .catch((error) => {
                console.error("Error setting persistence:", error);
            });

        // Set up the auth state listener
        const unsubscribed = onAuthStateChanged(auth, (user) => {
            console.log("Auth state changed:", user ? "User logged in" : "No user");
            setcurrentUser(user);
            setuserlogin(!!user);
            setLoading(false);
        });

        // Clean up the listener when the component unmounts
        return () => unsubscribed();
    }, []);

    const value = {
        currentuser,
        userlogin,
        loading,
    };
    
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;     
}  

export function useAuth() {
    return useContext(AuthContext);
} 