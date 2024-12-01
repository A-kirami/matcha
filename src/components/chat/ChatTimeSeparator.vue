<script setup lang="ts">
import * as dayjs from 'dayjs'
import calendar from 'dayjs/plugin/calendar'

dayjs.extend(calendar)

const { time } = $defineProps<{ time: number }>()

const calendarTime = dayjs.unix(time).calendar(undefined, {
  sameDay: 'A h:mm ',
  nextDay: '[明天]',
  nextWeek: 'dddd',
  lastDay: '[昨天]',
  lastWeek: '[上] dddd',
  sameElse: 'YYYY-MM-DD',
})
</script>

<template>
  <div
    class="flex items-center gap-4 text-xs text-gray-400"
    un-before="h-1px content-empty bg-gray-300 flex-1 opacity-50"
    un-after="h-1px content-empty bg-gray-300 flex-1 opacity-50"
    dark="before:bg-gray-400 after:bg-gray-400"
  >
    {{ calendarTime }}
  </div>
</template>
