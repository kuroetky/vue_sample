import Vue from "vue";
import "@babel/polyfill";
import "./plugins/vuetify";
import "./plugins/firebase";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";

Vue.config.productionTip = false;

new Vue({
  vuetify,
  render: (h) => h(App),
}).$mount("#app");
