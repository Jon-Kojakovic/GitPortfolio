import React, { useContext, useState, useEffect } from "react"
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut,
  GoogleAuthProvider,
  RecaptchaVerifier, 
  signInWithPhoneNumber
} from "firebase/auth";
import { auth } from "../config/firebase.js"

const googleProvider = new GoogleAuthProvider()
const AuthContext = React.createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState()
  const [claims, setClaims] = useState({})
  const [authProvider, setAuthProvider] = useState({})

  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password)
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email)
  }

  function googleLogin() {
    return signInWithPopup(auth, googleProvider)
  }

  function sendLoginMail(email) {
    const actionCodeSettings = {
      url: 'http://localhost:3000/emailLinkLogin',
      // This must be true.
      handleCodeInApp: true
    };
    window.localStorage.setItem('emailForSignIn', email);
    return sendSignInLinkToEmail(auth, email, actionCodeSettings)
  }

  function loginWithMailLink() {
    let email = window.localStorage.getItem('emailForSignIn');
    console.log("received mail login my email is", email)
    if (isSignInWithEmailLink(auth, window.location.href)) {
      if (!email) {
        email = window.prompt('Please provide your email for confirmation');
      } else {
        window.localStorage.removeItem('emailForSignIn');
        localStorage.setItem('2FA', true)
      }
    }
    return signInWithEmailLink(auth, email, window.location.href)
  }

  function anonymously(email, password) {
    return signInAnonymously(auth)
  }

  function logout() {
    return signOut(auth)
  }

  function isAdmin() {
    return claims.admin
  }

  function isAdmin2FA() {
    return isAdmin() && authProvider=="phone"
  }

  function isStaff() {
    return claims.staff
  }

  function isStaff2FA() {
    return isStaff() && authProvider=="phone"
  }


  function isUser() {
    return currentUser != null
  }

  function is2FA() {
    return isUser() && authProvider=="phone"
  }

  function updateEmail(email) {
    return currentUser.updateEmail(email)
  }

  function updatePassword(password) {
    return currentUser.updatePassword(password)
  }

  function generateRecaptcha(id) {
    const rv = new RecaptchaVerifier(id, {
        size: "normal",
        callback: (resp) => {}
      },
      auth
    )
    window.recapthchaVerifier = rv
  }

  function sendPINSMS(phoneNumber, containerId) {
    generateRecaptcha(containerId)
    const promisesPromises = new Promise((resolve, reject) => {
      signInWithPhoneNumber(auth, phoneNumber, window.recapthchaVerifier)
        .then( (result) => {
          window.confirmationResult = result
          resolve(result)
        })
        .catch((err) => {
          reject(err)
        })
    })
    return promisesPromises
  }

  function sendPINSMS2(phoneNumber, containerId) {
    generateRecaptcha(containerId)
    const promisesPromises = new Promise((resolve, reject) => {
      signInWithPhoneNumber(auth, phoneNumber, window.recapthchaVerifier)
        .then( (result) => {
          window.confirmationResult = result
          resolve(result)
        })
        .catch((err) => {
          reject(err)
        })
    })
    return promisesPromises
  }


  function confirmPIN(pin) {
    const confirmationResult = window.confirmationResult
    return confirmationResult.confirm(pin)
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user)
      setLoading(false)
      console.log("User changed!", user)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    const fetchClaims = async( cu ) => {
      if (cu) {
        const tokenResult = await cu.getIdTokenResult()
        setClaims(tokenResult.claims)
        setAuthProvider(tokenResult.signInProvider)
      } else {
        setClaims({})
        setAuthProvider(null)
      }
    }
    fetchClaims(currentUser)
  }, [currentUser]);

  const value = {
    currentUser,
    claims,
    authProvider,
    login,
    googleLogin,
    sendLoginMail,
    loginWithMailLink,
    anonymously,
    signup,
    logout,
    isAdmin,
    isStaff,
    isUser,
    is2FA,
    resetPassword,
    updateEmail,
    updatePassword,
    sendPINSMS,
    confirmPIN
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
