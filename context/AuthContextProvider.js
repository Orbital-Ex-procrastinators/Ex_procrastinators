import { useContext, createContext, useEffect, useState } from "react";
import {
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    signOut,
    onAuthStateChanged,
  } from 'firebase/auth';
  import { auth } from '../firebase';

const AuthContext = createContext()

export const AuthContextProvider = ({children}) => {
    
    return (
        <AuthContext.Provider value={{}}> 
            {children}
        </AuthContext.Provider>
    )
}

export const User = () => {
    return useContext(AuthContext);
}