// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import firebase from 'firebase'

Vue.config.productionTip = false

// Your web app's Firebase configuration
const config = {
  apiKey: "AIzaSyDNdy2ctV9qWDwMantNq3NZQbYtPsHbQVY",
  authDomain: "authtest-67ba4.firebaseapp.com",
  databaseURL: "https://authtest-67ba4.firebaseio.com",
  projectId: "authtest-67ba4",
  storageBucket: "authtest-67ba4.appspot.com",
  messagingSenderId: "1088886475784",
  appId: "1:1088886475784:web:ff2977f056f9958988d5bd"
}
// Initialize Firebase
firebase.initializeApp(config);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
