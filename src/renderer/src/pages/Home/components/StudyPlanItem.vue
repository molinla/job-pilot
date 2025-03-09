<script setup>
defineProps({
  plan: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <div
    :class="[
      'flex items-center p-2.5 rounded-lg',
      plan.focus ? 'bg-blue-50' : 'bg-gray-50',
      plan.completed ? 'opacity-90' : '',
    ]"
  >
    <div
      :class="[
        'w-5 h-5 rounded-full shrink-0 mr-2.5 flex items-center justify-center',
        plan.completed
          ? 'bg-blue-500 text-white'
          : plan.focus
            ? 'border-2 border-blue-500'
            : 'border-2 border-gray-300',
      ]"
    >
      <span
        v-if="plan.completed"
        class="material-icons"
        style="font-size: 14px; line-height: 1"
        >check</span
      >
    </div>

    <div class="min-w-0 flex-1">
      <h3
        :class="[
          'text-xs font-medium truncate',
          plan.completed ? 'text-gray-500' : 'text-gray-700',
        ]"
      >
        {{ plan.title }}
      </h3>
      <p
        :class="[
          'text-[10px]',
          plan.completed ? 'text-gray-400' : 'text-gray-500',
        ]"
      >
        {{ plan.time }}
      </p>
    </div>
  </div>
</template>
