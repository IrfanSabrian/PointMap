<script setup>
import { Bar } from 'vue-chartjs'
import {
  Chart,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'
Chart.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

defineProps({
  dataStat: Object
})
</script>

<template>
  <Bar :data="dataStat" :options="{
    responsive: true,
    plugins: { legend: { display: false }},
    scales: {
      y: { beginAtZero: true, ticks: { color: '#34729C' } },
      x: { ticks: { color: '#1E5470' } }
    }
  }" height="180" />
</template>