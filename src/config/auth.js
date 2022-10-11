import "firebase/auth"
import { auth } from './firebase'
import { initializeApp } from 'firebase/app';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD9qPbbXLYnAE85jMIp0mZexV4vji8j_gY",
  authDomain: "citrusvax-368cd.firebaseapp.com",
  databaseURL: "https://citrusvax-368cd-default-rtdb.firebaseio.com",
  projectId: "citrusvax-368cd",
  storageBucket: "citrusvax-368cd.appspot.com",
  messagingSenderId: "866833807314",
  appId: "1:866833807314:web:acb14e97a6650da8313a0b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//firebase register user account method
export const register = async ({ email, password }) => {
    const resp = await app.auth()
        .createUserWithEmailAndPassword(email, password);
    return resp.user;
}
//firebase email and password login method
export const login = async ({ email, password }) => {
    const res = await app.auth()
        .signInWithEmailAndPassword(email, password);
    return res.user;
}
