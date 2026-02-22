<template lang="pug">
// Transition sorgt für ein sanftes Ein- und Ausblenden
div
  Transition(name="fade")
    div.loading-overlay(v-if="active")
      div.spinner-container
        div.spinner
        p.loading-text {{ message }}
</template>

<script setup lang="ts">
/**
 * Props Definition:
 * @param active - Steuert die Sichtbarkeit
 * @param message - Der Text, der unter dem Spinner steht
 */
defineProps({
  active: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: 'Daten werden geladen...'
  }
})
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(4px); /* Schicker Unschärfe-Effekt */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.spinner-container {
  text-align: center;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 6px solid #e0e0e0;
  border-top: 6px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.loading-text {
  font-family: 'supermarker', sans-serif; /* Konsistent zum restlichen Design */
  color: #6a5acd; /* Passend zum Lila deines Hintergrunds (#c1b5f9) */
  font-weight: 500;
  font-size: 1.2rem;
}

/* Animationen */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Vue Transition Styles */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>