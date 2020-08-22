import Vue from "vue";
import { firestorePlugin } from "vuefire";
import firebase from "firebase/app";
import "firebase/firestore";

Vue.use(firestorePlugin);

const firebaseApp = firebase.initializeApp({
  // ここにfirebaseのapi情報をコピペします。
  apiKey: "AIzaSyA_lYwtqnpL489pNuIKdTWvqETn_OI_JGQ",
  authDomain: "chat-firestore-vue-sampl-62a38.firebaseapp.com",
  databaseURL: "https://chat-firestore-vue-sampl-62a38.firebaseio.com",
  projectId: "chat-firestore-vue-sampl-62a38",
  storageBucket: "chat-firestore-vue-sampl-62a38.appspot.com",
  messagingSenderId: "308483936972",
});

export const db = firebaseApp.firestore();
