"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Fragment } from "react";
import Image from "next/image";

type Gedung = { id: number; nama: string; kode: string };
type Lantai = {
  id: number;
  nama_lantai: string;
  nomor_lantai: number;
  id_gedung: number;
};
type Ruangan = {
  id: number;
  nama_ruangan: string;
  fungsi: string;
  x_pixel: number;
  y_pixel: number;
  id_lantai: number;
  id_gedung: number;
};

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

  // Statistik
  const [statistik, setStatistik] = useState({
    today: 0,
    week: 0,
    month: 0,
    total: 0,
    chart: [0, 0, 0, 0, 0, 0, 0],
  });

  // Modal
  const [modal, setModal] = useState<{
    show: boolean;
    type: string;
    mode: string;
    form: Record<string, unknown>;
    entityId: number | null;
  }>({
    show: false,
    type: "",
    mode: "",
    form: {},
    entityId: null,
  });

  // Toast
  const [toast, setToast] = useState<{
    show: boolean;
    msg: string;
    timer: NodeJS.Timeout | null;
  }>({
    show: false,
    msg: "",
    timer: null,
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

  type Entity = Gedung | Lantai | Ruangan;
  const editEntity = (type: string, entity: Entity) => {
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

  const deleteEntity = async (type: string, entity: Entity) => {
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
      ...prev,
      msg,
      show: true,
      timer: setTimeout(
        () => setToast((prev2) => ({ ...prev2, show: false })),
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

  useEffect(() => {
    fetchGedung();
    fetchStatistik();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen bg-gradient-to-tr from-accent via-white to-toscaLight">
      {/* SIDEBAR MOBILE OVERLAY */}
      {/* Sidebar mobile dihapus bersama Transition/Dialog */}

      {/* SIDEBAR DESKTOP */}
      <aside className="hidden md:flex flex-col w-56 bg-primary text-white px-5 py-8 rounded-tr-3xl shadow-2xl h-screen">
        {/* Logo dan Header */}
        <div className="flex items-center mb-8 gap-2">
          <div className="rounded-full bg-white text-primary font-bold w-12 h-12 flex items-center justify-center shadow-lg">
            <Image
              width={30}
              height={30}
              src="/logo.svg"
              alt="Logo"
              className="w-full h-full select-none"
              priority
            />
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
            <button className="md:hidden text-2xl p-2 rounded-lg hover:bg-accent/30 transition">
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
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 ${
            toast.show
              ? "bg-white shadow-lg px-6 py-3 rounded-xl border-2 border-tosca font-semibold text-dark text-base"
              : "hidden"
          }`}
        >
          <Image
            width={28}
            height={28}
            src="/check.svg"
            alt="Check"
            className="w-7 h-7"
          />
          <span>{toast.msg}</span>
        </div>

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
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
