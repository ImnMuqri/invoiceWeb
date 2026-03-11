<template>
  <div class="flex items-center justify-center">
    <Icon :name="icon || name" :class="customClass" />
  </div>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: false,
  },
  customClass: {
    type: String,
    default: "",
  },
});
</script>
