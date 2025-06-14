<template>
  <div :class="{ dark: isDark }" class="min-h-screen bg-gradient-to-tr from-accent via-white to-toscaLight dark:from-dark dark:via-dark dark:to-primary transition-colors">
    <!-- NAVBAR -->
    <nav class="flex items-center justify-between px-6 py-3 shadow-lg bg-white/60 dark:bg-dark/90 sticky top-0 z-30">
      <div class="flex items-center gap-2">
        <!-- Dummy Logo SVG -->
        <div class="w-10 h-10 rounded-full border-2 border-primary shadow-sm bg-white flex items-center justify-center">
          <svg width="36" height="36" viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill="#34729C"/><text x="50%" y="56%" text-anchor="middle" fill="white" font-size="15" font-family="Arial" dy=".3em">LOGO</text></svg>
        </div>
        <span class="font-extrabold text-primary text-lg dark:text-accent">Politeknik Negeri Pontianak</span>
      </div>
      <div class="hidden md:flex items-center gap-3 text-dark dark:text-accent/90 text-sm font-semibold">
        <span v-if="cuaca !== null">{{ cuaca }}&nbsp;|</span>
        <span>{{ hari }}, {{ tanggal }}</span>
      </div>
      <div class="flex items-center gap-3">
        <button @click="toggleDark" class="rounded-full p-2 hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/40 transition">
          <svg v-if="!isDark" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="5"/><path d="M11 1v2M11 19v2M4.22 4.22l1.42 1.42M16.36 16.36l1.42 1.42M1 11h2M19 11h2M4.22 17.78l1.42-1.42M16.36 7.64l1.42-1.42"/></svg>
          <svg v-else width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"/></svg>
        </button>
        <NuxtLink to="/login" class="bg-primary text-white px-5 py-2 rounded-xl font-bold hover:bg-dark shadow transition">Login</NuxtLink>
      </div>
    </nav>

    <!-- HERO -->
    <section class="flex flex-col items-center justify-center text-center py-14 md:py-24 px-4">
      <h1 class="text-3xl md:text-5xl font-extrabold text-dark dark:text-accent mb-5 drop-shadow">
        Selamat Datang di <span class="text-primary dark:text-tosca">PointMap Polnep</span>
      </h1>
      <p class="max-w-2xl mx-auto text-lg md:text-xl text-primary dark:text-tosca mb-7">
        Temukan kampus Politeknik Negeri Pontianak secara interaktif! Jelajahi gedung, lab, dan fasilitas favoritmu lewat peta digital yang mudah dan selalu update.<br>
        <span class="font-bold text-dark dark:text-accent">PointMap Polnep</span> bikin eksplorasi kampus lebih seru!
      </p>

      <!-- STATISTIK PENGUNJUNG -->
      <div class="flex flex-col md:flex-row gap-3 md:gap-6 items-center justify-center mb-10">
        <div class="stat-card"><span class="text-2xl font-bold text-primary">{{ statistik.today }}</span><span class="text-xs text-dark dark:text-accent">Hari ini</span></div>
        <div class="stat-card"><span class="text-2xl font-bold text-primary">{{ statistik.month }}</span><span class="text-xs text-dark dark:text-accent">Bulan ini</span></div>
        <div class="stat-card"><span class="text-2xl font-bold text-tosca">{{ onlineNow }}</span><span class="text-xs text-dark dark:text-accent">Online</span></div>
      </div>

      <!-- BUTTON SCROLL -->
      <button @click="scrollToMap" class="mt-2 group flex flex-col items-center mx-auto">
        <span class="bg-primary text-white px-8 py-3 rounded-xl text-lg font-extrabold shadow-lg border-b-4 border-dark animate-bounce transition">
          Scroll
        </span>
        <svg class="mt-2 animate-bounce" width="28" height="28" fill="none" stroke="#34729C" stroke-width="3">
          <path d="M4 10l10 10 10-10"/>
        </svg>
      </button>
    </section>

    <!-- MAP / CANVAS AREA -->
    <section ref="mapArea" class="mt-10 max-w-3xl mx-auto w-full min-h-[340px] flex flex-col items-center justify-center bg-white/70 rounded-2xl shadow-xl border-2 border-accent dark:bg-dark/70">
      <div class="py-14 text-xl text-primary dark:text-tosca font-semibold text-center">
        Pilih lokasi pada peta untuk info detail<br />
        <span class="text-xs font-normal text-dark/60 dark:text-accent/70">*Map interaktif akan segera tersedia</span>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
const isDark = ref(false)
const cuaca = ref(null)
const hari = ref('')
const tanggal = ref('')
const statistik = ref({ today: 0, month: 0 })
const onlineNow = ref(5)
const mapArea = ref(null)

// Cuaca Pontianak dengan OpenWeatherMap (API Key fallback)
const fetchCuaca = async () => {
  const apiKeys = [
    '3de9464f7cd6c93edc45ca3b8f2188fd',
    '6bab95d7682c72e011f702d3b9443257'
  ]
  let temp = null
  for (const key of apiKeys) {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=Pontianak,id&appid=${key}&units=metric`
      const res = await fetch(url)
      const data = await res.json()
      if (data.main && typeof data.main.temp === 'number') {
        temp = Math.round(data.main.temp) + '°C'
        break
      }
    } catch (e) { /* next key */ }
  }
  cuaca.value = temp || 'N/A'
}

const getTanggal = () => {
  const d = new Date()
  const bulan = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ]
  const hariArr = [
    "Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"
  ]
  hari.value = hariArr[d.getDay()]
  tanggal.value = d.getDate() + " " + bulan[d.getMonth()] + " " + d.getFullYear()
}

const fetchStatistik = async () => {
  try {
    const res = await fetch('http://localhost:3001/api/log/statistik')
    const data = await res.json()
    statistik.value.today = data.today || 0
    statistik.value.month = data.month || 0
  } catch {
    statistik.value.today = 0
    statistik.value.month = 0
  }
  onlineNow.value = Math.floor(3 + Math.random() * 6)
}

const toggleDark = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
}
const scrollToMap = () => {
  mapArea.value.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => {
  fetchCuaca()
  getTanggal()
  fetchStatistik()
})
</script>

<style>
.stat-card {
  @apply flex flex-col items-center justify-center px-5 py-3 rounded-xl shadow bg-white border-2 border-accent min-w-[100px];
}
.dark .stat-card {
  @apply bg-primary/30 border-toscaLight text-accent;
}
</style>
