// Import the functions you need from the SDKs you need
// import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAeui_jGWNmYmWfGoytqk9ufLb6L_8reDE",
  authDomain: "orbital-app-39819.firebaseapp.com",
  projectId: "orbital-app-39819",
  storageBucket: "orbital-app-39819.appspot.com",
  messagingSenderId: "427850993939",
  appId: "1:427850993939:web:16851d175da9a0d3948ae6"
};

// Initialize Firebase
const firebaseApp =firebase.initializeApp(firebaseConfig);
const auth = firebase.auth()
export { auth };

// const provider = new GoogleAuthProvider();

// export const signInWithGoggle = () => {
//   signInWithPopup(auth, provider)
//   .then((result) => {
//     const name = result.user.displayName;
//     const email = result.user.email;
//     const profilePic = result.user.photoURL;

//     localStorage.setItem("name", name);
//     localStorage.setItem("email", email);
//     localStorage.setItem("profilePic", profilePic);
//   })
//   .catch((error) => {
//     console.log(error);
//   });
// }