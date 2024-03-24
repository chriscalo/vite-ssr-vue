<script setup>
  import { ref, useSSRContext } from "vue";
  
  const count = ref(0);
  const url = ref(null);
  
  if (import.meta.env.SSR) {
    const { req } = useSSRContext();
    url.value = req.originalUrl;
  }
</script>

<template>
  <code>index.vue</code>
  <p>URL = <code>{{ url }}</code></p>
  <button @click="count++">{{ count }}</button>
</template>
