<template>
  <div class="absolute z-999 h-full w-full flex items-center justify-center bg-dark-200 opacity-20">
    <div class="spinner"></div>
  </div>
</template>

<style scoped>
.spinner {
  display: grid;
  width: 56px;
  height: 56px;
  border: 4.5px solid hsl(0deg 0% 0% / 0%);
  border-color: hsl(237deg 38% 90%) hsl(0deg 0% 0% / 0%);
  border-radius: 50%;
  animation: spinner-e04l1k 1s infinite linear;
}

.spinner::before,
.spinner::after {
  grid-area: 1/1;
  margin: 2.2px;
  content: '';
  border: inherit;
  border-radius: 50%;
}

.spinner::before {
  border-color: hsl(239deg 100% 64%) hsl(0deg 0% 0% / 0%);
  animation: inherit;
  animation-duration: 0.5s;
  animation-direction: reverse;
}

.spinner::after {
  margin: 8.9px;
}

@keyframes spinner-e04l1k {
  100% {
    transform: rotate(1turn);
  }
}
</style>
