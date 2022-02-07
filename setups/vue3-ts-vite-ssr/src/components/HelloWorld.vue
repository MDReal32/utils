<template>
  <h1>{{ msg }}</h1>

  <p>
    Recommended IDE setup:
    <a href="https://code.visualstudio.com/" target="_blank">VSCode</a>
    +
    <a href="https://github.com/johnsoncodehk/volar" target="_blank">Volar</a>
  </p>

  <p>
    You can use
    <a href="https://www.jetbrains.com/webstorm/download/" target="_blank">Webstorm</a>
    too
  </p>

  <p>
    See
    <code>README.md</code>
    for more information.
  </p>

  <p>
    <a href="https://vitejs.dev/guide/features.html" target="_blank">Vite Docs</a>
    |
    <a href="https://v3.vuejs.org/" target="_blank">Vue 3 Docs</a>
  </p>

  <p>
    <span>Count: {{ count }}</span>
  </p>

  <p>
    <button type="button" @click="count++">Increase</button>
    <span>&nbsp;</span>
    <button type="button" @click="count--">Decrease</button>
  </p>

  <p>
    Edit
    <code>components/HelloWorld.vue</code>
    to test hot module replacement.
  </p>
</template>

<script setup lang="ts">
import { ref } from "vue";

defineProps({ msg: { type: String } });
const count = ref(0);
</script>

<style scoped>
a {
  color: #42b983;
}

label {
  margin: 0 0.5em;
  font-weight: bold;
}

code {
  background-color: #eee;
  padding: 2px 4px;
  border-radius: 4px;
  color: #304455;
}
</style>
