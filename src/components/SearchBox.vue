<script setup lang="ts"></script>

<template>
  <form class="form text-sm">
    <label for="search">
      <input
        id="search"
        class="input text-sm caret-blue-500"
        type="text"
        required
        placeholder="查找联系人"
        autocomplete="off"
      />
      <div class="fancy-bg bg-gray-100 transition-all duration-150"></div>
      <div class="search">
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          class="r-14j79pv r-4qtqp9 r-yyyyoo r-1xvli5t r-dnmrzs r-4wgw6l r-f727ji r-bnwqim r-1plcrui r-lrvibr"
        >
          <g>
            <path
              d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"
            ></path>
          </g>
        </svg>
      </div>
      <button class="close-btn" type="reset">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clip-rule="evenodd"
          ></path>
        </svg>
      </button>
    </label>
  </form>
</template>

<style scoped>
.form {
  --input-text-color: hsl(0deg 0% 100%);
  --input-bg-color: hsl(210deg 25% 21%);
  --focus-input-bg-color: transparent;
  --text-color: hsl(210deg 11% 62%);
  --active-color: hsl(204deg 86% 52%);
  --width-of-input: 200px;
  --inline-padding-of-input: 0.8em;
  --gap: 0.8rem;
  position: relative;
  display: flex;
  gap: 0.5rem;
  align-items: center;
  width: var(--width-of-input);
  isolation: isolate;
}

.fancy-bg {
  position: absolute;
  inset: 0;
  z-index: -1;
  width: 100%;
  height: 100%;
  pointer-events: none;
  border-radius: 30px;
  box-shadow: rgb(0 0 0 / 16%) 0 1px 4px;
}

label {
  display: flex;
  align-items: center;
  width: 100%;
  height: 32px;
  padding: 0.2em;
  padding-inline: var(--inline-padding-of-input);
}

.search,
.close-btn {
  position: absolute;
}

.search {
  left: var(--inline-padding-of-input);
  fill: var(--text-color);
}

svg {
  display: block;
  width: 17px;
}

.close-btn {
  right: var(--inline-padding-of-input);
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0.1em;
  color: hsl(0deg 0% 100%);
  visibility: hidden;
  background: var(--active-color);
  border: none;
  border-radius: 50%;
  opacity: 0;
}

.input {
  width: 100%;
  margin-inline: min(2em, calc(var(--inline-padding-of-input) + var(--gap)));
  background: none;
  border: none;
}

.input:focus {
  outline: none;
}

.input::placeholder {
  color: var(--text-color);
}

.input:focus ~ .fancy-bg {
  background: var(--focus-input-bg-color);
  border: 1px solid var(--active-color);
  box-shadow: none;
}

.input:focus ~ .search {
  fill: var(--active-color);
}

.input:valid ~ .close-btn {
  visibility: visible;
  opacity: 1;
}

input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  /* stylelint-disable-next-line declaration-property-value-no-unknown */
  transition: 'color 9999s ease-out, background-color 9999s ease-out';
  transition-delay: 9999s;
}
</style>
