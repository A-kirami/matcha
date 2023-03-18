<script setup lang="ts">
import { UseDark } from '@vueuse/components'
</script>

<template>
  <UseDark v-slot="{ isDark, toggleDark }">
    <label class="switch mb-10">
      <input type="checkbox" :checked="!isDark" @click="toggleDark()" />
      <span class="slider shadow-gray-500/10 shadow-inner"></span>
    </label>
  </UseDark>
</template>

<style scoped lang="postcss">
.switch {
  position: relative;
  display: inline-block;
  width: 3.5em;
  height: 2em;
  font-size: 17px;
  transform: rotate(-90deg);
}

.switch input {
  width: 0;
  height: 0;
  opacity: 0;
}

.slider {
  position: absolute;
  inset: 0;
  cursor: pointer;
  background-color: rgb(0 0 0);
  border-radius: 30px;
  transition: 0.4s;
}

.slider::before {
  position: absolute;
  bottom: 0.3em;
  left: 0.3em;
  width: 1.4em;
  height: 1.4em;
  content: '';
  background-color: hsl(48deg 97% 77%);
  border-radius: 20px;
  transition: 0.4s;
}

input:checked + .slider {
  background-color: hsl(0deg 0% 97%);
}

input:checked + .slider::before {
  transform: translateX(1.5em);
}

.slider::after {
  position: absolute;
  top: 10%;
  left: 20%;
  width: 20px;
  height: 20px;
  content: '';
  background-color: rgb(0 0 0);
  border-radius: 50%;
  transition: ease 0.4s;
}

input:checked + .slider::after {
  left: 80%;
  width: 0;
  height: 0;
  background-color: hsl(0deg 0% 97%);
}
</style>
