<template>
  <footer>
    <p><i class="far fa-copyright"></i> {{ currentYear }} Tiny AI. All rights reserved.</p>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
footer {
  background-color: rgba(61, 52, 86, 0.8);
  color: var(--text-muted);
  text-align: center;
  padding: 1.2rem;
  margin-top: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.9rem;
}
</style>
