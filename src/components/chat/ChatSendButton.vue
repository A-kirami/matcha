<template>
  <button
    :class="$style.sendButton"
    class="send-button h-8 w-20 flex items-center justify-center rounded-md bg-blue-400 text-white outline-none active:scale-95 svg:hover:(rotate-45 scale-110)"
  >
    <div :class="$style.svgWrapper">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        class="transition-transform duration-300"
      >
        <path fill="none" d="M0 0h24v24H0z"></path>
        <path
          fill="currentColor"
          d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"
        ></path>
      </svg>
    </div>
  </button>
</template>

<style module>
.send-button:hover .svg-wrapper {
  animation: fly 0.6s ease-in-out infinite alternate;
}

@keyframes fly {
  from {
    transform: translateY(0.1em);
  }

  to {
    transform: translateY(-0.1em);
  }
}
</style>
