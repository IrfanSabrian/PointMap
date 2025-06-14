<template>
  <div
    class="flex min-h-screen bg-gradient-to-tr from-accent via-white to-toscaLight"
  >
    <!-- SIDEBAR MOBILE OVERLAY -->
    <transition name="fade">
      <aside v-if="sidebarMobile" class="fixed inset-0 z-40 md:hidden">
        <div
          class="fixed inset-0 bg-black/40 z-0"
          @click="sidebarMobile = false"
        ></div>
        <div
          class="fixed left-0 top-0 w-64 h-full bg-primary text-white px-5 py-8 shadow-2xl flex flex-col animate-slideInLeft z-10"
        >
          <button class="self-end text-3xl mb-4" @click="sidebarMobile = false">
            &times;
          </button>
          <!-- Logo dan Header -->
          <div class="flex items-center mb-8 gap-2">
            <div
              class="rounded-full bg-white text-primary font-bold w-12 h-12 flex items-center justify-center shadow-lg"
            >
              <svg width="30" height="30" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="24" fill="#34729C" />
                <text
                  x="50%"
                  y="56%"
                  text-anchor="middle"
                  fill="white"
                  font-size="18"
                  font-family="Arial"
                  dy=".3em"
                >
                  PM
                </text>
              </svg>
            </div>
            <div class="ml-2 font-extrabold text-lg leading-tight">
              Admin<br /><span class="text-tosca text-xs font-bold"
                >PointMap</span
              >
            </div>
          </div>
          <nav class="flex flex-col gap-3 mt-2">
            <button
              :class="[
                'flex items-center gap-3 py-2 px-4 rounded-xl font-bold transition',
                currentTab === 'dashboard'
                  ? 'bg-white/20 ring-2 ring-accent text-tosca'
                  : 'hover:bg-white/10',
              ]"
              @click="
                currentTab = 'dashboard';
                sidebarMobile = false;
              "
            >
              Dashboard
            </button>
            <button
              :class="[
                'flex items-center gap-3 py-2 px-4 rounded-xl font-bold transition',
                currentTab === 'statistik'
                  ? 'bg-white/20 ring-2 ring-accent text-tosca'
                  : 'hover:bg-white/10',
              ]"
              @click="
                currentTab = 'statistik';
                sidebarMobile = false;
              "
            >
              Statistik
            </button>
          </nav>
          <div class="flex-1"></div>
          <button
            @click="logout"
            class="bg-red-500 w-full py-2 rounded-xl font-bold hover:bg-red-600 shadow mt-8 transition flex items-center justify-center gap-2"
          >
            Logout
          </button>
        </div>
      </aside>
    </transition>
    <!-- SIDEBAR DESKTOP -->
    <aside
      class="hidden md:flex flex-col w-56 bg-primary text-white px-5 py-8 rounded-tr-3xl shadow-2xl h-screen"
    >
      <!-- Logo dan Header -->
      <div class="flex items-center mb-8 gap-2">
        <div
          class="rounded-full bg-white text-primary font-bold w-12 h-12 flex items-center justify-center shadow-lg"
        >
          <svg width="30" height="30" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="24" fill="#34729C" />
            <text
              x="50%"
              y="56%"
              text-anchor="middle"
              fill="white"
              font-size="18"
              font-family="Arial"
              dy=".3em"
            >
              PM
            </text>
          </svg>
        </div>
        <div class="ml-2 font-extrabold text-lg leading-tight">
          Admin<br /><span class="text-tosca text-xs font-bold">PointMap</span>
        </div>
      </div>
      <nav class="flex flex-col gap-3 mt-2">
        <button
          :class="[
            'flex items-center gap-3 py-2 px-4 rounded-xl font-bold transition',
            currentTab === 'dashboard'
              ? 'bg-white/20 ring-2 ring-accent text-tosca'
              : 'hover:bg-white/10',
          ]"
          @click="currentTab = 'dashboard'"
        >
          Dashboard
        </button>
        <button
          :class="[
            'flex items-center gap-3 py-2 px-4 rounded-xl font-bold transition',
            currentTab === 'statistik'
              ? 'bg-white/20 ring-2 ring-accent text-tosca'
              : 'hover:bg-white/10',
          ]"
          @click="currentTab = 'statistik'"
        >
          Statistik
        </button>
      </nav>
      <div class="flex-1"></div>
      <button
        @click="logout"
        class="bg-red-500 w-full py-2 rounded-xl font-bold hover:bg-red-600 shadow mt-8 transition flex items-center justify-center gap-2"
      >
        Logout
      </button>
    </aside>
    <!-- MAIN -->
    <main class="flex-1 min-h-screen p-3 sm:p-4 md:p-6 flex flex-col">
      <!-- HEADER -->
      <header
        class="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-2"
      >
        <div class="flex items-center gap-2">
          <button
            class="md:hidden text-2xl p-2 rounded-lg hover:bg-accent/30 transition"
            @click="sidebarMobile = true"
          >
            <svg
              width="28"
              height="28"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>
          <div>
            <h1 class="text-2xl font-extrabold text-dark">
              {{
                currentTab === "dashboard"
                  ? "Dashboard Admin"
                  : "Statistik Pengunjung"
              }}
            </h1>
            <div class="text-xs text-primary">
              {{
                currentTab === "dashboard"
                  ? "Kelola Gedung, Lantai, dan Ruangan Polnep"
                  : "Grafik statistik kunjungan aplikasi PointMap"
              }}
            </div>
          </div>
        </div>
        <button
          v-if="currentTab === 'dashboard'"
          @click="openForm('gedung')"
          class="bg-primary text-white px-5 py-2 rounded-xl font-bold shadow hover:bg-dark transition"
        >
          + Gedung Baru
        </button>
      </header>

      <!-- TOAST SUKSES -->
      <transition name="slide-fade">
        <div
          v-if="toast.show"
          class="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-white shadow-lg px-6 py-3 rounded-xl border-2 border-tosca font-semibold text-dark text-base animate-bounceIn"
        >
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="12" fill="#6EC1D1" />
            <path
              d="M7 13l3 3 6-6"
              stroke="#fff"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span>{{ toast.msg }}</span>
        </div>
      </transition>

      <!-- DASHBOARD / STATISTIK -->
      <div
        v-if="currentTab === 'dashboard'"
        class="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow"
      >
        <!-- GEDUNG LIST -->
        <section class="bg-white rounded-xl shadow-lg p-5 flex flex-col">
          <div class="flex flex-col gap-2 mb-2">
            <div class="flex items-center justify-between">
              <h2 class="font-bold text-primary text-lg">Gedung</h2>
              <input
                v-model="searchGedung"
                type="text"
                placeholder="Cari gedung..."
                class="input w-40 ml-2"
              />
            </div>
          </div>
          <div class="overflow-auto flex-1">
            <ul class="space-y-4">
              <li
                v-for="g in filteredGedung"
                :key="g.id"
                :class="[
                  'relative p-5 flex justify-between items-center rounded-2xl border-2 transition-all duration-300 shadow',
                  gedung && gedung.id === g.id
                    ? 'border-primary bg-accent/70 shadow-lg ring-4 ring-primary ring-opacity-30'
                    : 'border-accent bg-accent/30 hover:border-primary hover:bg-accent/50',
                ]"
                @click="selectGedung(g)"
                style="cursor: pointer"
              >
                <div>
                  <div
                    class="font-bold text-lg text-dark group-hover:text-primary"
                  >
                    {{ g.nama }}
                  </div>
                  <div class="text-xs text-primary">Kode: {{ g.kode }}</div>
                </div>
                <div class="flex flex-col items-end gap-2">
                  <button
                    @click.stop="editEntity('gedung', g)"
                    class="btn-icon bg-tosca"
                    aria-label="Edit"
                  >
                    <svg
                      width="18"
                      height="18"
                      stroke="currentColor"
                      fill="none"
                      stroke-width="2"
                    >
                      <use xlink:href="#edit-3"></use>
                    </svg>
                  </button>
                  <button
                    @click.stop="deleteEntity('gedung', g)"
                    class="btn-icon bg-red-400"
                    aria-label="Hapus"
                  >
                    <svg
                      width="18"
                      height="18"
                      stroke="currentColor"
                      fill="none"
                      stroke-width="2"
                    >
                      <use xlink:href="#trash-2"></use>
                    </svg>
                  </button>
                </div>
              </li>
            </ul>
            <div
              v-if="!filteredGedung.length"
              class="text-center text-gray-400 py-8"
            >
              Tidak ditemukan.
            </div>
          </div>
        </section>
        <!-- LANTAI LIST -->
        <section class="bg-white rounded-xl shadow-lg p-5 flex flex-col">
          <div class="flex flex-col gap-2 mb-2">
            <div class="flex items-center justify-between">
              <h2 class="font-bold text-secondary text-lg">Lantai</h2>
              <input
                v-model="searchLantai"
                type="text"
                placeholder="Cari lantai..."
                class="input w-32 ml-2"
              />
              <button
                @click="openForm('lantai')"
                :disabled="!gedung"
                class="bg-secondary text-white px-3 py-1 rounded-xl font-bold hover:bg-tosca transition disabled:opacity-60 ml-2"
              >
                + Lantai
              </button>
            </div>
          </div>
          <div v-if="gedung" class="overflow-auto flex-1">
            <ul class="space-y-4">
              <li
                v-for="l in filteredLantai"
                :key="l.id"
                :class="[
                  'relative p-5 flex justify-between items-center rounded-2xl border-2 transition-all duration-300 shadow',
                  lantai && lantai.id === l.id
                    ? 'border-secondary bg-toscaLight/80 shadow-lg ring-4 ring-secondary ring-opacity-30'
                    : 'border-toscaLight bg-toscaLight/40 hover:border-secondary hover:bg-toscaLight/70',
                ]"
                @click="selectLantai(l)"
                style="cursor: pointer"
              >
                <div>
                  <div class="font-bold text-dark group-hover:text-secondary">
                    Lantai {{ l.nomor_lantai }}
                  </div>
                  <div class="text-xs text-primary">{{ l.nama_lantai }}</div>
                </div>
                <div class="flex flex-col items-end gap-2">
                  <button
                    @click.stop="editEntity('lantai', l)"
                    class="btn-icon bg-tosca"
                    aria-label="Edit"
                  >
                    <svg
                      width="18"
                      height="18"
                      stroke="currentColor"
                      fill="none"
                      stroke-width="2"
                    >
                      <use xlink:href="#edit-3"></use>
                    </svg>
                  </button>
                  <button
                    @click.stop="deleteEntity('lantai', l)"
                    class="btn-icon bg-red-400"
                    aria-label="Hapus"
                  >
                    <svg
                      width="18"
                      height="18"
                      stroke="currentColor"
                      fill="none"
                      stroke-width="2"
                    >
                      <use xlink:href="#trash-2"></use>
                    </svg>
                  </button>
                </div>
              </li>
            </ul>
            <div
              v-if="!filteredLantai.length"
              class="text-center text-gray-400 py-8"
            >
              Tidak ditemukan.
            </div>
          </div>
          <div v-else class="text-gray-400 py-8 text-center">
            Pilih gedung dulu.
          </div>
        </section>
        <!-- RUANGAN LIST -->
        <section class="bg-white rounded-xl shadow-lg p-5 flex flex-col">
          <div class="flex flex-col gap-2 mb-2">
            <div class="flex items-center justify-between">
              <h2 class="font-bold text-tosca text-lg">Ruangan</h2>
              <input
                v-model="searchRuangan"
                type="text"
                placeholder="Cari ruangan..."
                class="input w-32 ml-2"
              />
              <button
                @click="openForm('ruangan')"
                :disabled="!lantai"
                class="bg-tosca text-white px-3 py-1 rounded-xl font-bold hover:bg-secondary transition disabled:opacity-60 ml-2"
              >
                + Ruangan
              </button>
            </div>
          </div>
          <div v-if="lantai" class="overflow-auto flex-1">
            <ul class="space-y-4">
              <li
                v-for="r in filteredRuangan"
                :key="r.id"
                :class="[
                  'relative p-5 flex flex-col rounded-2xl border-2 transition-all duration-300 shadow',
                  ruangan && ruangan.id === r.id
                    ? 'border-tosca bg-toscaLight/80 shadow-lg ring-4 ring-tosca ring-opacity-30'
                    : 'border-toscaLight bg-toscaLight/40 hover:border-tosca hover:bg-toscaLight/70',
                ]"
                @click="selectRuangan(r)"
                style="cursor: pointer"
              >
                <div class="font-bold text-dark">{{ r.nama_ruangan }}</div>
                <div class="text-xs text-primary mb-1">
                  Fungsi: {{ r.fungsi || "-" }}
                </div>
                <div class="text-xs text-tosca">
                  x: {{ r.x_pixel }}, y: {{ r.y_pixel }}
                </div>
                <div class="flex gap-2 mt-2 self-end">
                  <button
                    @click.stop="editEntity('ruangan', r)"
                    class="btn-icon bg-tosca"
                    aria-label="Edit"
                  >
                    <svg
                      width="18"
                      height="18"
                      stroke="currentColor"
                      fill="none"
                      stroke-width="2"
                    >
                      <use xlink:href="#edit-3"></use>
                    </svg>
                  </button>
                  <button
                    @click.stop="deleteEntity('ruangan', r)"
                    class="btn-icon bg-red-400"
                    aria-label="Hapus"
                  >
                    <svg
                      width="18"
                      height="18"
                      stroke="currentColor"
                      fill="none"
                      stroke-width="2"
                    >
                      <use xlink:href="#trash-2"></use>
                    </svg>
                  </button>
                </div>
              </li>
            </ul>
            <div
              v-if="!filteredRuangan.length"
              class="text-center text-gray-400 py-8"
            >
              Tidak ditemukan.
            </div>
          </div>
          <div v-else class="text-gray-400 py-8 text-center">
            Pilih lantai dulu.
          </div>
        </section>
      </div>

      <!-- HALAMAN STATISTIK -->
      <div v-if="currentTab === 'statistik'" class="max-w-3xl mx-auto w-full">
        <div
          class="rounded-2xl bg-white shadow-xl p-8 border-2 border-toscaLight"
        >
          <h2 class="text-xl font-bold mb-6 text-tosca flex items-center gap-2">
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <use xlink:href="#bar-chart"></use>
            </svg>
            Statistik Pengunjung PointMap
          </h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div
              v-for="s in statCards"
              :key="s.label"
              class="rounded-2xl bg-accent/40 shadow flex flex-col items-center px-4 py-2 border-2 border-toscaLight min-w-[80px]"
            >
              <div class="font-bold text-lg text-dark">{{ s.value }}</div>
              <div class="text-xs text-tosca font-semibold">{{ s.label }}</div>
            </div>
          </div>
          <!-- Diagram Statistik (Bar Chart) -->
          <BarChart :data-stat="statChartData" />
        </div>
      </div>

      <!-- MODAL CRUD pakai Headless UI -->
      <TransitionRoot appear :show="modal.show" as="template">
        <Dialog as="div" class="relative z-50" @close="closeForm">
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 scale-90"
            enter-to="opacity-100 scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-90"
          >
            <div class="fixed inset-0 flex items-center justify-center p-4">
              <DialogPanel
                class="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border-t-4 relative"
                :class="{
                  'border-primary': modal.type === 'gedung',
                  'border-secondary': modal.type === 'lantai',
                  'border-tosca': modal.type === 'ruangan',
                }"
              >
                <DialogTitle
                  class="font-bold text-lg mb-6 text-primary capitalize"
                >
                  {{ modal.mode === "edit" ? "Edit" : "Tambah" }}
                  {{ modal.type }}
                </DialogTitle>
                <button
                  class="absolute right-4 top-4 text-3xl text-gray-300 hover:text-primary"
                  @click="closeForm"
                  aria-label="Tutup"
                >
                  &times;
                </button>
                <form @submit.prevent="submitForm" class="space-y-4">
                  <div v-if="modal.type === 'gedung'">
                    <label class="block mb-1 font-semibold text-dark"
                      >Nama Gedung</label
                    >
                    <input
                      v-model="modal.form.nama"
                      required
                      class="input"
                      placeholder="Nama Gedung"
                    />
                    <label class="block mb-1 font-semibold text-dark"
                      >Kode Gedung</label
                    >
                    <input
                      v-model="modal.form.kode"
                      required
                      class="input"
                      placeholder="Kode Gedung"
                    />
                    <label class="block mb-1 font-semibold text-dark"
                      >Jumlah Lantai</label
                    >
                    <input
                      v-model.number="modal.form.jumlah_lantai"
                      type="number"
                      min="1"
                      required
                      class="input"
                      placeholder="Jumlah Lantai"
                    />
                    <label class="block mb-1 font-semibold text-dark"
                      >Jenis Gedung</label
                    >
                    <input
                      v-model="modal.form.jenis_gedung"
                      required
                      class="input"
                      placeholder="Jenis Gedung"
                    />
                    <label class="block mb-1 font-semibold text-dark"
                      >Latitude</label
                    >
                    <input
                      v-model="modal.form.latitude"
                      required
                      class="input"
                      placeholder="Latitude"
                    />
                    <label class="block mb-1 font-semibold text-dark"
                      >Longitude</label
                    >
                    <input
                      v-model="modal.form.longitude"
                      required
                      class="input"
                      placeholder="Longitude"
                    />
                  </div>
                  <div v-if="modal.type === 'lantai'">
                    <label class="block mb-1 font-semibold text-dark"
                      >Nama Lantai</label
                    >
                    <input
                      v-model="modal.form.nama_lantai"
                      required
                      class="input"
                      placeholder="Nama Lantai"
                    />
                    <label class="block mb-1 font-semibold text-dark"
                      >Nomor Lantai</label
                    >
                    <input
                      v-model.number="modal.form.nomor_lantai"
                      type="number"
                      min="1"
                      required
                      class="input"
                      placeholder="Nomor Lantai"
                    />
                  </div>
                  <div v-if="modal.type === 'ruangan'">
                    <label class="block mb-1 font-semibold text-dark"
                      >Nama Ruangan</label
                    >
                    <input
                      v-model="modal.form.nama_ruangan"
                      required
                      class="input"
                      placeholder="Nama Ruangan"
                    />
                    <label class="block mb-1 font-semibold text-dark"
                      >Fungsi</label
                    >
                    <input
                      v-model="modal.form.fungsi"
                      class="input"
                      placeholder="Fungsi"
                    />
                    <label class="block mb-1 font-semibold text-dark"
                      >x_pixel</label
                    >
                    <input
                      v-model.number="modal.form.x_pixel"
                      type="number"
                      min="0"
                      required
                      class="input"
                      placeholder="x_pixel"
                    />
                    <label class="block mb-1 font-semibold text-dark"
                      >y_pixel</label
                    >
                    <input
                      v-model.number="modal.form.y_pixel"
                      type="number"
                      min="0"
                      required
                      class="input"
                      placeholder="y_pixel"
                    />
                  </div>
                  <button
                    class="bg-primary text-white w-full py-2 rounded-xl font-bold hover:bg-dark transition mt-2"
                    type="submit"
                  >
                    {{ modal.mode === "edit" ? "Simpan Perubahan" : "Tambah" }}
                  </button>
                </form>
              </DialogPanel>
            </div>
          </TransitionChild>
        </Dialog>
      </TransitionRoot>

      <!-- SVG ICONS Lucide (inline, ringan, bebas CDN) -->
      <svg xmlns="http://www.w3.org/2000/svg" style="display: none">
        <symbol id="edit-3" viewBox="0 0 24 24">
          <path d="M12 20h9" />
          <path
            d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5Z"
          />
        </symbol>
        <symbol id="trash-2" viewBox="0 0 24 24">
          <path d="M3 6h18" />
          <path
            d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"
          />
        </symbol>
        <symbol id="layout-dashboard" viewBox="0 0 24 24">
          <rect width="7" height="9" x="3" y="3" rx="1" />
          <rect width="7" height="5" x="14" y="3" rx="1" />
          <rect width="7" height="9" x="14" y="12" rx="1" />
          <rect width="7" height="5" x="3" y="16" rx="1" />
        </symbol>
        <symbol id="bar-chart" viewBox="0 0 24 24">
          <line x1="12" x2="12" y1="20" y2="10" />
          <line x1="18" x2="18" y1="20" y2="4" />
          <line x1="6" x2="6" y1="20" y2="16" />
        </symbol>
        <symbol id="log-out" viewBox="0 0 24 24">
          <path d="M9 16l-4-4 4-4" />
          <path d="M5 12h14" />
          <path
            d="M16 17v1a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v1"
          />
        </symbol>
      </svg>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionRoot,
  TransitionChild,
} from "@headlessui/vue";
import BarChart from "~/components/BarChart.vue"; // Buat file komponen ini untuk chart.js!

const router = useRouter();
const gedungList = ref([]);
const lantaiList = ref([]);
const ruanganList = ref([]);

const gedung = ref(null);
const lantai = ref(null);
const ruangan = ref(null);

const searchGedung = ref("");
const searchLantai = ref("");
const searchRuangan = ref("");

const currentTab = ref("dashboard");

// Statistik Pengunjung (didapat dari backend)
const statistik = ref({
  today: 0,
  week: 0,
  month: 0,
  total: 0,
  chart: [0, 0, 0, 0, 0, 0, 0],
});
const statCards = [
  { label: "Hari ini", value: computed(() => statistik.value.today) },
  { label: "Minggu ini", value: computed(() => statistik.value.week) },
  { label: "Bulan ini", value: computed(() => statistik.value.month) },
  { label: "Total", value: computed(() => statistik.value.total) },
];

// Data untuk Chart
const statChartData = computed(() => ({
  labels: ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"],
  datasets: [
    {
      label: "Kunjungan",
      backgroundColor: "#6EC1D1",
      borderColor: "#34729C",
      borderWidth: 2,
      data: statistik.value.chart || [],
    },
  ],
}));

// TOAST animasi centang
const toast = reactive({
  show: false,
  msg: "",
  timer: null,
});
const showToast = (msg) => {
  toast.msg = msg;
  toast.show = true;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => (toast.show = false), 1600);
};

// MODAL
const modal = reactive({
  show: false,
  type: "",
  mode: "",
  form: {},
  entityId: null,
});

// ---- CRUD -----
const fetchGedung = async () => {
  gedungList.value = [];
  const token = localStorage.getItem("token");
  if (!token) return router.push("/login");
  const res = await fetch("http://localhost:3001/api/gedung", {
    headers: { Authorization: `Bearer ${token}` },
  });
  gedungList.value = await res.json();
};
const fetchLantai = async (idGedung) => {
  lantaiList.value = [];
  const token = localStorage.getItem("token");
  if (!token) return;
  const res = await fetch(
    `http://localhost:3001/api/lantai?gedung=${idGedung}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  lantaiList.value = await res.json();
};
const fetchRuangan = async (idLantai) => {
  ruanganList.value = [];
  const token = localStorage.getItem("token");
  if (!token) return;
  const res = await fetch(
    `http://localhost:3001/api/ruangan?lantai=${idLantai}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  ruanganList.value = await res.json();
};

// Fitur Statistik
const fetchStatistik = async () => {
  const token = localStorage.getItem("token");
  if (!token) return;
  const res = await fetch("http://localhost:3001/api/log/statistik", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.ok) {
    const data = await res.json();
    statistik.value = { ...statistik.value, ...data };
  }
};

// ---- SELECT
const selectGedung = (g) => {
  gedung.value = g;
  lantai.value = null;
  ruangan.value = null;
  fetchLantai(g.id);
  ruanganList.value = [];
};
const selectLantai = (l) => {
  lantai.value = l;
  ruangan.value = null;
  fetchRuangan(l.id);
};
const selectRuangan = (r) => {
  ruangan.value = r;
};

function openForm(type) {
  modal.type = type;
  modal.mode = "add";
  modal.form = {};
  if (type === "lantai" && gedung.value) modal.form.id_gedung = gedung.value.id;
  if (type === "ruangan" && gedung.value && lantai.value) {
    modal.form.id_gedung = gedung.value.id;
    modal.form.id_lantai = lantai.value.id;
  }
  modal.show = true;
  modal.entityId = null;
}
function editEntity(type, entity) {
  modal.type = type;
  modal.mode = "edit";
  modal.form = { ...entity };
  modal.show = true;
  modal.entityId = entity.id;
}
function closeForm() {
  modal.show = false;
  modal.type = "";
  modal.form = {};
  modal.entityId = null;
}

async function submitForm() {
  const token = localStorage.getItem("token");
  if (!token) return router.push("/login");
  let url = "",
    method = "",
    body = {};
  if (modal.type === "gedung") {
    url =
      "http://localhost:3001/api/gedung" +
      (modal.mode === "edit" ? `/${modal.entityId}` : "");
    method = modal.mode === "edit" ? "PUT" : "POST";
    body = { ...modal.form };
  }
  if (modal.type === "lantai") {
    url =
      "http://localhost:3001/api/lantai" +
      (modal.mode === "edit" ? `/${modal.entityId}` : "");
    method = modal.mode === "edit" ? "PUT" : "POST";
    body = { ...modal.form };
  }
  if (modal.type === "ruangan") {
    url =
      "http://localhost:3001/api/ruangan" +
      (modal.mode === "edit" ? `/${modal.entityId}` : "");
    method = modal.mode === "edit" ? "PUT" : "POST";
    body = { ...modal.form };
  }
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (res.ok) {
    closeForm();
    showToast(
      modal.mode === "edit"
        ? `Berhasil update ${modal.type}!`
        : `Berhasil tambah ${modal.type}!`
    );
    if (modal.type === "gedung") fetchGedung();
    if (modal.type === "lantai" && gedung.value) fetchLantai(gedung.value.id);
    if (modal.type === "ruangan" && lantai.value) fetchRuangan(lantai.value.id);
    fetchStatistik();
  }
}

async function deleteEntity(type, entity) {
  if (!confirm(`Yakin hapus ${type} ini?`)) return;
  const token = localStorage.getItem("token");
  let url = "";
  if (type === "gedung") url = `http://localhost:3001/api/gedung/${entity.id}`;
  if (type === "lantai") url = `http://localhost:3001/api/lantai/${entity.id}`;
  if (type === "ruangan")
    url = `http://localhost:3001/api/ruangan/${entity.id}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.ok) {
    showToast(`Berhasil hapus ${type}!`);
    if (type === "gedung") fetchGedung();
    if (type === "lantai" && gedung.value) fetchLantai(gedung.value.id);
    if (type === "ruangan" && lantai.value) fetchRuangan(lantai.value.id);
    fetchStatistik();
  }
}

const logout = () => {
  localStorage.removeItem("token");
  router.push("/login");
};

// PENCARIAN
const filteredGedung = computed(() =>
  gedungList.value.filter(
    (g) =>
      !searchGedung.value ||
      g.nama?.toLowerCase().includes(searchGedung.value.toLowerCase()) ||
      g.kode?.toLowerCase().includes(searchGedung.value.toLowerCase())
  )
);
const filteredLantai = computed(() =>
  lantaiList.value.filter(
    (l) =>
      !searchLantai.value ||
      l.nama_lantai?.toLowerCase().includes(searchLantai.value.toLowerCase()) ||
      String(l.nomor_lantai)?.includes(searchLantai.value)
  )
);
const filteredRuangan = computed(() =>
  ruanganList.value.filter(
    (r) =>
      !searchRuangan.value ||
      r.nama_ruangan
        ?.toLowerCase()
        .includes(searchRuangan.value.toLowerCase()) ||
      r.fungsi?.toLowerCase().includes(searchRuangan.value.toLowerCase())
  )
);

const sidebarMobile = ref(false);

onMounted(() => {
  fetchGedung();
  fetchStatistik();
});
</script>

<style>
.input {
  @apply w-full border-2 border-toscaLight px-3 py-2 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition;
}
.btn-icon {
  @apply flex items-center justify-center text-white text-xs font-bold w-8 h-8 rounded-full shadow transition focus:outline-none focus:ring-2 focus:ring-primary/40;
}
.slide-fade-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateY(-10px);
}
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateY(-10px);
  opacity: 0;
}
.animate-bounceIn {
  animation: bounceIn 0.6s;
}
@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  60% {
    opacity: 1;
    transform: scale(1.05);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
.fade-enter-active {
  transition: opacity 0.5s;
}
.fade-leave-active {
  transition: opacity 0.5s;
  opacity: 0;
}
@keyframes slideInLeft {
  0% {
    transform: translateX(-100%);
    opacity: 0.5;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}
.animate-slideInLeft {
  animation: slideInLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
