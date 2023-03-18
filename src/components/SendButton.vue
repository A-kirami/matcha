<script setup lang="ts">
// eslint-disable-next-line func-call-spacing
defineEmits<{ (e: 'send'): void }>()
</script>

<template>
  <button class="h-8 outline-none" @click="$emit('send')">
    <div class="svg-wrapper-1">
      <div class="svg-wrapper">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
          <path fill="none" d="M0 0h24v24H0z"></path>
          <path
            fill="currentColor"
            d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"
          ></path>
        </svg>
      </div>
    </div>
    <span class="text-sm">发送</span>
  </button>
</template>

<style scoped lang="postcss">
button {
  display: flex;
  align-items: center;
  width: 100px;
  padding-left: 1rem;
  overflow: hidden;
  color: hsl(0deg 0% 100%);
  background: hsl(206deg 100% 50%);
  border: none;
  border-radius: 16px;
  transition: all 0.2s;

  & span {
    display: block;
    margin-left: 0.3em;
    transition: all 0.3s ease-in-out;
  }

  & svg {
    display: block;
    transition: transform 0.3s ease-in-out;
    transform-origin: center center;
  }

  &:hover .svg-wrapper {
    animation: fly-1 0.6s ease-in-out infinite alternate;
  }

  &:hover svg {
    transform: translateX(1em) rotate(45deg) scale(1.1);
  }

  &:hover span {
    transform: translateX(5em);
  }

  &:active {
    transform: scale(0.95);
  }
}

@keyframes fly-1 {
  from {
    transform: translateY(0.1em);
  }

  to {
    transform: translateY(-0.1em);
  }
}
</style>
