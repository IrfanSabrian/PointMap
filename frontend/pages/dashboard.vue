<template>
    <div class="min-h-screen bg-gray-100 py-8 px-2">
      <div class="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 class="text-2xl font-bold mb-4">Dashboard Admin</h1>
        <button @click="logout" class="mb-6 bg-red-500 text-white px-3 py-1 rounded float-right">Logout</button>
        <h2 class="text-xl font-semibold mb-2">Daftar Gedung</h2>
        <ul>
          <li
            v-for="gedung in gedungList"
            :key="gedung.id"
            class="mb-2 p-3 border rounded"
          >
            <div class="font-bold">{{ gedung.nama }}</div>
            <div class="text-sm text-gray-600">Kode: {{ gedung.kode }}, Lantai: {{ gedung.jumlah_lantai }}, Jenis: {{ gedung.jenis_gedung }}</div>
          </li>
        </ul>
        <div v-if="error" class="text-red-600 mt-4">{{ error }}</div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  
  const gedungList = ref([])
  const error = ref('')
  const router = useRouter()
  
  const fetchGedung = async () => {
    error.value = ''
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    try {
      const res = await fetch('http://localhost:3001/api/gedung', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          router.push('/login')
          return
        }
        error.value = 'Gagal fetch data gedung'
        return
      }
      gedungList.value = await res.json()
    } catch (e) {
      error.value = 'Terjadi error jaringan'
    }
  }
  
  const logout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }
  
  onMounted(() => {
    fetchGedung()
  })
  </script>
  