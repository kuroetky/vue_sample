<template>
  <v-app>
    <v-container>
      <ChatBoard />
      <ChatForm />
    </v-container>
  </v-app>
</template>

<script>
import ChatBoard from "./components/ChatBoard";
import ChatForm from "./components/Form";

export default {
  name: "App",

  components: {
    ChatBoard,
    ChatForm,
  },
};
</script>
