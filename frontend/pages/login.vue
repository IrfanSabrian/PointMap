<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-tr from-primary via-white to-toscaLight">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl px-8 py-10 border-t-4 border-primary relative">
      <!-- LOGO/HEADER -->
      <div class="flex flex-col items-center mb-7">
        <div class="rounded-full bg-accent p-3 shadow-lg mb-2">
          <svg width="42" height="42" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="24" fill="#34729C"/>
            <text x="50%" y="56%" text-anchor="middle" fill="white" font-size="19" font-family="Arial" dy=".3em">PM</text>
          </svg>
        </div>
        <h1 class="text-2xl font-extrabold text-primary">Login Admin</h1>
        <span class="text-xs text-tosca font-bold mt-1">PointMap Polnep</span>
      </div>

      <!-- ALERT ERROR -->
      <transition name="slide-fade">
        <div v-if="errorMsg" class="flex items-center gap-2 bg-red-100 border border-red-300 text-red-700 font-semibold px-4 py-2 rounded-xl mb-5 shadow">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10" cy="10" r="9" stroke="#fb7185"/><path d="M10 6v4m0 4h.01" stroke="#fb7185"/></svg>
          <span>{{ errorMsg }}</span>
        </div>
      </transition>

      <!-- FORM LOGIN -->
      <form @submit.prevent="login" class="space-y-6">
        <div class="relative">
          <input v-model="username" type="text" required id="username" class="input peer" placeholder=" " autofocus />
          <label for="username" class="input-label">Username</label>
        </div>
        <div class="relative">
          <input v-model="password" type="password" required id="password" class="input peer" placeholder=" " />
          <label for="password" class="input-label">Password</label>
        </div>
        <button :disabled="loading"
          class="w-full py-3 rounded-xl font-bold text-lg shadow bg-primary text-white hover:bg-dark transition flex items-center justify-center gap-2 mt-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
        >
          <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
          Login
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

const login = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value })
    })
    const data = await res.json()
    if (res.ok && data.token) {
      localStorage.setItem('token', data.token)
      router.push('/dashboard')
    } else {
      errorMsg.value = data.error || 'Login gagal. Username atau password salah.'
    }
  } catch (err) {
    errorMsg.value = 'Tidak dapat terhubung ke server.'
  }
  loading.value = false
}
</script>

<style>
.input {
  @apply w-full px-4 py-3 border-2 border-toscaLight rounded-xl bg-transparent outline-none text-dark placeholder-transparent focus:border-primary transition;
}
.input-label {
  @apply absolute top-3 left-4 text-tosca pointer-events-none transition-all duration-200;
  font-size: 1rem;
}
.input:focus + .input-label,
.input:not(:placeholder-shown) + .input-label {
  @apply -top-3 left-3 bg-white px-1 text-xs text-primary;
}
.slide-fade-enter-active, .slide-fade-leave-active { transition: all 0.3s cubic-bezier(.4,0,.2,1);}
.slide-fade-enter-from, .slide-fade-leave-to { opacity: 0; transform: translateY(-10px);}
</style>
