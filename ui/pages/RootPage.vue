<script setup>
  import { ref } from "vue";
  const count = ref(0);
</script>

<template>
  <div><code>index.vue</code></div>
  <div><button @click="count++">{{ count }}</button></div>
</template>
