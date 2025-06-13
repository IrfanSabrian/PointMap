<template>
  <div class="max-w-2xl mx-auto py-10">
    <h1 class="text-4xl font-bold text-blue-700 mb-6">Daftar Gedung Polnep</h1>
    <ul class="space-y-3">
      <li 
        v-for="gedung in gedungList" 
        :key="gedung.id"
        class="p-4 rounded-lg shadow bg-white"
      >
        <div class="font-semibold text-lg">{{ gedung.nama }}</div>
        <div class="text-sm text-gray-500">Kode: {{ gedung.kode }} | Lantai: {{ gedung.jumlah_lantai }} | Jenis: {{ gedung.jenis_gedung }}</div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const gedungList = ref([])

onMounted(async () => {
  const res = await fetch('http://localhost:3001/api/gedung')
  gedungList.value = await res.json()
})
</script>
