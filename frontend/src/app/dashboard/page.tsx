"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BarChart from "@/components/BarChart";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

interface Gedung {
  id: number;
  nama: string;
  kode: string;
}

interface Lantai {
  id: number;
  nama_lantai: string;
  nomor_lantai: number;
  id_gedung: number;
}

interface Ruangan {
  id: number;
  nama_ruangan: string;
  fungsi: string;
  x_pixel: number;
  y_pixel: number;
  id_lantai: number;
  id_gedung: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [gedungList, setGedungList] = useState<Gedung[]>([]);
  const [lantaiList, setLantaiList] = useState<Lantai[]>([]);
  const [ruanganList, setRuanganList] = useState<Ruangan[]>([]);

  const [gedung, setGedung] = useState<Gedung | null>(null);
  const [lantai, setLantai] = useState<Lantai | null>(null);
  const [ruangan, setRuangan] = useState<Ruangan | null>(null);

  const [searchGedung, setSearchGedung] = useState("");
  const [searchLantai, setSearchLantai] = useState("");
  const [searchRuangan, setSearchRuangan] = useState("");

  const [currentTab, setCurrentTab] = useState("dashboard");
  const [sidebarMobile, setSidebarMobile] = useState(false);

  // Statistik
  const [statistik, setStatistik] = useState({
    today: 0,
    week: 0,
    month: 0,
    total: 0,
    chart: [0, 0, 0, 0, 0, 0, 0],
  });

  // Modal
  const [modal, setModal] = useState({
    show: false,
    type: "",
    mode: "",
    form: {} as any,
    entityId: null as number | null,
  });

  // Toast
  const [toast, setToast] = useState({
    show: false,
    msg: "",
    timer: null as NodeJS.Timeout | null,
  });

  // Fetch Data
  const fetchGedung = async () => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");
    const res = await fetch("http://localhost:3001/api/gedung", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setGedungList(await res.json());
  };

  const fetchLantai = async (idGedung: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const res = await fetch(
      `http://localhost:3001/api/lantai?gedung=${idGedung}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setLantaiList(await res.json());
  };

  const fetchRuangan = async (idLantai: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const res = await fetch(
      `http://localhost:3001/api/ruangan?lantai=${idLantai}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setRuanganList(await res.json());
  };

  const fetchStatistik = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const res = await fetch("http://localhost:3001/api/log/statistik", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setStatistik((prev) => ({ ...prev, ...data }));
    }
  };

  // Handlers
  const selectGedung = (g: Gedung) => {
    setGedung(g);
    setLantai(null);
    setRuangan(null);
    fetchLantai(g.id);
    setRuanganList([]);
  };

  const selectLantai = (l: Lantai) => {
    setLantai(l);
    setRuangan(null);
    fetchRuangan(l.id);
  };

  const selectRuangan = (r: Ruangan) => {
    setRuangan(r);
  };

  const openForm = (type: string) => {
    setModal({
      show: true,
      type,
      mode: "add",
      form:
        type === "lantai" && gedung
          ? { id_gedung: gedung.id }
          : type === "ruangan" && gedung && lantai
          ? { id_gedung: gedung.id, id_lantai: lantai.id }
          : {},
      entityId: null,
    });
  };

  const editEntity = (type: string, entity: any) => {
    setModal({
      show: true,
      type,
      mode: "edit",
      form: { ...entity },
      entityId: entity.id,
    });
  };

  const closeForm = () => {
    setModal({
      show: false,
      type: "",
      form: {},
      mode: "",
      entityId: null,
    });
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    let url = "";
    let method = "";
    let body = {};

    if (modal.type === "gedung") {
      url = `http://localhost:3001/api/gedung${
        modal.mode === "edit" ? `/${modal.entityId}` : ""
      }`;
      method = modal.mode === "edit" ? "PUT" : "POST";
      body = { ...modal.form };
    }
    if (modal.type === "lantai") {
      url = `http://localhost:3001/api/lantai${
        modal.mode === "edit" ? `/${modal.entityId}` : ""
      }`;
      method = modal.mode === "edit" ? "PUT" : "POST";
      body = { ...modal.form };
    }
    if (modal.type === "ruangan") {
      url = `http://localhost:3001/api/ruangan${
        modal.mode === "edit" ? `/${modal.entityId}` : ""
      }`;
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
      if (modal.type === "lantai" && gedung) fetchLantai(gedung.id);
      if (modal.type === "ruangan" && lantai) fetchRuangan(lantai.id);
      fetchStatistik();
    }
  };

  const deleteEntity = async (type: string, entity: any) => {
    if (!confirm(`Yakin hapus ${type} ini?`)) return;
    const token = localStorage.getItem("token");
    let url = "";
    if (type === "gedung")
      url = `http://localhost:3001/api/gedung/${entity.id}`;
    if (type === "lantai")
      url = `http://localhost:3001/api/lantai/${entity.id}`;
    if (type === "ruangan")
      url = `http://localhost:3001/api/ruangan/${entity.id}`;

    const res = await fetch(url, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      showToast(`Berhasil hapus ${type}!`);
      if (type === "gedung") fetchGedung();
      if (type === "lantai" && gedung) fetchLantai(gedung.id);
      if (type === "ruangan" && lantai) fetchRuangan(lantai.id);
      fetchStatistik();
    }
  };

  const showToast = (msg: string) => {
    setToast((prev) => ({
      msg,
      show: true,
      timer: setTimeout(
        () => setToast((prev) => ({ ...prev, show: false })),
        1600
      ),
    }));
  };

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  // Filtered Lists
  const filteredGedung = gedungList.filter(
    (g) =>
      !searchGedung ||
      g.nama?.toLowerCase().includes(searchGedung.toLowerCase()) ||
      g.kode?.toLowerCase().includes(searchGedung.toLowerCase())
  );

  const filteredLantai = lantaiList.filter(
    (l) =>
      !searchLantai ||
      l.nama_lantai?.toLowerCase().includes(searchLantai.toLowerCase()) ||
      String(l.nomor_lantai)?.includes(searchLantai)
  );

  const filteredRuangan = ruanganList.filter(
    (r) =>
      !searchRuangan ||
      r.nama_ruangan?.toLowerCase().includes(searchRuangan.toLowerCase()) ||
      r.fungsi?.toLowerCase().includes(searchRuangan.toLowerCase())
  );

  // Statistik Data
  const statChartData = {
    labels: ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"],
    datasets: [
      {
        label: "Kunjungan",
        backgroundColor: "#6EC1D1",
        borderColor: "#34729C",
        borderWidth: 2,
        data: statistik.chart || [],
      },
    ],
  };

  useEffect(() => {
    fetchGedung();
    fetchStatistik();
  }, []);

  return (
    <div className="flex min-h-screen bg-gradient-to-tr from-accent via-white to-toscaLight">
      {/* SIDEBAR MOBILE OVERLAY */}
      <Transition show={sidebarMobile} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-40 md:hidden"
          onClose={() => setSidebarMobile(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-300"
                  enterFrom="-translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-300"
                  leaveFrom="translate-x-0"
                  leaveTo="-translate-x-full"
                >
                  <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                    <div className="flex h-full flex-col bg-primary text-white px-5 py-8 shadow-2xl">
                      <button
                        className="self-end text-3xl mb-4"
                        onClick={() => setSidebarMobile(false)}
                      >
                        &times;
                      </button>
                      {/* Logo dan Header */}
                      <div className="flex items-center mb-8 gap-2">
                        <div className="rounded-full bg-white text-primary font-bold w-12 h-12 flex items-center justify-center shadow-lg">
                          <svg width="30" height="30" viewBox="0 0 48 48">
                            <circle cx="24" cy="24" r="24" fill="#34729C" />
                            <text
                              x="50%"
                              y="56%"
                              textAnchor="middle"
                              fill="white"
                              fontSize="18"
                              fontFamily="Arial"
                              dy=".3em"
                            >
                              PM
                            </text>
                          </svg>
                        </div>
                        <div className="ml-2 font-extrabold text-lg leading-tight">
                          Admin
                          <br />
                          <span className="text-tosca text-xs font-bold">
                            PointMap
                          </span>
                        </div>
                      </div>
                      <nav className="flex flex-col gap-3 mt-2">
                        <button
                          className={`flex items-center gap-3 py-2 px-4 rounded-xl font-bold transition ${
                            currentTab === "dashboard"
                              ? "bg-white/20 ring-2 ring-accent text-tosca"
                              : "hover:bg-white/10"
                          }`}
                          onClick={() => {
                            setCurrentTab("dashboard");
                            setSidebarMobile(false);
                          }}
                        >
                          Dashboard
                        </button>
                        <button
                          className={`flex items-center gap-3 py-2 px-4 rounded-xl font-bold transition ${
                            currentTab === "statistik"
                              ? "bg-white/20 ring-2 ring-accent text-tosca"
                              : "hover:bg-white/10"
                          }`}
                          onClick={() => {
                            setCurrentTab("statistik");
                            setSidebarMobile(false);
                          }}
                        >
                          Statistik
                        </button>
                      </nav>
                      <div className="flex-1" />
                      <button
                        onClick={logout}
                        className="bg-red-500 w-full py-2 rounded-xl font-bold hover:bg-red-600 shadow mt-8 transition flex items-center justify-center gap-2"
                      >
                        Logout
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* SIDEBAR DESKTOP */}
      <aside className="hidden md:flex flex-col w-56 bg-primary text-white px-5 py-8 rounded-tr-3xl shadow-2xl h-screen">
        {/* Logo dan Header */}
        <div className="flex items-center mb-8 gap-2">
          <div className="rounded-full bg-white text-primary font-bold w-12 h-12 flex items-center justify-center shadow-lg">
            <svg width="30" height="30" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="24" fill="#34729C" />
              <text
                x="50%"
                y="56%"
                textAnchor="middle"
                fill="white"
                fontSize="18"
                fontFamily="Arial"
                dy=".3em"
              >
                PM
              </text>
            </svg>
          </div>
          <div className="ml-2 font-extrabold text-lg leading-tight">
            Admin
            <br />
            <span className="text-tosca text-xs font-bold">PointMap</span>
          </div>
        </div>
        <nav className="flex flex-col gap-3 mt-2">
          <button
            className={`flex items-center gap-3 py-2 px-4 rounded-xl font-bold transition ${
              currentTab === "dashboard"
                ? "bg-white/20 ring-2 ring-accent text-tosca"
                : "hover:bg-white/10"
            }`}
            onClick={() => setCurrentTab("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={`flex items-center gap-3 py-2 px-4 rounded-xl font-bold transition ${
              currentTab === "statistik"
                ? "bg-white/20 ring-2 ring-accent text-tosca"
                : "hover:bg-white/10"
            }`}
            onClick={() => setCurrentTab("statistik")}
          >
            Statistik
          </button>
        </nav>
        <div className="flex-1" />
        <button
          onClick={logout}
          className="bg-red-500 w-full py-2 rounded-xl font-bold hover:bg-red-600 shadow mt-8 transition flex items-center justify-center gap-2"
        >
          Logout
        </button>
      </aside>

      {/* MAIN */}
      <main className="flex-1 min-h-screen p-3 sm:p-4 md:p-6 flex flex-col">
        {/* HEADER */}
        <header className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              className="md:hidden text-2xl p-2 rounded-lg hover:bg-accent/30 transition"
              onClick={() => setSidebarMobile(true)}
            >
              <svg
                width="28"
                height="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-dark">
                {currentTab === "dashboard"
                  ? "Dashboard Admin"
                  : "Statistik Pengunjung"}
              </h1>
              <div className="text-xs text-primary">
                {currentTab === "dashboard"
                  ? "Kelola Gedung, Lantai, dan Ruangan Polnep"
                  : "Grafik statistik kunjungan aplikasi PointMap"}
              </div>
            </div>
          </div>
          {currentTab === "dashboard" && (
            <button
              onClick={() => openForm("gedung")}
              className="bg-primary text-white px-5 py-2 rounded-xl font-bold shadow hover:bg-dark transition"
            >
              + Gedung Baru
            </button>
          )}
        </header>

        {/* TOAST SUKSES */}
        <Transition
          show={toast.show}
          enter="transition ease-out duration-300"
          enterFrom="transform translate-y-2 opacity-0"
          enterTo="transform translate-y-0 opacity-100"
          leave="transition ease-in duration-200"
          leaveFrom="transform translate-y-0 opacity-100"
          leaveTo="transform translate-y-2 opacity-0"
        >
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-white shadow-lg px-6 py-3 rounded-xl border-2 border-tosca font-semibold text-dark text-base">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="12" fill="#6EC1D1" />
              <path
                d="M7 13l3 3 6-6"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{toast.msg}</span>
          </div>
        </Transition>

        {/* DASHBOARD / STATISTIK */}
        {currentTab === "dashboard" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow">
            {/* GEDUNG LIST */}
            <section className="bg-white rounded-xl shadow-lg p-5 flex flex-col">
              <div className="flex flex-col gap-2 mb-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-primary text-lg">Gedung</h2>
                  <input
                    value={searchGedung}
                    onChange={(e) => setSearchGedung(e.target.value)}
                    type="text"
                    placeholder="Cari gedung..."
                    className="input w-40 ml-2"
                  />
                </div>
              </div>
              <div className="overflow-auto flex-1">
                <ul className="space-y-4">
                  {filteredGedung.map((g) => (
                    <li
                      key={g.id}
                      className={`relative p-5 flex justify-between items-center rounded-2xl border-2 transition-all duration-300 shadow ${
                        gedung && gedung.id === g.id
                          ? "border-primary bg-accent/70 shadow-lg ring-4 ring-primary ring-opacity-30"
                          : "border-accent bg-accent/30 hover:border-primary hover:bg-accent/50"
                      }`}
                      onClick={() => selectGedung(g)}
                      style={{ cursor: "pointer" }}
                    >
                      <div>
                        <div className="font-bold text-lg text-dark group-hover:text-primary">
                          {g.nama}
                        </div>
                        <div className="text-xs text-primary">
                          Kode: {g.kode}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            editEntity("gedung", g);
                          }}
                          className="btn-icon bg-tosca"
                          aria-label="Edit"
                        >
                          <svg
                            width="18"
                            height="18"
                            stroke="currentColor"
                            fill="none"
                            strokeWidth="2"
                          >
                            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5Z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteEntity("gedung", g);
                          }}
                          className="btn-icon bg-red-400"
                          aria-label="Hapus"
                        >
                          <svg
                            width="18"
                            height="18"
                            stroke="currentColor"
                            fill="none"
                            strokeWidth="2"
                          >
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </li>
                  ))}
                  {!filteredGedung.length && (
                    <div className="text-center text-gray-400 py-8">
                      Tidak ditemukan.
                    </div>
                  )}
                </ul>
              </div>
            </section>

            {/* LANTAI LIST */}
            <section className="bg-white rounded-xl shadow-lg p-5 flex flex-col">
              <div className="flex flex-col gap-2 mb-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-secondary text-lg">Lantai</h2>
                  <input
                    value={searchLantai}
                    onChange={(e) => setSearchLantai(e.target.value)}
                    type="text"
                    placeholder="Cari lantai..."
                    className="input w-32 ml-2"
                  />
                  <button
                    onClick={() => openForm("lantai")}
                    disabled={!gedung}
                    className="bg-secondary text-white px-3 py-1 rounded-xl font-bold hover:bg-tosca transition disabled:opacity-60 ml-2"
                  >
                    + Lantai
                  </button>
                </div>
              </div>
              {gedung ? (
                <div className="overflow-auto flex-1">
                  <ul className="space-y-4">
                    {filteredLantai.map((l) => (
                      <li
                        key={l.id}
                        className={`relative p-5 flex justify-between items-center rounded-2xl border-2 transition-all duration-300 shadow ${
                          lantai && lantai.id === l.id
                            ? "border-secondary bg-toscaLight/80 shadow-lg ring-4 ring-secondary ring-opacity-30"
                            : "border-toscaLight bg-toscaLight/40 hover:border-secondary hover:bg-toscaLight/70"
                        }`}
                        onClick={() => selectLantai(l)}
                        style={{ cursor: "pointer" }}
                      >
                        <div>
                          <div className="font-bold text-dark group-hover:text-secondary">
                            Lantai {l.nomor_lantai}
                          </div>
                          <div className="text-xs text-primary">
                            {l.nama_lantai}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              editEntity("lantai", l);
                            }}
                            className="btn-icon bg-tosca"
                            aria-label="Edit"
                          >
                            <svg
                              width="18"
                              height="18"
                              stroke="currentColor"
                              fill="none"
                              strokeWidth="2"
                            >
                              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5Z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteEntity("lantai", l);
                            }}
                            className="btn-icon bg-red-400"
                            aria-label="Hapus"
                          >
                            <svg
                              width="18"
                              height="18"
                              stroke="currentColor"
                              fill="none"
                              strokeWidth="2"
                            >
                              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </li>
                    ))}
                    {!filteredLantai.length && (
                      <div className="text-center text-gray-400 py-8">
                        Tidak ditemukan.
                      </div>
                    )}
                  </ul>
                </div>
              ) : (
                <div className="text-gray-400 py-8 text-center">
                  Pilih gedung dulu.
                </div>
              )}
            </section>

            {/* RUANGAN LIST */}
            <section className="bg-white rounded-xl shadow-lg p-5 flex flex-col">
              <div className="flex flex-col gap-2 mb-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-tosca text-lg">Ruangan</h2>
                  <input
                    value={searchRuangan}
                    onChange={(e) => setSearchRuangan(e.target.value)}
                    type="text"
                    placeholder="Cari ruangan..."
                    className="input w-32 ml-2"
                  />
                  <button
                    onClick={() => openForm("ruangan")}
                    disabled={!lantai}
                    className="bg-tosca text-white px-3 py-1 rounded-xl font-bold hover:bg-secondary transition disabled:opacity-60 ml-2"
                  >
                    + Ruangan
                  </button>
                </div>
              </div>
              {lantai ? (
                <div className="overflow-auto flex-1">
                  <ul className="space-y-4">
                    {filteredRuangan.map((r) => (
                      <li
                        key={r.id}
                        className={`relative p-5 flex flex-col rounded-2xl border-2 transition-all duration-300 shadow ${
                          ruangan && ruangan.id === r.id
                            ? "border-tosca bg-toscaLight/80 shadow-lg ring-4 ring-tosca ring-opacity-30"
                            : "border-toscaLight bg-toscaLight/40 hover:border-tosca hover:bg-toscaLight/70"
                        }`}
                        onClick={() => selectRuangan(r)}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="font-bold text-dark">
                          {r.nama_ruangan}
                        </div>
                        <div className="text-xs text-primary mb-1">
                          Fungsi: {r.fungsi || "-"}
                        </div>
                        <div className="text-xs text-tosca">
                          x: {r.x_pixel}, y: {r.y_pixel}
                        </div>
                        <div className="flex gap-2 mt-2 self-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              editEntity("ruangan", r);
                            }}
                            className="btn-icon bg-tosca"
                            aria-label="Edit"
                          >
                            <svg
                              width="18"
                              height="18"
                              stroke="currentColor"
                              fill="none"
                              strokeWidth="2"
                            >
                              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5Z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteEntity("ruangan", r);
                            }}
                            className="btn-icon bg-red-400"
                            aria-label="Hapus"
                          >
                            <svg
                              width="18"
                              height="18"
                              stroke="currentColor"
                              fill="none"
                              strokeWidth="2"
                            >
                              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </li>
                    ))}
                    {!filteredRuangan.length && (
                      <div className="text-center text-gray-400 py-8">
                        Tidak ditemukan.
                      </div>
                    )}
                  </ul>
                </div>
              ) : (
                <div className="text-gray-400 py-8 text-center">
                  Pilih lantai dulu.
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto w-full">
            <div className="rounded-2xl bg-white shadow-xl p-8 border-2 border-toscaLight">
              <h2 className="text-xl font-bold mb-6 text-tosca flex items-center gap-2">
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="12" x2="12" y1="20" y2="10" />
                  <line x1="18" x2="18" y1="20" y2="4" />
                  <line x1="6" x2="6" y1="20" y2="16" />
                </svg>
                Statistik Pengunjung PointMap
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="rounded-2xl bg-accent/40 shadow flex flex-col items-center px-4 py-2 border-2 border-toscaLight min-w-[80px]">
                  <div className="font-bold text-lg text-dark">
                    {statistik.today}
                  </div>
                  <div className="text-xs text-tosca font-semibold">
                    Hari ini
                  </div>
                </div>
                <div className="rounded-2xl bg-accent/40 shadow flex flex-col items-center px-4 py-2 border-2 border-toscaLight min-w-[80px]">
                  <div className="font-bold text-lg text-dark">
                    {statistik.week}
                  </div>
                  <div className="text-xs text-tosca font-semibold">
                    Minggu ini
                  </div>
                </div>
                <div className="rounded-2xl bg-accent/40 shadow flex flex-col items-center px-4 py-2 border-2 border-toscaLight min-w-[80px]">
                  <div className="font-bold text-lg text-dark">
                    {statistik.month}
                  </div>
                  <div className="text-xs text-tosca font-semibold">
                    Bulan ini
                  </div>
                </div>
                <div className="rounded-2xl bg-accent/40 shadow flex flex-col items-center px-4 py-2 border-2 border-toscaLight min-w-[80px]">
                  <div className="font-bold text-lg text-dark">
                    {statistik.total}
                  </div>
                  <div className="text-xs text-tosca font-semibold">Total</div>
                </div>
              </div>
              <BarChart dataStat={statChartData} />
            </div>
          </div>
        )}

        {/* MODAL CRUD */}
        <Transition show={modal.show} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={closeForm}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-90"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-90"
            >
              <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel
                  className={`w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border-t-4 relative ${
                    modal.type === "gedung"
                      ? "border-primary"
                      : modal.type === "lantai"
                      ? "border-secondary"
                      : "border-tosca"
                  }`}
                >
                  <Dialog.Title className="font-bold text-lg mb-6 text-primary capitalize">
                    {modal.mode === "edit" ? "Edit" : "Tambah"} {modal.type}
                  </Dialog.Title>
                  <button
                    className="absolute right-4 top-4 text-3xl text-gray-300 hover:text-primary"
                    onClick={closeForm}
                    aria-label="Tutup"
                  >
                    &times;
                  </button>
                  <form onSubmit={submitForm} className="space-y-4">
                    {modal.type === "gedung" && (
                      <>
                        <div>
                          <label className="block mb-1 font-semibold text-dark">
                            Nama Gedung
                          </label>
                          <input
                            value={modal.form.nama || ""}
                            onChange={(e) =>
                              setModal((prev) => ({
                                ...prev,
                                form: { ...prev.form, nama: e.target.value },
                              }))
                            }
                            required
                            className="input"
                            placeholder="Nama Gedung"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 font-semibold text-dark">
                            Kode Gedung
                          </label>
                          <input
                            value={modal.form.kode || ""}
                            onChange={(e) =>
                              setModal((prev) => ({
                                ...prev,
                                form: { ...prev.form, kode: e.target.value },
                              }))
                            }
                            required
                            className="input"
                            placeholder="Kode Gedung"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 font-semibold text-dark">
                            Jumlah Lantai
                          </label>
                          <input
                            value={modal.form.jumlah_lantai || ""}
                            onChange={(e) =>
                              setModal((prev) => ({
                                ...prev,
                                form: {
                                  ...prev.form,
                                  jumlah_lantai: parseInt(e.target.value),
                                },
                              }))
                            }
                            type="number"
                            min="1"
                            required
                            className="input"
                            placeholder="Jumlah Lantai"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 font-semibold text-dark">
                            Jenis Gedung
                          </label>
                          <input
                            value={modal.form.jenis_gedung || ""}
                            onChange={(e) =>
                              setModal((prev) => ({
                                ...prev,
                                form: {
                                  ...prev.form,
                                  jenis_gedung: e.target.value,
                                },
                              }))
                            }
                            required
                            className="input"
                            placeholder="Jenis Gedung"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 font-semibold text-dark">
                            Latitude
                          </label>
                          <input
                            value={modal.form.latitude || ""}
                            onChange={(e) =>
                              setModal((prev) => ({
                                ...prev,
                                form: {
                                  ...prev.form,
                                  latitude: e.target.value,
                                },
                              }))
                            }
                            required
                            className="input"
                            placeholder="Latitude"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 font-semibold text-dark">
                            Longitude
                          </label>
                          <input
                            value={modal.form.longitude || ""}
                            onChange={(e) =>
                              setModal((prev) => ({
                                ...prev,
                                form: {
                                  ...prev.form,
                                  longitude: e.target.value,
                                },
                              }))
                            }
                            required
                            className="input"
                            placeholder="Longitude"
                          />
                        </div>
                      </>
                    )}
                    {modal.type === "lantai" && (
                      <>
                        <div>
                          <label className="block mb-1 font-semibold text-dark">
                            Nama Lantai
                          </label>
                          <input
                            value={modal.form.nama_lantai || ""}
                            onChange={(e) =>
                              setModal((prev) => ({
                                ...prev,
                                form: {
                                  ...prev.form,
                                  nama_lantai: e.target.value,
                                },
                              }))
                            }
                            required
                            className="input"
                            placeholder="Nama Lantai"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 font-semibold text-dark">
                            Nomor Lantai
                          </label>
                          <input
                            value={modal.form.nomor_lantai || ""}
                            onChange={(e) =>
                              setModal((prev) => ({
                                ...prev,
                                form: {
                                  ...prev.form,
                                  nomor_lantai: parseInt(e.target.value),
                                },
                              }))
                            }
                            type="number"
                            min="1"
                            required
                            className="input"
                            placeholder="Nomor Lantai"
                          />
                        </div>
                      </>
                    )}
                    {modal.type === "ruangan" && (
                      <>
                        <div>
                          <label className="block mb-1 font-semibold text-dark">
                            Nama Ruangan
                          </label>
                          <input
                            value={modal.form.nama_ruangan || ""}
                            onChange={(e) =>
                              setModal((prev) => ({
                                ...prev,
                                form: {
                                  ...prev.form,
                                  nama_ruangan: e.target.value,
                                },
                              }))
                            }
                            required
                            className="input"
                            placeholder="Nama Ruangan"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 font-semibold text-dark">
                            Fungsi
                          </label>
                          <input
                            value={modal.form.fungsi || ""}
                            onChange={(e) =>
                              setModal((prev) => ({
                                ...prev,
                                form: { ...prev.form, fungsi: e.target.value },
                              }))
                            }
                            className="input"
                            placeholder="Fungsi"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 font-semibold text-dark">
                            x_pixel
                          </label>
                          <input
                            value={modal.form.x_pixel || ""}
                            onChange={(e) =>
                              setModal((prev) => ({
                                ...prev,
                                form: {
                                  ...prev.form,
                                  x_pixel: parseInt(e.target.value),
                                },
                              }))
                            }
                            type="number"
                            min="0"
                            required
                            className="input"
                            placeholder="x_pixel"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 font-semibold text-dark">
                            y_pixel
                          </label>
                          <input
                            value={modal.form.y_pixel || ""}
                            onChange={(e) =>
                              setModal((prev) => ({
                                ...prev,
                                form: {
                                  ...prev.form,
                                  y_pixel: parseInt(e.target.value),
                                },
                              }))
                            }
                            type="number"
                            min="0"
                            required
                            className="input"
                            placeholder="y_pixel"
                          />
                        </div>
                      </>
                    )}
                    <button
                      className="bg-primary text-white w-full py-2 rounded-xl font-bold hover:bg-dark transition mt-2"
                      type="submit"
                    >
                      {modal.mode === "edit" ? "Simpan Perubahan" : "Tambah"}
                    </button>
                  </form>
                </Dialog.Panel>
              </div>
            </Transition.Child>
          </Dialog>
        </Transition>
      </main>
    </div>
  );
}
