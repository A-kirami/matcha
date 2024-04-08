<script setup lang="ts">
import { Toaster, type ToasterProps } from 'vue-sonner'

const props = defineProps<ToasterProps>()
</script>

<template>
  <Toaster v-bind="props" close-button class="toaster">
    <template #loading-icon>
      <ToastIcon type="loading" />
    </template>
    <template #success-icon>
      <ToastIcon type="success" />
    </template>
    <template #error-icon>
      <ToastIcon type="error" />
    </template>
    <template #info-icon>
      <ToastIcon type="info" />
    </template>
    <template #warning-icon>
      <ToastIcon type="warning" />
    </template>
  </Toaster>
</template>

<style>
.toaster[data-sonner-toaster] {
  --width: 20rem !important;
  --offset: 1.25rem !important;

  & [data-sonner-toast] {
    @apply flex;

    & [data-icon] {
      @apply w-auto h-auto;
    }

    & [data-title] {
      @apply text-sm font-semibold;
    }

    & [data-description] {
      @apply text-gray-500 text-sm;
    }

    & [data-button] {
      @apply ml-auto bg-blue-400;
    }

    & [data-close-button] {
      @apply static order-last border-none rounded-md size-7 transform-none hover:bg-gray-100;

      & svg {
        @apply w-5 h-5;
      }
    }

    &:not(:has([data-button])) [data-close-button] {
      @apply ml-auto;
    }
  }
}
</style>
