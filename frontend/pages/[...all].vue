<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-accent via-white to-toscaLight dark:from-dark dark:to-primary text-dark dark:text-accent px-4">
    <div class="flex flex-col items-center">
      <!-- Icon / Ilustrasi -->
      <div class="mb-4">
        <svg width="100" height="100" fill="none" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="58" stroke="#34729C" stroke-width="4" fill="#D1ECFF"/>
          <path d="M40 76 Q60 100 80 76" stroke="#6CB1DA" stroke-width="5" fill="none"/>
          <circle cx="47" cy="57" r="6" fill="#34729C"/>
          <circle cx="73" cy="57" r="6" fill="#34729C"/>
        </svg>
      </div>
      <h1 class="text-5xl font-extrabold mb-2 text-primary dark:text-tosca">404</h1>
      <h2 class="text-2xl font-bold mb-2">Halaman Tidak Ditemukan</h2>
      <p class="mb-7 text-lg max-w-lg text-center">Waduh, sepertinya halaman yang kamu cari tidak tersedia.<br /> Silakan kembali ke halaman utama atau periksa kembali URL-nya.</p>
      <NuxtLink to="/" class="px-8 py-3 rounded-xl bg-primary text-white font-bold text-lg shadow hover:bg-dark transition">
        Kembali ke Beranda
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
// kamu bisa akses error props jika mau tampilkan error tertentu
const props = defineProps({
  error: Object
})
</script>
