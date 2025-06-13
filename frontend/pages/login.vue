<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="w-full max-w-sm p-6 bg-white rounded-xl shadow-lg">
        <h2 class="text-2xl font-bold mb-6 text-center">Admin Login</h2>
        <form @submit.prevent="login">
          <div class="mb-4">
            <label class="block mb-1">Username</label>
            <input
              v-model="username"
              type="text"
              class="w-full border px-3 py-2 rounded focus:outline-none"
              required
            />
          </div>
          <div class="mb-4">
            <label class="block mb-1">Password</label>
            <input
              v-model="password"
              type="password"
              class="w-full border px-3 py-2 rounded focus:outline-none"
              required
            />
          </div>
          <button
            type="submit"
            class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold"
          >
            Login
          </button>
          <div v-if="error" class="mt-3 text-red-600 text-sm text-center">
            {{ error }}
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  
  const username = ref('')
  const password = ref('')
  const error = ref('')
  const router = useRouter()
  
  const login = async () => {
    error.value = ''
    try {
      const { data, error: err } = await useFetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        body: { username: username.value, password: password.value },
      })
  
      if (err.value) {
        error.value = err.value.data?.error || 'Login gagal'
        return
      }
      // Simpan token ke localStorage
      if (data.value.token) {
        localStorage.setItem('token', data.value.token)
        router.push('/dashboard')
      } else {
        error.value = 'Login gagal: token tidak ditemukan'
      }
    } catch (e) {
      error.value = 'Terjadi error jaringan'
    }
  }
  </script>
  