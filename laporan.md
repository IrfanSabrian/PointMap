TUGAS AKHIR

RANCANG BANGUN PETA INTERAKTIF POLITEKNIK NEGERI PONTIANAK BERBASIS WEB

Diajukan Sebagai Persyaratan untuk Menyelesaikan Program Pendidikan Diploma III Pada Program Studi Teknik Informatika
Jurusan Teknik Elektro Politeknik Negeri Pontianak

OLEH :
Irfan Sabrian Fadhillah
3202216097

PROGRAM STUDI D3 TEKNIK INFORMATIKA
JURUSAN TEKNIK ELEKTRO
POLITEKNIK NEGERI PONTIANAK
2024

HALAMAN PENGESAHAN

RANCANG BANGUN PETA INTERAKTIF POLITEKNIK NEGERI PONTIANAK BERBASIS WEB

Oleh :
Irfan Sabrian Fadhillah
3202216097

Tugas Akhir ini telah diterima dan disahkan sebagai salah satu syarat untuk menyelesaikan Program Pendidikan Diploma III Program Studi Teknik Informatika Jurusan Teknik Elektro Politeknik Negeri Pontianak.

Disahkan oleh :

HALAMAN PERNYATAAN

RANCANG BANGUN PETA INTERAKTIF POLITEKNIK NEGERI PONTIANAK BERBASIS WEB

Oleh:
Irfan Sabrian Fadhillah
3202216097

Pembimbing

Ferry Faisal, S.S.T., M.T.
NIP. 197302061995011001

Telah dipertahakankan di depan penguji pada tanggal 19 Agustus 2025 dan dinyatakan memenuhi syarat sebagai Laporan Tugas Akhir.

Penguji I

Yasir Arafat, S.S.T., M.T.
NIP 197203041995011001 Penguji II

Suheri, S.T., M.Cs.  
NIP 198307172008121005

HALAMAN PERNYATAAN ORISINALITAS

Saya yang bertanda tangan di bawah ini :
Nama : Irfan Sabrian Fadhillah
NIM : 3202216097
Jurusan / Program Studi : Teknik Elektro/Teknik Informatika
Judul Tugas Akhir : Rancang Bangun Peta Interaktif Politeknik Negeri Pontianak Berbasis Web
Menyatakan dengan sebenar-benarnya bahwa penulisan Laporan Tugas Akhir ini berdasarkan hasil penelitian, pemikiran dan pemaparan asli dari saya sendiri, baik untuk naskah laporan maupun kegiatan yang tercantum sebagai bagian dari Laporan Tugas Akhir ini. Jika terdapat karya orang lain, saya akan mencantumkan sumber yang jelas.
Demikian pernyataan ini saya buat dengan sesungguhnya dan apabila dikemudian hari terdapat penyimpangan dan ketidakbenaran dalam pernyataan ini, maka saya bersedia menerima sanksi akademik berupa pencabutan gelar yang telah diperoleh karena karya tulis ini dan sanksi lain sesuai dengan peraturan yang berlaku di Politeknik Negeri Pontianak.
Demikian pernyataan ini saya buat dalam keadaan sadar tanpa paksaan dari pihak manapun.

Pontianak, 19 Agustus 2025
Yang membuat pernyataan,

Irfan Sabrian Fadhillah 3202216097.

PROFIL PENULIS

Nama Mahasiswa
NIM
Tempat, Tanggal Lahir
Jenis Kelamin
Agama
No. Handphone
Email
Alamat : Irfan Sabrian Fadhillah
: 3202216097
: Pontianak, 10 April 2003
: Laki-laki
: Islam
: 089508669156
: irfansabrian34@gmail.com
: Jalan Parit H. Mukhsin 2 Komplek Puri Akcaya Jalur 2

ABSTRAK

Mahasiswa dan pengunjung sering mengalami kesulitan dalam menemukan lokasi gedung dan ruangan di lingkungan Politeknik Negeri Pontianak. Kurangnya sistem navigasi digital yang informatif membuat pencarian lokasi menjadi tidak efisien dan membingungkan, terutama bagi mahasiswa baru maupun tamu kampus yang belum familiar dengan area sekitar.

Solusi yang ditawarkan adalah PointMap, sebuah sistem informasi geografis berbasis web yang menyajikan peta interaktif dengan fitur pencarian ruangan, tampilan gedung 2.5D, galeri foto, dan navigasi rute berdasarkan titik tujuan pengguna.

Pengembangan sistem dilakukan menggunakan metode Waterfall, dimulai dari analisis kebutuhan, desain sistem, implementasi, hingga pengujian. Teknologi yang digunakan meliputi Next.js dan Leaflet untuk tampilan antarmuka, serta Express.js dan MySQL untuk pengelolaan data di sisi backend. Algoritma Dijkstra digunakan untuk menghitung rute terpendek antar lokasi berdasarkan data GeoJSON.

Hasil pengujian menunjukkan seluruh fitur berjalan dengan baik sesuai skenario, seperti pencarian lokasi, tampilan peta interaktif, serta perhitungan rute. Sistem juga responsif di berbagai perangkat, cepat diakses, dan memiliki mekanisme logout otomatis dalam satu jam untuk menjaga keamanan.

Kata Kunci : Web GIS, Peta Interaktif, Navigasi Digital, Leaflet, Next.js 
ABSTRACT

Students and visitors often face difficulties in locating buildings and rooms within the Politeknik Negeri Pontianak. The absence of an informative digital navigation system makes the process of finding locations inefficient and confusing, especially for new students and campus guests who are unfamiliar with the area.

The proposed solution is PointMap, a web-based geographic information system that provides an interactive map equipped with features such as room search, 2.5D building visualization, photo galleries, and route navigation based on user-defined destinations.

The system was developed using the Waterfall method, starting from requirement analysis, system design, implementation, and testing. Technologies used include Next.js and Leaflet for the user interface, and Express.js with MySQL for backend data management. The Dijkstra algorithm was implemented to calculate the shortest route between locations based on GeoJSON data.

Test results indicate that all features functioned as expected based on the predefined scenarios, including location search, interactive map rendering, and route calculations. The system also performed well across various devices, offered fast access, and included an automatic logout mechanism after one hour to enhance security.

Keywords: Web GIS, Interactive Map, Digital Navigation, Leaflet, Next.js

PRAKATA

Puji dan syukur penulis panjatkan atas kehadirat Allah Subhanahu Wa Ta’ala yang telah memberikan rahmat dan karunia-Nya sehingga Tugas Akhir dengan judul “Rancang Bangun Peta Interaktif Politeknik Negeri Pontianak Berbasis Web” ini dapat terselesaikan. Pada penyusunan Laporan Tugas Akhir dari awal hingga selesainya laporan ini tidak terlepas dari bantuan berbagai pihak. Oleh karena itu, penulis sangat berterima kasih kepada :

1. Kedua orang tua yang memberikan semangat dan dukungan secara moril maupun materil selama berjalannya proses penyusunan Tugas Akhir.
2. Bapak Dr. H. Widodo PS, S.T., M.T., selaku Direktur Politeknik Negeri Pontianak.
3. Bapak Hasan, S.T., M.T., selaku Ketua Jurusan Teknik Elektro Politeknik Negeri Pontianak.
4. Ibu Mariana Syamsudin, S.T., M.T., PhD selaku Koordinator Program Studi D3 Teknik Informatika Politeknik Negeri Pontianak.
5. Bapak Safri Adam, S.Kom., M.Kom. selaku Koordinator Tugas Akhir Program Studi D3 Teknik Informatika Politeknik Negeri Pontianak.
6. Bapak Ferry Faisal, S.S.T., M.T. selaku Dosen Pembimbing yang telah banyak membantu selama proses penyusunan Tugas Akhir ini.
7. Bapak Yasir Arafat, S.S.T., M.T. selaku dosen penguji 1 yang telah memberikan kritik dan saran selama proses penyusunan Tugas Akhir ini.
8. Bapak Suheri, S.T., M.Cs. selaku dosen penguji 2 yang telah memberikan kritik dan saran selama proses penyusunan Tugas Akhir ini.
9. Bapak Tommi Suryanto, S.Kom., M.Kom. selaku Kepala Laboratorium Program Studi D3 Teknik Informatika Politeknik Negeri Pontianak yang telah mengizinkan dan membantu penulis dalam memberikan data informasi untuk melakukan studi kasus sebagai bahan untuk menyelesaikan Tugas Akhir ini.
10. Seluruh staf pengajar khususnya dosen yang mengajar di Program Studi D-III Teknik Informatika Politeknik Negeri Pontianak yang telah memberikan ilmunya kepada penulis selama mengikuti perkuliahan.
11. Semua teman-teman mahasiswa jurusan Teknik Elektro khususnya di Program Studi D3 Teknik Informatika yang bersama-sama berjuang dalam menyelesaikan Tugas Akhir ini.
12. Abdhy Faturullah dari Universitas Tanjungpura, jurusan Perencanaan Wilayah dan Kota (PWK), yang telah membantu mengajarkan penggunaan aplikasi ArcGIS dan memberikan saran dalam penggunaannya.
    Pada penyusunan Laporan Tugas Akhir ini tentu masih terdapat banyak kekurangan. Oleh karena itu, penulis berharap adanya kritik dan saran yang membangun dari segala pihak demi perbaikan laporan ini dikemudian hari. Semoga laporan ini dapat memberikan manfaat bagi pembaca dan penulis sendiri.

DAFTAR ISI

HALAMAN PENGESAHAN ii
HALAMAN PERNYATAAN iii
HALAMAN PERNYATAAN ORISINALITAS iv
PROFIL PENULIS v
ABSTRAK vi
ABSTRACT vii
PRAKATA viii
DAFTAR ISI x
DAFTAR TABEL xii
DAFTAR GAMBAR xiii
BAB I PENDAHULUAN 1
1.1 Latar Belakang 1
1.2 Rumusan Masalah 2
1.3 Batasan Masalah 2
1.4 Tujuan Tugas Akhir 3
1.5 Manfaat Tugas Akhir 3
1.6 Metodologi Pelaksanaan Tugas Akhir 3
1.7 Sistematika Penulisan 5
BAB II DASAR TEORI 7
2.1 Tinjauan Pustaka 7
2.2 Dasar Teori 10
BAB III RANCANG BANGUN WEBSITE POINTMAP 14
3.1 Gambaran Umum 14
3.2 Analisis Kebutuhan 15
3.2.1 Kebutuhan Pengguna 15
3.2.2 Pemodelan 17
3.2.3 Kebutuhan Fungsional 18
3.2.4 Kebutuhan Non-Fungsional 20
3.3 Desain 21
3.3.1 Desain Modul 21
3.3.2 Desain UI / UX 23
3.3.3 Desain Basis Data 34
3.4 Pengkodean 37
3.4.1 Struktur File Backend 38
3.4.2 Struktur File Frontend 44
BAB IV HASIL DAN PEMBAHASAN 54
4.1 Skenario Pengujian 54
4.2 Hasil Pengujian 58
4.2.1 Halaman Beranda 58
4.2.2 Kontrol Peta 60
4.2.3 Pop Up Informasi Bangunan 63
4.2.4 Tampilan Detail Bangunan 63
4.2.5 Fitur Rute Navigasi 66
4.2.6 Halaman Login 69
4.2.7 Dashboard Dan Manajemen Data Admin 70
4.2.8 Responsivitas Dan User Experience 81
4.3 Pembahasan 82
BAB V PENUTUP 83
5.1 Kesimpulan 83
5.2 Saran 84
DAFTAR PUSTAKA 85
LAMPIRAN 48

DAFTAR TABEL
Tabel 2.1 Tabel Perbandingan 9
Tabel 3.1 Kebutuhan Pengguna 15
Tabel 3.2 Kebutuhan Fungsional 18
Tabel 3.3 Kebutuhan Non-Fungsional 20
Tabel 3.4 Desain Modul 21
Tabel 4.1 Skenario Pengujian 55

DAFTAR GAMBAR
Gambar 1.1 SDLC Model Waterfall 4
Gambar 3.1 Arsitektur Sistem 14
Gambar 3.2 Use Case Diagram Pengunjung 17
Gambar 3.3 Use Case Diagram Admin 18
Gambar 3.4 Halaman Beranda 24
Gambar 3.5 Halaman Beranda Bangunan diklik 25
Gambar 3.6 Halaman Beranda Detail Bangunan 26
Gambar 3.7 Halaman Beranda Detail Ruangan 27
Gambar 3.8 Halaman Beranda Modal Rute 28
Gambar 3.9 Halaman Beranda Instruksi Navigasi 29
Gambar 3.10 Halaman Login 30
Gambar 3.11 Halaman Dashboard 30
Gambar 3.12 Halaman Dashboard Bangunan diklik 31
Gambar 3.13 Halaman Dashboard Modal Edit nama dan interaksi 31
Gambar 3.14 Halaman Dashboard Modal Edit Thumbnail Bangunan 32
Gambar 3.15 Halaman Dashboard Modal Edit Lantai Bangunan 32
Gambar 3.16 Halaman Dashboard Modal Tambah Lantai 33
Gambar 3.17 Halaman Dashboard Modal Hapus Lantai 33
Gambar 3.18 Halaman Dashboard Modal Ruangan 34
Gambar 3.19 Desain Basis Data 35
Gambar 3.20 Struktur File Backend 38
Gambar 3.21 Struktur File Backend /config/ 39
Gambar 3.22 Struktur File Backend /controllers/ 40
Gambar 3.23 Struktur File Backend /middlewares/ 40
Gambar 3.24 Struktur File Backend /models/ 41
Gambar 3.25 Struktur File Backend /routes/ 42
Gambar 3.26 Struktur File Backend /tools/ 43
Gambar 3.27 Struktur File Backend File Utama 44
Gambar 3.28 Struktur File Frontend 45
Gambar 3.29 Struktur File Frontend /src/components/ 47
Gambar 3.30 Struktur File Frontend /src/config/ 48
Gambar 3.31 Struktur File Frontend /src/context/ 49
Gambar 3.32 Struktur File Frontend /src/hooks/ 50
Gambar 3.33 Struktur File Frontend /src/lib/ 51
Gambar 3.34 Struktur File Frontend /src/services/ 52
Gambar 3.35 Struktur File Frontend /src/types/ 53
Gambar 3.36 Struktur File Frontend /public/ 54
Gambar 3.37 Struktur File Konfigurasi Frontend 55
Gambar 4.1 Halaman Beranda Light Mode 59
Gambar 4.2 Halaman Beranda Dark Mode 60
Gambar 4.3 Tampilan Canvas Peta Satelit dan Warna Kategori 61
Gambar 4.4 Tampilan Canvas Layer Bangunan Disembunyikan 61
Gambar 4.5 Tampilan Canvas Zoom in dan Zoom out 62
Gambar 4.6 Tampilan Canvas Lokasi Saya dan Akses GPS Diizinkan 62
Gambar 4.7 Tampilan Canvas Lokasi Saya dan Akses GPS Ditolak 62
Gambar 4.8 Pop up Layer Bangunan diklik 63
Gambar 4.9 Pop up Thumbnail di klik 63
Gambar 4.10 Tampilan Detail Bangunan Awal 64
Gambar 4.11 Tampilan Detail Bangunan Salah Satu Lantai Diklik Mode 2.5D 64
Gambar 4.12 Tampilan Detail Bangunan Salah Satu Lantai Diklik Mode 2D 64
Gambar 4.13 Tampilan Detail Ruangan Klik Pin Marker / List Ruangan 2.5D 65
Gambar 4.14 Tampilan Detail Ruangan Klik Pin Marker / List Ruangan 2D 65
Gambar 4.15 Tampilan Detail Ruangan Gallery Diklik 65
Gambar 4.16 Fitur Rute Navigasi Modal Cari Rute Lokasi Saya 66
Gambar 4.17 Instruksi Navigasi Titik Gerbang Terdekat Mode Kendaraan 66
Gambar 4.18 Fitur Rute Navigasi Modal Cari Rute Mode Jalan Kaki 67
Gambar 4.19 Instruksi Navigasi Titik Awal Mode Jalan Kaki 67
Gambar 4.20 Instruksi Navigasi Titik Pertengahan Mode Jalan Kaki 67
Gambar 4.21 Instruksi Navigasi Titik Tujuan Mode Jalan Kaki 68
Gambar 4.22 Fitur Rute Navigasi Modal Cari Rute Mode Kendaraan 68
Gambar 4.23 Instruksi Navigasi Titik Awal Mode Kendaraan 68
Gambar 4.24 Instruksi Navigasi Titik Pertengahan Mode Kendaraan 69
Gambar 4.25 Instruksi Navigasi Titik Tujuan Mode Kendaraan 69
Gambar 4.26 Halaman Login 70
Gambar 4.27 Halaman Dashboard 71
Gambar 4.28 Tampilan Dashboard Gedung Diklik 71
Gambar 4.29 Tampilan Dashboard Modal Edit Informasi Bangunan 71
Gambar 4.30 Notifikasi Berhasil Perbarui Data Nama / Interaksi Bangunan 72
Gambar 4.31 Tampilan Dashboard Modal Edit Thumbnail Bangunan 72
Gambar 4.32 Notifikasi Berhasil Perbarui Thumbnail Bangunan 72
Gambar 4.33 Modal Edit Lantai Bangunan 73
Gambar 4.34 Modal Tambah Lantai Bangunan 73
Gambar 4.35 Notifikasi Jika Upload Gambar Selain Format SVG 73
Gambar 4.36 Jika Upload Gambar Lantai Format SVG 74
Gambar 4.37 Notifikasi Jika Lantai berhasil Ditambah 74
Gambar 4.38 Modal Edit Lantai 74
Gambar 4.39 Notifikasi Edit Berhasil Dilakukan 75
Gambar 4.40 Peringatan Jika Lantai Dihapus 75
Gambar 4.41 Notifikasi Jika Lantai Berhasil Dihapus 75
Gambar 4.42 Modal List Ruangan Saat Lantai Diklik 76
Gambar 4.43 Modal Tambah Ruangan 76
Gambar 4.44 Modal Tentukan Posisi Ruangan Bagian 1 76
Gambar 4.45 Modal Tentukan Posisi Ruangan Bagian 2 77
Gambar 4.46 Modal Setelah Memilih Posisi Pin 77
Gambar 4.47 Notifikasi Jika Ruangan Berhasil Ditambahkan 77
Gambar 4.48 Modal Jika Ruangan Dihapus 78
Gambar 4.49 Notifikasi Jika Ruangan Berhasil Dihapus 78
Gambar 4.50 Dashboard Admin Edit Data Ruangan 78
Gambar 4.51 Modal Edit Informasi Ruangan 79
Gambar 4.52 Notifikasi Jika Perubahan Tidak Valid 79
Gambar 4.53 Notifikasi Jika Data Berhasil Diubah 79
Gambar 4.54 Modal Untuk Perbarui Gallery Ruangan 80
Gambar 4.55 Notifikasi Gallery Dihapus 80
Gambar 4.56 Modal Tambahkan Gallery 80
Gambar 4.57 Modal Berhasil Tambah Gallery 81
Gambar 4.58 Tampilan Responsif Mobile 81

BAB I
PENDAHULUAN

1.1 Latar Belakang
Politeknik Negeri Pontianak (POLNEP) merupakan salah satu institusi pendidikan tinggi vokasi di Indonesia yang berfokus pada pengembangan keterampilan praktis dan profesional. Sejak didirikan pada tahun 1985, POLNEP telah mengalami pertumbuhan yang signifikan, tidak hanya dari segi jumlah program studi dan jurusan, tetapi juga perluasan jangkauan wilayah pendidikan. Saat ini, POLNEP memiliki kampus utama di Pontianak serta beberapa kampus cabang yang tersebar di Kalimantan Barat, yaitu PSDKU (Program Studi Di Luar Kampus Utama) Polnep Sanggau, PDD (Program Diploma di Daerah) Polnep Kapuas Hulu, dan PSDKU Polnep Sukamara [1][2].

Di kampus utama Pontianak, POLNEP mengelola delapan jurusan, yakni Teknik Sipil, Teknik Mesin, Teknik Elektro, Administrasi Bisnis, Akuntansi, Teknologi Pertanian, Ilmu Kelautan dan Perikanan, dan Teknik Arsitektur. Setiap jurusan dilengkapi dengan berbagai gedung dan fasilitas pendukung yang tersebar di area kampus, baik berupa gedung tersendiri maupun gedung bersama. Sementara itu, kampus-kampus cabang di Sanggau, Kapuas Hulu, dan Sukamara juga memiliki gedung perkuliahan dan fasilitas pendukung yang terus berkembang sesuai kebutuhan program studi yang diselenggarakan di masing-masing lokasi.

Di era digital saat ini, informasi mengenai fasilitas dan infrastruktur kampus menjadi semakin penting untuk diakses secara cepat dan mudah. Calon mahasiswa, orang tua, pengunjung, bahkan mahasiswa aktif membutuhkan informasi visual yang detail mengenai gedung perkuliahan, laboratorium, ruang praktik, dan fasilitas pendukung lainnya. Namun, penyampaian informasi tersebut masih terbatas pada media konvensional seperti brosur cetak atau foto dokumentasi yang tersebar di berbagai platform tanpa struktur yang terorganisir.

Untuk menjawab kebutuhan tersebut, diperlukan sebuah platform informasi berbasis web yang mampu menyajikan data gedung dan fasilitas kampus secara interaktif dan terstruktur. Platform ini memungkinkan pengguna untuk menjelajahi tata letak kampus, melihat detail gedung dalam tampilan 2D dan 2.5D, mengakses galeri foto ruangan, serta memperoleh informasi lengkap mengenai setiap fasilitas yang ada.

Peta interaktif berbasis web menjadi solusi yang tepat karena dapat diakses melalui berbagai perangkat seperti komputer dan smartphone tanpa memerlukan instalasi khusus. Sistem berbasis web juga memudahkan pembaruan data secara real-time dan memberikan pengalaman visual yang lebih menarik dibandingkan media statis. Lebih jauh lagi, dengan mengadopsi arsitektur multi-kampus, sistem ini dapat dikembangkan untuk mendukung berbagai lokasi kampus politeknik lainnya, sehingga menjadi platform yang scalable dan fleksibel untuk kebutuhan informasi institusi pendidikan vokasi.

1.2 Rumusan Masalah
Berdasarkan latar belakang yang telah diuraikan, rumusan masalah dalam tugas akhir ini adalah:
Tersedianya peta interaktif berbasis web untuk menyajikan informasi gedung dan fasilitas kampus secara visual, terstruktur, dan dapat diakses untuk berbagai lokasi kampus Politeknik Negeri Pontianak beserta kampus cabangnya.

1.3 Batasan Masalah
Agar tugas akhir lebih fokus dan terarah, beberapa batasan masalah yang diterapkan adalah:

1. Pengumpulan data detail seluruh gedung, ruangan, dan fasilitas di semua kampus Polnep memerlukan survey mendalam yang memakan waktu lama. Karena keterbatasan waktu pengembangan, data yang tersedia saat ini masih terbatas dan akan dilengkapi secara bertahap oleh administrator melalui panel admin yang tersedia.
2. Mode visualisasi gedung (2D atau 2.5D interaktif) ditentukan sepenuhnya oleh administrator melalui pengaturan pada panel admin. Admin dapat mengatur gedung sebagai "interaktif" dengan tampilan 2.5D yang dapat di-switch ke 2D dan akses detail ruangan, atau "non-interaktif" dengan hanya tampilan 2D dan informasi dasar.
3. Sistem dirancang untuk mendukung multi-kampus, namun fokus pengembangan dan pengujian dilakukan pada Politeknik Negeri Pontianak sebagai studi kasus utama. Data gedung dan ruangan yang tersedia saat ini belum lengkap sepenuhnya, dengan beberapa gedung di kampus utama Pontianak yang telah memiliki data cukup detail untuk keperluan demonstrasi sistem.
4. Sistem dikembangkan berbasis web yang dapat diakses melalui browser tanpa memerlukan aplikasi mobile atau desktop khusus, sehingga membatasi beberapa fitur native mobile seperti akses sensor perangkat yang lebih advanced.
5. Semua pengelolaan data kampus, gedung, lantai, ruangan, dan galeri foto dilakukan oleh administrator melalui dashboard untuk menjaga kualitas dan akurasi informasi yang ditampilkan.

1.4 Tujuan Tugas Akhir
Tujuan dari tugas akhir ini adalah:
Tersedianya platform peta interaktif berbasis web yang menyajikan informasi gedung dan fasilitas kampus secara visual, interaktif, dan terstruktur untuk mendukung kebutuhan informasi berbagai lokasi kampus Politeknik Negeri Pontianak beserta kampus cabangnya.

1.5 Manfaat Tugas Akhir
Adapun manfaat-manfaat dari hasil penelitian yang dilakukan adalah:

1. Bagi Calon Mahasiswa dan Orang Tua
   Memberikan gambaran visual yang jelas mengenai fasilitas dan infrastruktur kampus sebelum melakukan kunjungan langsung atau mendaftar.
2. Bagi Mahasiswa dan Dosen
   Mempermudah pengenalan terhadap lokasi gedung, ruangan, dan fasilitas kampus secara interaktif tanpa harus berkeliling secara fisik.
3. Bagi Institusi
   Menyediakan platform informasi kampus yang modern, profesional, dan mudah dikelola untuk mendukung branding dan transparansi fasilitas institusi.
4. Bagi Pengembangan Selanjutnya
   Menyediakan arsitektur sistem yang scalable untuk diterapkan pada kampus Polnep cabang lainnya.

1.6 Metodologi Pelaksanaan Tugas Akhir
Metodologi yang digunakan dalam pengembangan sistem ini adalah metode Waterfall. Waterfall merupakan salah satu model proses dalam rekayasa perangkat lunak yang bersifat sekuensial, di mana setiap tahap pengembangan seperti analisis, desain, implementasi, pengujian, dan pemeliharaan dilakukan secara berurutan. Model ini cocok untuk proyek yang memiliki kebutuhan yang telah ditentukan secara jelas sejak awal dan tidak banyak mengalami perubahan di tengah jalan [4]. Pendekatan ini telah banyak digunakan dalam pengembangan perangkat lunak tradisional karena struktur prosesnya yang sistematis dan terdokumentasi dengan baik.
Waterfall dipilih karena sesuai untuk pengembangan sistem berbasis web yang memiliki alur kerja dan kebutuhan yang relatif stabil. Dengan menggunakan model ini, setiap tahapan dalam proses pengembangan memiliki keluaran yang spesifik dan menjadi prasyarat bagi tahap berikutnya, sehingga memudahkan proses dokumentasi dan pengendalian mutu [4]. Metode ini juga dapat meminimalkan risiko kesalahan selama pengembangan karena setiap tahap telah diverifikasi sebelum melanjutkan ke tahap selanjutnya. Metode Waterfall dapat di lihat di Gambar 1.

Gambar 1.1 SDLC Model Waterfall

1. Analisis
   Pada tahap ini dilakukan pengumpulan data dan informasi terkait kebutuhan pengguna terhadap sistem peta interaktif. Data diperoleh melalui observasi langsung di lingkungan kampus Politeknik Negeri Pontianak serta studi pustaka terkait sistem serupa yang pernah dikembangkan di institusi lain. Hasil dari tahap ini berupa daftar kebutuhan fungsional dan non-fungsional dari sistem yang akan dibangun.
2. Desain
   Berdasarkan kebutuhan yang telah dikumpulkan, dilakukan perancangan arsitektur sistem dan antarmuka pengguna (user interface). Perancangan mencakup struktur halaman web, desain layout peta interaktif, struktur database, serta alur navigasi antar fitur.
3. Pengkodean
   Tahap ini merupakan proses pengkodean sistem berdasarkan desain yang telah dibuat. Pengembangan dilakukan menggunakan teknologi berbasis web seperti HTML, CSS, JavaScript untuk frontend, serta Node.js dan MySQL untuk backend dan database. Peta interaktif dikembangkan dengan menampilkan denah kampus dalam tampilan 2D dan fitur visualisasi susunan lantai dalam tampilan 2. 2D dan5D.
4. Pengujian (Testing)
   Setelah sistem selesai diimplementasikan, dilakukan pengujian untuk memastikan bahwa seluruh fitur berjalan sesuai dengan kebutuhan. Pengujian dilakukan secara fungsional untuk memastikan fitur-fitur utama dapat digunakan dengan baik, serta pengujian usability untuk menilai kenyamanan dan kemudahan penggunaan sistem oleh pengguna.
5. Penerapan Program Pemeliharaan
   Setelah sistem dinyatakan siap, peta interaktif akan dipublikasikan secara online dan dapat diakses melalui browser. Tahap ini juga mencakup pemeliharaan berkala terhadap sistem, seperti pembaruan data peta jika terjadi perubahan gedung atau ruangan di kampus.

1.7 Sistematika Penulisan
Adapun sistematika penulisan Tugas Akhir ini secara garis besarnya terbagi menjadi 5 (lima) bab, sebagai berikut :
BAB I: PENDAHULUAN
Bab ini berisi gambaran umum mengenai latar belakang permasalahan yang melatarbelakangi tugas akhir atau pengembangan sistem, rumusan masalah yang ingin diselesaikan, batasan masalah untuk memperjelas ruang lingkup tugas akhir, tujuan yang ingin dicapai, manfaat yang diharapkan, metodologi yang digunakan dalam pengerjaan tugas akhir, serta sistematika penulisan untuk memberikan gambaran struktur laporan.
BAB II: DASAR TEORI
Bab ini menguraikan konsep, teori, serta referensi yang mendukung pengembangan atau penelitian yang dilakukan. Teori yang dijelaskan dapat mencakup teknologi yang digunakan, algoritma yang diterapkan, metode pengembangan, dan perangkat yang digunakan dalam tugas akhir.
BAB III: PERANCANGAN SISTEM
Bab ini menjelaskan tahapan perancangan dari sistem atau solusi yang dikembangkan. Uraian dapat mencakup analisis kebutuhan, desain sistem, arsitektur perangkat lunak, diagram alur, perancangan antarmuka pengguna, serta metode yang digunakan dalam implementasi sistem.
BAB IV: HASIL DAN PEMBAHASAN
Bab ini berisi hasil dari implementasi sistem atau eksperimen yang dilakukan. Pembahasan mencakup hasil pengujian, analisis performa sistem, serta perbandingan dengan metode atau teknologi lain jika diperlukan. Evaluasi dilakukan berdasarkan data yang diperoleh untuk mengetahui apakah sistem yang dikembangkan telah memenuhi tujuan yang ditetapkan.
BAB V: PENUTUP
Bab ini berisi kesimpulan dari tugas akhir atau pengembangan yang telah dilakukan serta saran untuk pengembangan lebih lanjut. Kesimpulan harus berdasarkan hasil yang telah dibahas sebelumnya, sedangkan saran dapat berupa perbaikan, pengembangan lanjutan, atau penelitian lebih lanjut yang dapat dilakukan di masa mendatang.

BAB II
DASAR TEORI
2.1 Tinjauan Pustaka
A. Ringkasan Penelitian Terdahulu

1. Penelitian oleh Siti Sahara, Monica Wulandari, dan Fitri Khairunnisa: Penelitian berjudul “Pengembangan Aplikasi Peta Interaktif UNJ untuk Mahasiswa dan Pengunjung” tahun 2024 membahas pengembangan peta interaktif untuk Universitas Negeri Jakarta (UNJ) menggunakan aplikasi Canva. Penelitian ini bertujuan untuk mengatasi kesulitan dalam menyediakan informasi lokasi bagi pengguna di kampus UNJ yang tersebar di empat lokasi di Jakarta. Hasil penelitian menunjukkan bahwa peta interaktif ini relevan dalam menyediakan informasi yang lebih lengkap dan mudah diakses tentang kampus UNJ [5].
2. Penelitian oleh Tim Universitas Brawijaya: Penelitian berjudul “Pengembangan Aplikasi Peta Interaktif Tiga Dimensi” membahas pengembangan peta virtual 3D untuk memvisualisasikan lingkungan Fakultas Ilmu Komputer Universitas Brawijaya. Penelitian ini bertujuan untuk menggabungkan peta virtual tiga dimensi dengan kemampuan eksplorasi sudut pandang orang pertama dalam satu aplikasi. Dengan demikian, pengguna dapat merasakan berada di area Filkom UB tanpa harus hadir secara fisik, sehingga membantu mereka yang ingin mengenali lebih lanjut area Filkom UB [6].
3. Penelitian oleh Maria Atik Sunarti Ekowati et al: Penelitian berjudul “Google Maps API Dalam Perancangan Sistem Informasi Geografis (SIG) Pemetaan Batas Wilayah Universitas Kristen Surakarta” tahun 2022 membahas pengembangan sistem informasi geografis menggunakan Google Maps API untuk memetakan batas wilayah Universitas Kristen Surakarta. Sistem ini dirancang untuk menampilkan informasi gedung dan sarana pendukung akademik lainnya, serta memungkinkan pengguna untuk mencari lokasi dengan mudah. Penelitian ini menunjukkan bahwa penggunaan Google Maps API dapat mempermudah pengembangan aplikasi SIG interaktif [7].
   Setelah melakukan kajian pustaka, penelitian di atas dijadikan penulis sebagai acuan dalam merancang dan membangun aplikasi peta interaktif berbasis web untuk Politeknik Negeri Pontianak. Aplikasi ini diharapkan mampu memberikan solusi dalam navigasi lokasi kampus serta menyajikan informasi spesifik terkait fasilitas kampus secara efisien dan interaktif.
   B. Analisis Perbandingan
   Analisis perbandingan dilakukan untuk membandingkan penelitian terdahulu dengan sistem yang diusulkan berdasarkan aspek-aspek tertentu seperti teknologi, fitur utama, metode yang digunakan, keterbatasan sistem, dan hasil yang dicapai. Rangkuman hasil kajian pustaka terdapat pada Tabel 1.1.

Tabel 2.1 Tabel Perbandingan
No. Aspek Pengembangan Aplikasi Peta Interaktif UNJ untuk Mahasiswa dan Pengunjung Pengembangan Aplikasi Peta Interaktif Tiga Dimensi Universitas Brawijaya Google Maps API Dalam Perancangan Sistem Informasi Geografis (SIG) Pemetaan Batas Wilayah Universitas Kristen Surakarta Sistem yang Diusulkan
1 Teknologi Web-based (Canva) 3D Virtual (Web-based) Web-based (Google Maps API) Web-based (Responsive Design)
2 Fitur Utama Pencarian Lokasi, Informasi Gedung Eksplorasi 3D, Peta Virtual Pencarian Lokasi, Informasi Gedung Navigasi Lokasi, Informasi Fasilitas
3 Metode Prototype Iterasi Waterfall Waterfall
4 Keterbatasan Tidak ada integrasi mobile Tidak ada fitur navigasi jalur Tidak ada fitur eksplorasi sudut pandang Tidak mendukung GPS
5 Hasil Mudah digunakan, Informatif Interaktif, Realistis Dinamis, Fleksibel Real-time update, Akses mudah melalui perangkat

Rangkuman hasil analisis perbandingan menunjukkan bahwa terdapat kesamaan di antara semua penelitian yang berfokus pada pengembangan peta interaktif untuk mempermudah navigasi dan penyampaian informasi lokasi di lingkungan kampus. Semua penelitian menggunakan teknologi berbasis web untuk menyajikan informasi secara dinamis, meskipun dengan pendekatan dan fitur yang berbeda.
2.2 Dasar Teori
A. Konsep Dasar
Peta interaktif merupakan representasi visual dari data spasial yang memungkinkan pengguna untuk berinteraksi langsung dengan elemen-elemen peta, seperti memperbesar tampilan, menggeser area, atau mengakses informasi tambahan melalui klik pada objek tertentu. Jenis peta ini dapat dikembangkan dalam berbagai platform, baik secara offline menggunakan perangkat lunak desktop seperti ArcGIS, maupun secara online melalui aplikasi berbasis web yang dapat diakses melalui peramban internet. Peta interaktif berbasis web menjadi semakin populer karena kemudahan akses dan fleksibilitasnya, memungkinkan pengguna untuk mengakses informasi geografis tanpa perlu menginstal perangkat lunak khusus. Dalam konteks pengembangan sistem informasi geografis, penggunaan peta interaktif berbasis web telah diterapkan dalam berbagai studi, seperti visualisasi jaringan transportasi dan analisis indeks Transit-Oriented Development (TOD) di Jakarta, yang menunjukkan efektivitasnya dalam menyajikan informasi spasial secara dinamis dan user-friendly .
B. Teori Pendukung
Penelitian ini didukung oleh beberapa teori relevan:

1. Teori Sistem Informasi: Sistem informasi adalah kombinasi dari teknologi, orang, dan proses yang bertujuan untuk mengumpulkan, menyimpan, dan mendistribusikan informasi. Dalam konteks ini, peta interaktif berbasis web merupakan bagian dari sistem informasi geografis (SIG) yang digunakan untuk memvisualisasikan data lokasi secara dinamis.
2. Metode Pengembangan Sistem Waterfall: Metode ini terdiri dari tahapan analisis kebutuhan, perancangan sistem, implementasi, pengujian, serta pemeliharaan. Pendekatan ini digunakan untuk memastikan pengembangan sistem berjalan secara terstruktur dan sesuai dengan kebutuhan pengguna.
3. Teori Interaksi Manusia-Komputer (Human-Computer Interaction): Teori ini membantu merancang antarmuka pengguna yang intuitif dan responsif agar pengguna dapat berinteraksi dengan sistem secara efektif.
   C. Teknologi yang Digunakan
   Dalam pengembangan peta interaktif Polnep berbasis web ini, penulis menggunakan beberapa teknologi berikut:
4. Next.js
   Next.js adalah framework berbasis React untuk membangun aplikasi web full-stack. React digunakan untuk membuat antarmuka pengguna, sementara Next.js menyediakan fitur tambahan seperti server-side rendering, static site generation, optimasi performa, dan sistem routing bawaan. Next.js juga mengatur konfigurasi alat tingkat rendah seperti bundler dan compiler, sehingga pengembang dapat fokus pada pembuatan fitur dan mempercepat proses pengembangan [8].
5. Node.js
   Node.js digunakan sebagai platform backend berbasis JavaScript yang bersifat non-blocking dan event-driven. Teknologi ini memungkinkan pembuatan aplikasi web real-time yang ringan dan efisien [9].

6. Sequelize
   Sequelize adalah Object Relational Mapping (ORM) yang digunakan untuk menghubungkan aplikasi Node.js dengan database MySQL. Sequelize menyederhanakan operasi database dengan cara mendefinisikan model dan melakukan query menggunakan sintaks JavaScript yang lebih terstruktur dan aman [10].
7. MySQL
   MySQL adalah sistem manajemen basis data relasional (RDBMS) open-source yang menggunakan bahasa SQL (Structured Query Language) untuk mengelola dan memanipulasi data. MySQL bekerja dengan model client-server, memungkinkan pengguna untuk mengakses dan mengelola data melalui jaringan. Keunggulan MySQL meliputi kecepatan tinggi, skalabilitas, dan keamanan yang kuat, menjadikannya pilihan populer untuk pengembangan aplikasi web [11].
8. Leaflet.js
   Leaflet.js adalah pustaka JavaScript open-source untuk membuat peta interaktif yang ramah perangkat mobile. Dengan ukuran ringan sekitar 42 KB, Leaflet menyediakan hampir semua fitur pemetaan yang umum dibutuhkan, seperti penambahan marker, pop-up, layer, dan kontrol navigasi. Leaflet dirancang dengan fokus pada kesederhanaan, performa tinggi, dan kemudahan penggunaan, serta dapat diperluas melalui berbagai plugin [12].
9. Figma
   Figma digunakan sebagai alat bantu desain untuk membuat denah gedung per lantai dalam format vektor (SVG). File SVG yang dihasilkan dari Figma kemudian digunakan sebagai background denah pada halaman detail bangunan untuk menampilkan layout ruangan secara presisi. Figma memudahkan proses desain tata letak ruangan di setiap lantai dengan tingkat akurasi yang tinggi, dan file SVG yang dihasilkan dapat langsung digunakan pada aplikasi web [13].
10. Arcgis Pro
    ArcGIS Pro, aplikasi SIG desktop tunggal yang canggih, adalah perangkat lunak penuh fitur yang dikembangkan sebagai hasil dari penyempurnaan dan penyediaan fitur yang diminta pengguna. ArcGIS Pro mendukung visualisasi data; analisis lanjutan; dan pemeliharaan data otoritatif dalam bentuk 2D, 3D, dan 4D [14].

D. Hubungan dengan Tugas Akhir
Menjelaskan bagaimana teori-teori tersebut diterapkan dalam tugas akhir ini. Misalnya, bagaimana metode SDLC digunakan untuk merancang sistem atau bagaimana teori manajemen inventaris diimplementasikan Teori-teori di atas diterapkan dalam penelitian ini sebagai berikut:

1. Teori Sistem Informasi: Mendasari pengembangan peta interaktif sebagai bagian dari sistem informasi navigasi kampus POLNEP.
2. Metode Waterfall: Digunakan untuk merancang sistem secara terstruktur mulai dari analisis kebutuhan hingga pengujian dan pemeliharaan.
3. Teknologi Web-Based: Mendukung implementasi fitur interaktif seperti pencarian lokasi gedung dan ruangan serta visualisasi 2.5D sederhana.

BAB III
RANCANG BANGUN WEBSITE POINTMAP

3.1 Gambaran Umum
PointMap adalah aplikasi peta interaktif berbasis web yang dikembangkan untuk membantu pengguna dalam menemukan lokasi gedung, ruangan, dan fasilitas di lingkungan Politeknik Negeri Pontianak. Aplikasi ini menyediakan sistem navigasi yang mudah diakses, akurat, dan responsif melalui tampilan peta interaktif yang mendukung pencarian lokasi, informasi detail, dan panduan rute.
Aplikasi ini dibangun menggunakan arsitektur client-server, dengan Next.js dan React di sisi frontend, serta Node.js, Express.js, dan MySQL di sisi backend. Selain itu, aplikasi terintegrasi dengan layanan ArcGIS REST API sebagai penyedia base map melalui koneksi internet.
Untuk lebih memahami alur komunikasi dalam sistem PointMap, dapat dilihat pada Gambar

Gambar 3.1 Arsitektur Sistem
3.2 Analisis Kebutuhan
Analisis kebutuhan dilakukan untuk merumuskan secara jelas dan terstruktur apa saja yang dibutuhkan dalam pengembangan aplikasi PointMap. Proses ini bertujuan untuk memastikan sistem yang dibangun dapat memenuhi tujuan dan harapan pengguna, sekaligus mendefinisikan batasan sistem yang akan dikembangkan.
Tahapan ini mencakup identifikasi kebutuhan pengguna berdasarkan permasalahan yang ada, pemodelan sistem menggunakan diagram use case, serta pendefinisian kebutuhan fungsional dan non-fungsional secara rinci. Analisis ini menjadi dasar dalam proses desain dan implementasi sistem agar pengembangan dapat dilakukan secara terarah dan sesuai dengan kebutuhan lapangan.
3.2.1 Kebutuhan Pengguna
Kebutuhan pengguna dianalisis berdasarkan dua jenis peran dalam sistem, yaitu pengunjung dan admin. Masing-masing memiliki kebutuhan berbeda sesuai hak akses dan fungsi yang dijalankan. Rincian kebutuhan pengguna ditampilkan pada Tabel 3.1 berikut:
Tabel 3.1 Kebutuhan Pengguna
No. Kebutuhan Pengguna Pengguna
Pengunjung Admin
UR01 Pengguna membutuhkan akses terhadap peta interaktif kampus secara online √ √
UR02 Pengguna membutuhkan fitur pencarian lokasi gedung, ruangan, atau fasilitas

    √	√

UR03 Pengguna membutuhkan informasi detail tentang gedung dan ruangan

    √	√

UR04 Pengguna membutuhkan panduan rute tercepat menuju lokasi tujuan √
UR05 Pengguna membutuhkan estimasi waktu tempuh berdasarkan jarak

    √

UR06 Pengguna membutuhkan akses ke galeri foto gedung dan ruangan

    √	√

UR07 Pengguna membutuhkan fitur pelacakan posisi (GPS tracking)

    √

UR08 Pengguna membutuhkan mode tampilan gelap (dark mode) untuk kenyamanan visual

    √

UR09 Pengguna membutuhkan kemampuan untuk login ke dalam sistem sebagai admin

    	√

UR10 Pengguna membutuhkan fitur untuk mengelola data gedung, ruangan, lantai, dan foto

    	√

UR11 Pengguna membutuhkan hak akses untuk menambahkan, mengubah, atau menghapus data

    	√

UR12 Pengguna membutuhkan tampilan dashboard untuk memantau dan mengelola data sistem

    	√

UR13 Pengguna membutuhkan sistem logout otomatis setelah tidak aktif selama 1 jam

    	√

UR14 Pengguna membutuhkan notifikasi saat waktu sesi hampir habis

    	√

3.2.2 Pemodelan
Pemodelan sistem dilakukan menggunakan Use Case Diagram untuk menggambarkan interaksi antara aktor (Pengunjung dan Admin) dengan sistem PointMap. Diagram ini merepresentasikan kebutuhan fungsional dari Web PointMap sebagai Peta Interaktif Polnep, khususnya dalam mendukung pencarian, navigasi, dan pengelolaan informasi gedung dan ruangan kampus.

1. Use Case Diagram Pengunjung
   Aktor Pengunjung berinteraksi dengan sistem untuk menjelajahi denah kampus secara interaktif. Fitur yang dapat diakses meliputi tampilan peta 2D dan 2.5D, eksplorasi gedung dan ruangan, pencarian lokasi, akses galeri foto, serta navigasi ke lokasi tujuan menggunakan rute otomatis atau lokasi awal yang dipilih secara manual.

Gambar 3.2 Use Case Diagram Pengunjung 2. Use Case Diagram Admin
Aktor Admin memiliki akses ke fitur manajemen data melalui dashboard khusus. Fungsinya meliputi autentikasi login, pengelolaan data gedung, ruangan, denah SVG, galeri, dan atribut lainnya yang ditampilkan dalam sistem. Admin juga dapat mengatur visibilitas dan konten interaktif yang ditampilkan kepada pengguna.

Gambar 3.3 Use Case Diagram Admin
3.2.3 Kebutuhan Fungsional
Kebutuhan fungsional merupakan fitur-fitur utama yang harus dimiliki oleh Website PointMap agar dapat memenuhi kebutuhan pengguna, baik pengunjung umum maupun admin kampus. Fitur-fitur ini dirancang untuk memastikan pengguna dapat menavigasi kampus dengan mudah, mengakses informasi yang relevan, serta memungkinkan pengelolaan data gedung dan ruangan secara efisien.
Berikut ini merupakan daftar kebutuhan fungsional sistem yang dikaitkan dengan kebutuhan pengguna:
Tabel 3.2 Kebutuhan Fungsional
No. Kebutuhan Fungsional Kebutuhan Pengguna yang terkait
FR01 Sistem menyediakan peta interaktif kampus yang dapat diakses secara online oleh semua pengguna. UR01
FR02 Sistem menyediakan fitur pencarian lokasi gedung, ruangan, atau fasilitas tertentu berdasarkan kata kunci. UR02
FR03 Sistem menyediakan informasi detail mengenai gedung dan ruangan. UR03
FR04 Sistem memberikan fitur navigasi berupa panduan rute tercepat menuju lokasi tujuan dengan visualisasi jalur. UR04
FR05 Sistem menghitung estimasi waktu tempuh berdasarkan jenis transportasi (jalan kaki/kendaraan) dan jarak antar lokasi. UR05
FR06 Sistem menyediakan galeri foto yang menampilkan dokumentasi visual dari gedung dan ruangan di lingkungan kampus. UR06
FR07 Sistem mendukung pelacakan posisi pengguna menggunakan GPS (jika tersedia). UR07
FR08 Sistem menyediakan opsi dark mode untuk meningkatkan kenyamanan visual pengguna. UR08
FR09 Sistem menyediakan halaman login khusus bagi admin untuk mengakses dan mengelola data. UR09
FR10 Sistem memungkinkan admin untuk mengelola data gedung, ruangan, lantai, dan foto (CRUD). UR10
FR11 Sistem memberikan hak akses penuh kepada admin untuk menambahkan, mengedit, dan menghapus data. UR11
FR12 Sistem menyediakan dashboard admin yang menampilkan informasi terkait data dan aktivitas sistem secara ringkas dan visual. UR12
FR13 Sistem menerapkan fitur logout otomatis setelah admin tidak aktif selama 1 jam untuk meningkatkan keamanan. UR13
FR14 Sistem memberikan notifikasi kepada admin sebelum sesi login berakhir agar dapat menyimpan data atau memperpanjang sesi jika diperlukan. UR14

3.2.4 Kebutuhan Non-Fungsional
Kebutuhan non-fungsional menjelaskan karakteristik sistem yang tidak berkaitan langsung dengan fitur utama, tetapi sangat penting untuk menjamin performa, keamanan, skalabilitas, dan pengalaman pengguna dalam penggunaan Web PointMap. Web ini dirancang untuk memberikan akses informasi ruang dan gedung secara interaktif dalam bentuk denah digital kampus yang optimal.
Tabel 3.3 Kebutuhan Non-Fungsional
No. Kebutuhan Non-Fungsional Relasi ke Kebutuhan Fungsional
NFR01 Responsif di berbagai perangkat (desktop, tablet, smartphone) FR-01, FR-02, FR-06, FR-08
NFR02 Waktu respon cepat, memuat halaman & peta ≤ 3 detik FR-01, FR-02, FR-04, FR-05
NFR03 Mendukung minimal 50 pengguna aktif bersamaan FR-01, FR-02, FR-03, FR-04, FR-05, FR-06,
NFR04
Keamanan autentikasi berbasis JWT & manajemen hak akses
FR-09, FR-10, FR-11, FR-13
NFR05 Penyimpanan kredensial admin terenkripsi FR-09
NFR06 Arsitektur modular (frontend & backend terpisah) Semua FR
NFR07 Optimasi penyimpanan data spasial (GeoJSON file statis) FR-01, FR-04, FR-05
NFR08
Dokumentasi teknis tersedia untuk pengembang berikutnya
Semua FR
NFR09 Tetap berjalan baik di koneksi lambat (kompresi & cache) FR-01, FR-02, FR-04, FR-05
NFR10 Antarmuka intuitif & ramah pengguna Semua FR yang berhubungan langsung dengan pengguna

3.3 Desain
Desain website dilakukan untuk menggambarkan bagaimana website PointMap akan dibangun berdasarkan kebutuhan yang telah dianalisis sebelumnya. Pada tahap ini, desain difokuskan pada beberapa aspek penting yaitu modul-modul utama, tampilan antarmuka pengguna (UI/UX), dan basis data yang digunakan. Tujuannya adalah agar implementasi sistem nantinya dapat berjalan sesuai rencana dan mudah dipahami oleh pengembang maupun pengguna.
3.3.1 Desain Modul
Desain modul merupakan bagian penting dalam pengembangan website karena setiap fitur atau fungsi dalam sistem akan dibagi ke dalam modul-modul yang terstruktur. Modul-modul ini dirancang untuk mempermudah pengelompokan fungsi, meningkatkan efisiensi pengembangan, dan memudahkan proses debugging.
Tabel 3.4 Desain Modul
Nama Modul Fungsi Pengguna

Modul Autentikasi Mengelola proses login, logout, dan validasi token admin, termasuk logout otomatis dan notifikasi akhir sesi. Admin
Modul Peta Interaktif Menampilkan peta 2D dan 2.5D kampus dengan fitur zoom, klik gedung, dan integrasi GeoJSON. Mendukung multiple layer peta dan kontrol navigasi. Admin, Pengunjung
Modul Pencarian Lokasi Memungkinkan pengguna mencari gedung, ruangan, atau fasilitas berdasarkan kata kunci dengan fitur autocomplete dan filter. Admin, Pengunjung
Modul Navigasi & Routing Menyediakan panduan rute tercepat dan estimasi waktu tempuh menggunakan algoritma Dijkstra dan fallback routing. Mendukung mode transportasi jalan kaki dan kendaraan dengan pertimbangan jalur oneway. Pengunjung
Modul Informasi Gedung & Ruangan Menampilkan detail gedung dan ruangan, seperti nama, kategori, kapasitas dan keterangan tambahan. Admin, Pengunjung
Modul Galeri Menyajikan foto-foto gedung dan ruangan yang terkait, serta mengelola konten galeri. Admin, Pengunjung
Modul Pelacakan Posisi (GPS) Menampilkan posisi pengguna jika perangkat mendukung GPS. Pengunjung
Modul Dark Mode Mengatur tampilan website menjadi mode gelap untuk kenyamanan visual. Admin, Pengunjung
Modul Manajemen Data Mengelola data gedung, ruangan, lantai, dan foto (CRUD) melalui dashboard admin. Admin
Modul Dashboard Admin Menyediakan tampilan ringkas untuk memantau data dan aktivitas sistem. Admin

3.3.2 Desain UI / UX
Desain antarmuka pengguna (UI) dan pengalaman pengguna (UX) pada Website PointMap dirancang menggunakan wireframe yang dibuat di platform wireframe.cc. Tujuan utama desain ini adalah untuk memastikan setiap elemen tampilan mendukung kemudahan navigasi, keterbacaan informasi, dan efisiensi interaksi pengguna, baik untuk peran Pengunjung maupun Admin.

Setiap halaman dan modal dirancang dengan pendekatan sederhana namun fungsional, mengikuti prinsip responsive design sehingga dapat digunakan di berbagai perangkat. Berikut adalah uraian desain UI/UX berdasarkan halaman dan interaksi yang tersedia pada sistem:

1. Halaman Beranda
   Halaman awal yang menampilkan peta interaktif. Pengguna dapat menjelajahi area Polnep, melakukan pencarian lokasi, serta mengakses informasi umum. Terdapat kontrol navigasi, tombol zoom, layer control, dan fitur dark mode.

Gambar 3.4 Halaman Beranda

2. Bangunan di klik
   Saat pengguna mengklik bangunan pada peta, muncul popup berisi nama bangunan, gambar thumbnail, serta tombol Detail Bangunan dan Rute.

Gambar 3.5 Halaman Beranda Bangunan diklik

3. Detail Bangunan di klik
   Menampilkan peta dalam mode 2.5D, dengan kontrol untuk mengganti tampilan lantai antara mode 2.5D dan 2D. Di sisi kanan terdapat daftar lantai beserta list ruangan yang ada pada lantai yang dipilih. Halaman ini tidak menampilkan informasi gedung, hanya daftar ruangan untuk dipilih.

Gambar 3.6 Halaman Beranda Detail Bangunan

4. Ruangan di klik
   Saat salah satu ruangan pada daftar dipilih, akan muncul tampilan yang berisi informasi singkat ruangan, seperti nama, kapasitas, dan deskripsi singkat. Bagian ini juga menampilkan galeri foto ruangan tersebut.

Gambar 3.7 Halaman Beranda Detail Ruangan

5. Rute di klik
   Saat tombol Rute pada popup bangunan ditekan, tampil modal pengaturan rute untuk memilih mode transportasi (Jalan Kaki atau Kendaraan) dan lokasi awal dari daftar atau menggunakan Lokasi Saya (GPS).

Gambar 3.8 Halaman Beranda Modal Rute

6. Instruksi Navigasi
   Setelah rute ditampilkan, pengguna dapat membuka panel Instruksi Navigasi yang berisi daftar langkah perjalanan. Panel ini memiliki tombol Next dan Prev untuk berpindah antar langkah, serta menampilkan estimasi jarak (meter) dan waktu tempuh (menit) untuk setiap segmen rute.

Gambar 3.9 Halaman Beranda Instruksi Navigasi

7. Login
   Halaman untuk autentikasi admin. Terdapat kolom username, password, tombol Login, serta pesan peringatan jika kredensial tidak valid.

Gambar 3.10 Halaman Login 8. Dashboard
Tampilan utama admin untuk mengelola data sistem. Struktur mirip dengan Homepage, namun tanpa hero section dan footer. Hanya terdapat navbar dan kanvas peta interaktif.

Gambar 3.11 Halaman Dashboard 9. Bangunan di klik (Dashboard)
Sama seperti di Homepage, namun di samping nama dan thumbnail terdapat tombol Edit untuk mengubah data bangunan.

Gambar 3.12 Halaman Dashboard Bangunan diklik

10. Edit Nama Interaksi di klik
    Menampilkan modal dengan input teks untuk nama bangunan/ruangan dan select box untuk memilih jenis interaksi (Interaktif atau Noninteraktif).

Gambar 3.13 Halaman Dashboard Modal Edit nama dan interaksi 11. Edit Thumbnail di klik
Menampilkan modal untuk memperbarui gambar thumbnail bangunan atau ruangan. Admin dapat memilih file gambar baru.

Gambar 3.14 Halaman Dashboard Modal Edit Thumbnail Bangunan

12. Edit Lantai di klik
    Menampilkan daftar lantai beserta gambar denahnya. Admin dapat mengelola detail setiap lantai dari sini.

Gambar 3.15 Halaman Dashboard Modal Edit Lantai Bangunan 13. Tambah Lantai di klik
Menampilkan modal dengan input untuk mengunggah file denah lantai dalam format SVG saja.

Gambar 3.16 Halaman Dashboard Modal Tambah Lantai

14. Hapus Lantai di klik
    Menampilkan modal konfirmasi dengan opsi Ya atau Batal sebelum lantai dihapus dari sistem.

Gambar 3.17 Halaman Dashboard Modal Hapus Lantai 15. List Lantai di klik
Menampilkan daftar ruangan pada lantai yang dipilih, dengan opsi untuk Edit, Hapus, atau Tambah Ruangan.

Gambar 3.18 Halaman Dashboard Modal Ruangan

3.3.3 Desain Basis Data
Desain basis data merupakan tahap penting dalam pembangunan sistem informasi karena berfungsi sebagai fondasi utama dalam pengelolaan data yang akan digunakan oleh sistem. Perancangan basis data dilakukan dengan pendekatan model relasional, di mana data dikelompokkan ke dalam beberapa entitas yang saling berhubungan, serta disusun sedemikian rupa agar mendukung integritas data, efisiensi proses, dan kemudahan pemeliharaan di masa mendatang.
Basis data yang digunakan dalam sistem PointMap dirancang untuk menangani berbagai informasi terkait peta interaktif lingkungan kampus, seperti data bangunan, ruangan, gambar lantai, galeri foto, serta administrator sistem. Perancangan ini mempertimbangkan struktur hierarkis dan keterkaitan antar entitas agar mendukung fitur-fitur utama sistem seperti navigasi ruangan, pengelompokan berdasarkan jurusan atau program studi, hingga visualisasi peta berbasis SVG dan GeoJSON.

Gambar 3.19 Desain Basis Data

1. Entitas dan Atribut

   a) Tabel admin
   Tabel ini menyimpan data administrator yang memiliki hak akses penuh terhadap sistem, termasuk kemampuan untuk mengelola data bangunan, lantai, ruangan, dan galeri. Atribut yang digunakan meliputi:
   1. id_admin sebagai primary key (INT, AUTO_INCREMENT)
   2. username untuk nama pengguna (VARCHAR 50, UNIQUE)
   3. password untuk sandi yang disimpan dalam bentuk terenkripsi menggunakan bcrypt (VARCHAR 100)

   b) Tabel bangunan
   Tabel ini menyimpan data utama mengenai setiap bangunan yang ada di lingkungan kampus. Atribut penting meliputi:
   1. id_bangunan sebagai primary key (INT, AUTO_INCREMENT)
   2. nama bangunan (VARCHAR 100)
   3. interaksi yang menentukan jenis bangunan menggunakan ENUM dengan nilai 'Interaktif' atau 'Noninteraktif'
   4. lantai sebagai jumlah lantai gedung (INT)
   5. geometri yang menyimpan data geometrik dalam format GeoJSON tipe Polygon (TEXT)
   6. thumbnail sebagai path file gambar representasi bangunan (VARCHAR 500)
   7. kategori_kampus untuk menentukan lokasi kampus dengan nilai default 'Politeknik Negeri Pontianak' (VARCHAR 100). Nilai yang mungkin: Politeknik Negeri Pontianak, PSDKU Polnep Sanggau, PDD Polnep Kapuas Hulu, atau PSDKU Polnep Sukamara

   c) Tabel lantai_gambar
   Menyimpan data gambar denah per lantai gedung dalam bentuk file SVG untuk ditampilkan saat pengguna memilih mode 2D atau 2.5D. Gambar ini berkaitan langsung dengan entitas bangunan, dan memiliki atribut seperti:
   1. id_lantai_gambar sebagai primary key (INT, AUTO_INCREMENT)
   2. id_bangunan sebagai foreign key yang mengacu ke tabel bangunan (INT, NOT NULL)
   3. nama_file untuk identifikasi file denah (VARCHAR 255), contoh: Lt1.svg, Lt2.svg
   4. path_file sebagai path lengkap file SVG (VARCHAR 500)
   5. created_at sebagai penanda waktu unggah (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

   d) Tabel ruangan
   Merupakan entitas penting yang merepresentasikan ruangan dalam setiap bangunan. Tabel ini menyimpan informasi seperti:
   1. id_ruangan sebagai primary key (INT, AUTO_INCREMENT)
   2. nama_ruangan untuk identitas ruangan (VARCHAR 100, NOT NULL)
   3. nomor_lantai untuk menentukan lantai tempat ruangan berada (INT, NOT NULL)
   4. id_bangunan sebagai foreign key yang mengacu ke tabel bangunan (INT, NOT NULL)
   5. nama_jurusan untuk afiliasi jurusan yang menempati ruangan (VARCHAR 100, opsional)
   6. nama_prodi untuk afiliasi program studi (VARCHAR 100, opsional)
   7. pin_style sebagai kategori style marker dengan nilai default 'default' (VARCHAR 50), contoh nilai: default, ruang_kelas, kantor, laboratorium
   8. posisi_x sebagai koordinat horizontal (dalam persen 0-100) pin marker pada denah SVG (DECIMAL 10,2)
   9. posisi_y sebagai koordinat vertikal (dalam persen 0-100) pin marker pada denah SVG (DECIMAL 10,2)

   e) Tabel ruangan_gallery
   Tabel ini digunakan untuk menyimpan dokumentasi berupa foto dari masing-masing ruangan. Setiap entri memiliki:
   1. id_gallery sebagai primary key (INT, AUTO_INCREMENT)
   2. id_ruangan sebagai foreign key yang mengacu ke entitas ruangan (INT, NOT NULL)
   3. nama_file untuk identifikasi file foto (VARCHAR 255)
   4. path_file sebagai path lengkap file gambar (VARCHAR 500)
   5. created_at sebagai timestamp penanda waktu unggah (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

2. Relasi Antar Entitas
   Relasi antar tabel dirancang dengan memperhatikan integritas referensial melalui penggunaan foreign key. Setiap foreign key diberikan aturan CASCADE DELETE agar ketika entitas induk dihapus, maka seluruh entitas yang bergantung padanya juga akan terhapus secara otomatis. Pendekatan ini bertujuan untuk menjaga konsistensi dan integritas data serta mencegah adanya data yang tidak lagi memiliki referensi (orphan record).

   Adapun relasi antar entitas dalam sistem ini adalah sebagai berikut:
   a) Tabel bangunan ke lantai_gambar: Relasi One-to-Many  
    Kolom id_bangunan pada tabel lantai_gambar memiliki relasi foreign key ke kolom id_bangunan pada tabel bangunan. Satu bangunan dapat memiliki banyak denah lantai. Aturan: ON DELETE CASCADE.

   b) Tabel bangunan ke ruangan: Relasi One-to-Many  
    Kolom id_bangunan pada tabel ruangan memiliki relasi foreign key ke kolom id_bangunan pada tabel bangunan. Satu bangunan dapat memiliki banyak ruangan. Aturan: ON DELETE CASCADE.

   c) Tabel ruangan ke ruangan_gallery: Relasi One-to-Many  
    Kolom id_ruangan pada tabel ruangan_gallery memiliki relasi foreign key ke kolom id_ruangan pada tabel ruangan. Satu ruangan dapat memiliki banyak foto galeri. Aturan: ON DELETE CASCADE.

   d) Tabel admin: Standalone  
    Tabel admin tidak memiliki relasi foreign key dengan tabel lain. Tabel ini berfungsi secara independen untuk keperluan autentikasi dan otorisasi administrator sistem.

   Dengan skema ini, seluruh data yang memiliki keterkaitan secara logis akan tetap terjaga relasinya selama sistem dijalankan, dan akan dibersihkan secara otomatis ketika data induk dihapus. Struktur relasi membentuk hierarki sebagai berikut: tabel bangunan memiliki relasi ke tabel lantai_gambar, serta tabel bangunan memiliki relasi ke tabel ruangan yang kemudian memiliki relasi ke tabel ruangan_gallery.

3. Diagram Entitas Relasi (ERD)  
   Untuk memberikan gambaran visual terhadap struktur basis data dan hubungan antar entitas, berikut ditampilkan diagram Entity Relationship Diagram (ERD) yang merepresentasikan desain logis dari sistem PointMap.

4. Indeks Basis Data  
   Untuk meningkatkan performa query, terutama filtering berdasarkan kampus, ditambahkan indeks pada kolom kategori_kampus di tabel bangunan dengan nama idx_bangunan_kampus. Indeks ini mempercepat pencarian dan filtering bangunan berdasarkan kategori kampus tertentu.

3.4 Pengkodean
Tahap pengkodean merupakan proses penerjemahan hasil perancangan sistem ke dalam bentuk kode program yang dapat dijalankan oleh komputer. Seluruh rancangan modul, alur kerja, serta antarmuka yang telah disusun pada tahap desain diimplementasikan menggunakan bahasa pemrograman dan teknologi yang telah ditentukan pada tahap sebelumnya.
Pengkodean pada proyek ini mengikuti prinsip clean code, modular programming, dan best practices pengembangan perangkat lunak untuk memastikan kode yang dihasilkan mudah dipahami, dikelola, serta dikembangkan pada tahap pemeliharaan.
Kegiatan pengkodean diawali dengan penyiapan development environment, konfigurasi basis data, dan pembuatan API pada sisi backend. Selanjutnya, dilakukan pengembangan antarmuka (frontend) yang terintegrasi dengan API tersebut. Setiap modul dikembangkan secara terpisah, namun tetap mempertahankan konsistensi struktur kode, naming convention, dan standar dokumentasi.
3.4.1 Struktur File Backend
Backend aplikasi PointMap dibangun menggunakan Node.js dengan Express.js sebagai framework utama. Struktur backend disusun secara terorganisasi dengan memisahkan bagian pengelolaan data, logika pemrosesan, dan pengaturan rute API, sehingga kode lebih mudah dibaca, dipelihara, dan dikembangkan untuk kebutuhan selanjutnya.

Gambar 3.20 Struktur File Backend

A. /config/
Folder konfigurasi yang berisi file-file konfigurasi sistem:

1. db.js
   Konfigurasi database MySQL dengan Sequelize ORM, connection pooling, dan error handling

Gambar 3.21 Struktur File Backend /config/

B. /controllers/
Folder yang berisi logika bisnis aplikasi:

1. auth.js
   Controller untuk autentikasi admin dengan JWT, password hashing, dan session management.
2. bangunan.js
   Controller untuk manajemen data gedung dengan CRUD operations dan validasi file upload untuk thumbnail management.
3. lantaiGambar.js
   Controller untuk manajemen gambar lantai dengan upload dan kompresi otomatis.
4. maintenance.js
   Controller untuk database maintenance termasuk reset auto-increment dan reordering ID untuk tabel ruangan, ruangan_gallery, dan lantai_gambar.
5. ruangan.js
   Controller untuk manajemen data ruangan dengan fitur CRUD lengkap, pin positioning untuk tampilan 2.5D, dan integrasi dengan bangunan.
6. ruanganGallery.js
   Controller untuk galeri foto ruangan dengan image optimization.

Gambar 3.22 Struktur File Backend /controllers/

C. /middlewares/

1. auth.js
   Middleware untuk validasi JWT token dengan error handling yang detail untuk expired token dan invalid token.
2. upload.js
   Middleware untuk handling file upload dengan validasi tipe file (gambar dan SVG), file size limit (10MB), dan storage management.

Gambar 3.23 Struktur File Backend /middlewares/
D. /models/

1. index.js
   Mengatur konfigurasi database Sequelize, termasuk connection pooling dan pengaturan associations antar model (Ruangan-Bangunan, LantaiGambar-Bangunan, RuanganGallery-Ruangan).
2. Admin.js
   Model data untuk admin, dilengkapi fitur password hashing.
3. Bangunan.js
   Model data gedung yang mendukung informasi bangunan dan data geospasial.
4. LantaiGambar.js
   Model data gambar lantai dengan dukungan version control dan metadata.
5. Ruangan.js
   Model data ruangan dengan fitur identifikasi ruangan (nama, lantai, jurusan, prodi), pin positioning untuk tampilan 2.5D (posisi_x, posisi_y), dan styling pin (pin_style) untuk visualisasi interaktif pada peta lantai.
6. RuanganGallery.js
   Model data galeri foto ruangan.

Gambar 3.24 Struktur File Backend /models/
E. /routes/

1. auth.js
   Mengelola rute autentikasi, termasuk manajemen JWT dan password reset.
2. bangunan.js
   Rute CRUD untuk gedung, mendukung RESTful API dan geospatial queries.
3. lantaiGambar.js
   Rute manajemen gambar lantai dengan dukungan image processing.
4. maintenance.js
   Rute untuk database maintenance dan reset auto-increment dengan role-based access control.
5. ruangan.js
   Rute CRUD untuk ruangan dengan fitur public access untuk tampilan 2.5D dan admin-only untuk manajemen data.
6. ruanganGallery.js
   Rute manajemen galeri foto ruangan.

Gambar 3.25 Struktur File Backend /routes/

F. /tools/

1. hash_password.js
   Utility script untuk meng-generate hash password menggunakan bcrypt sebelum menyimpan kredensial admin ke database. Script ini dijalankan secara manual di terminal dan tidak termasuk dalam runtime aplikasi.

Gambar 3.26 Struktur File Backend /tools/

G. File utama

1. server.js
   Entry point aplikasi dengan konfigurasi Express dan middleware.
2. package.json
   Dependencies dan script npm

Gambar 3.27 Struktur File Backend File Utama
3.4.2 Struktur File Frontend
Frontend aplikasi PointMap dibangun dengan framework Next.js 14 dan TypeScript untuk mendukung pengembangan yang terstruktur. Styling antarmuka menggunakan Tailwind CSS, sedangkan fitur peta interaktif diimplementasikan dengan Leaflet.
A. /src/app/

1. layout.tsx
   Layout utama aplikasi dengan theme provider dan font configuration (Inter & Oswald fonts)
2. layout-metadata.ts
   Konfigurasi metadata untuk SEO dengan title "PointMap" dan deskripsi "Polnep Interactive Map"
3. page.tsx
   Halaman utama dengan hero section, slider carousel, dan integrasi peta interaktif file LeafletMap
4. globals.css
   CSS global dengan Tailwind CSS dan custom variables.

5. theme-provider.tsx
   Provider untuk pengaturan dark/light mode switching menggunakan next-themes.
6. login/page.tsx
   Halaman login admin dengan validasi formulir yang aman dan background design yang menarik.
7. dashboard/
   Folder routing untuk dashboard admin dengan struktur:
   - layout.tsx: Layout khusus dashboard dengan sidebar dan navigasi
   - page.tsx: Halaman utama dashboard dengan visualisasi data bangunan dan ruangan, serta integrasi peta interaktif
   - bangunan/page.tsx: Halaman manajemen data bangunan
   - lantai/page.tsx: Halaman manajemen data lantai
   - ruangan/page.tsx: Halaman manajemen data ruangan
   - galeri/page.tsx: Halaman manajemen galeri foto

Gambar 3.28 Struktur File Frontend

B. /src/components/

1. dashboard/BangunanForm.tsx
   Form manajemen gedung dengan upload thumbnail dan geometri drawing.
2. dashboard/GaleriForm.tsx
   Form manajemen galeri foto ruangan dengan image upload.
3. dashboard/LantaiForm.tsx
   Form manajemen lantai dengan SVG upload dan preview.
4. dashboard/Modal.tsx
   Komponen modal reusable untuk dashboard dengan backdrop dan close handler.
5. dashboard/RuanganForm.tsx
   Form manajemen ruangan dengan pin positioning di denah lantai.
6. dashboard/Sidebar.tsx
   Sidebar navigasi dashboard dengan menu dan logout.
7. dashboard/SidebarCampusSwitcher.tsx
   Komponen switcher kampus di sidebar dashboard.
8. map/LeafletMap/BuildingDetailModal.tsx
   Modal detail gedung dengan desain responsif dan fitur edit.
9. map/LeafletMap/DrawingSidebar.tsx
   Sidebar untuk drawing tools dan layer management di MapEditor.
10. map/LeafletMap/EditLantaiImageUploader.tsx
    Uploader gambar lantai dengan manajemen file SVG.
11. map/LeafletMap/EditRuanganForm.tsx
    Form edit ruangan dengan dynamic fields dan validasi.
12. map/LeafletMap/MapControlsPanel.tsx
    Panel kontrol peta dengan layer switching, search, dan legend.
13. CampusSelector.tsx
    Komponen dropdown selector untuk memilih kampus aktif dengan styling responsif.
14. DashboardMap.tsx
    Komponen peta khusus untuk tampilan dashboard admin dengan fitur edit dan management.
15. LeafletMap.tsx
    Komponen utama peta interaktif dengan Leaflet yang mengintegrasikan semua fitur peta dan manajemen data bangunan/ruangan.
16. MapEditor.tsx
    Komponen editor peta untuk menambah/edit geometri bangunan dengan drawing tools dan polygon editor.
17. ParticlesCustom.tsx
    Komponen animasi particles untuk latar belakang dengan efek polkadot (mode terang) dan bintang (mode gelap).
18. Toast.tsx
    Komponen notifikasi toast untuk menampilkan pesan feedback ke user.
19. ToastProvider.tsx
    Provider untuk manajemen state toast secara global dengan animasi dan auto-dismiss.

Gambar 3.29 Struktur File Frontend /src/components/

C. /src/config/

1. campusConfig.ts
   Konfigurasi data kampus multi-lokasi yang berisi informasi nama kampus, koordinat center map, dan level zoom default untuk setiap kampus (Pontianak, Sanggau, Kapuas Hulu, Sukamara).

Gambar 3.30 Struktur File Frontend /src/config/

D. /src/context/

1. CampusContext.tsx
   React Context Provider untuk manajemen state kampus yang dipilih secara global, memungkinkan komponen di seluruh aplikasi mengakses dan mengubah kampus aktif.

Gambar 3.31 Struktur File Frontend /src/context/

E. /src/hooks/

1. auth/useAuth.ts
   Hook untuk mengelola status autentikasi dan manajemen token dengan fitur auto-logout, role-based access control, dan state management untuk login/logout.
2. useCampus.ts
   Hook untuk mengelola state kampus yang dipilih dengan context API, mendukung multi-campus filtering dan state persistence.
3. map/useFeatureSearch.ts
   Hook untuk pencarian fitur peta dengan autocomplete yang mendukung pencarian bangunan dan ruangan dengan display type dan informasi tambahan.
4. map/useMapRefs.ts
   Hook untuk mengelola referensi Leaflet map instance, markers, dan layers dengan cleanup otomatis.
5. map/useMapState.ts
   Hook untuk mengelola state peta termasuk posisi, zoom level, selected features, dan mode tampilan (2D/2.5D).

Gambar 3.32 Struktur File Frontend /src/hooks/

F. /src/lib/

1. auth.ts
   Fungsi autentikasi dan validasi dengan praktik keamanan, termasuk JWT token validation, auto-logout scheduling, dan localStorage management.
2. map/basemaps.ts
   Konfigurasi layer peta dasar dari berbagai penyedia (Esri Satellite, Esri Topographic, Dark Carto, OpenStreetMap) tanpa memerlukan API key.
3. map/constants.ts
   Konstanta untuk peta dan routing, termasuk endpoint GeoJSON bangunan dari backend dan file GeoJSON statis untuk layer referensi.

Gambar 3.33 Struktur File Frontend /src/lib/

G. /src/services/

1. bangunan.ts
   Service untuk operasi gedung dengan fungsi updateBangunan dan uploadBangunanThumbnail, termasuk error handling dan JWT authentication.
2. lantaiGambar.ts
   Service untuk pengelolaan gambar lantai dengan CRUD operations (getLantaiGambarByBangunan, createLantaiGambar, deleteLantaiGambar, updateLantaiGambar) dan file upload handling.
3. ruangan.ts
   Service untuk operasi ruangan dengan CRUD operations (createRuangan, updateRuangan, getRuanganByBangunan, deleteRuangan) dan integrasi dengan data bangunan.

Gambar 3.34 Struktur File Frontend /src/services/

H. /src/types/

1. map.ts
   Tipe data (types) untuk peta, routing, dan fitur geografis, termasuk interface FeatureProperties untuk properti umum fitur peta (bangunan/ruangan), FeatureFixed yang extends GeoJSON. Feature, dan alias FeatureType yang digunakan di komponen.

Gambar 3.35 Struktur File Frontend /src/types/

I. /public/

1. img/
   Folder gambar gedung, lantai, dan ruangan yang terorganisir berdasarkan ID bangunan dengan optimasi.
2. Slider/
   Gambar latar belakang slider untuk hero section dengan transisi halus (smooth transitions).
3. building-details/
   Halaman detail gedung yang berdiri sendiri (standalone) dengan struktur lengkap:
   - index.html: Halaman utama untuk tampilan 2D/2.5D detail bangunan
   - css/: Folder stylesheet untuk styling halaman detail
   - js/: Folder JavaScript untuk logika interaktif (navigasi lantai, pin marker, gallery)
   - README.md: Dokumentasi teknis building-details
4. flags/
   Icon bendera untuk fitur translate/multi-bahasa (PNG format).
5. icon.svg
   Icon aplikasi PointMap untuk favicon
6. logo.svg
   Logo PointMap untuk branding di navbar dan hero section.
7. maps.svg
   Ilustrasi peta untuk dekorasi UI.

Gambar 3.36 Struktur File Frontend /public/

J. File Konfigurasi

1. next.config.ts
   Konfigurasi Next.js dengan pengaturan untuk build, image optimization, dan environment variables.
2. tailwind.config.ts
   Konfigurasi Tailwind CSS dengan custom theme, colors, dan design system yang disesuaikan untuk aplikasi PointMap.
3. tsconfig.json
   Konfigurasi TypeScript dengan strict mode dan path aliases (@/) untuk import yang lebih clean.
4. eslint.config.mjs
   Konfigurasi ESLint untuk linting dan code quality dengan aturan Next.js dan TypeScript.
5. postcss.config.js
   Konfigurasi PostCSS untuk processing Tailwind CSS dan autoprefixer.
6. package.json
   Manifest aplikasi yang berisi metadata, dependencies, dan npm scripts untuk development dan production.
7. package-lock.json
   Lock file yang mengunci versi spesifik dari semua dependencies untuk konsistensi instalasi.
8. next-env.d.ts
   TypeScript declarations otomatis yang di-generate oleh Next.js untuk type definitions.

Gambar 3.37 Struktur File Konfigurasi Frontend

BAB IV
HASIL DAN PEMBAHASAN

4.1 Skenario Pengujian
Pengujian sistem PointMap dilakukan dengan metode integration testing untuk memastikan seluruh komponen dan fitur dapat bekerja sama sesuai rancangan pada Bab III. Pengujian mencakup fitur yang dapat diakses tanpa login (guest) hingga fitur yang memerlukan autentikasi sebagai admin.

Tabel 4.1 berikut menyajikan rincian skenario pengujian yang telah dilakukan:

**Tabel 4.1 Skenario Pengujian**

| Kasus Uji & Langkah Pengujian                                                                                                                                                                                                                                                                                                    | Tujuan                                                            | Hasil yang Diharapkan                                                                                                                                                                                                                                                                                                           | Hasil Aktual                                                                                                                                                                                                                                                                                                  | Status   |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| **Halaman Beranda – Navbar & Language Toggle** 1. Muat halaman pertama kali. 2. Klik tombol Dark Mode. 3. Klik tombol Language Toggle (ID/EN). 4. Periksa tampilan cuaca di navbar.                                                                                                                                              | Memastikan navbar dan kontrol global berfungsi.                   | Navbar tampil dengan logo PointMap. Dark mode mengubah tema warna. Toggle bahasa mengubah interface ke English/Indonesia. Informasi cuaca Pontianak ditampilkan (suhu & kondisi).                                                                                                                                               | Navbar tampil normal dengan semua elemen. Dark mode berfungsi dengan baik. Language toggle bekerja sempurna. Cuaca muncul via OpenWeatherMap API.                                                                                                                                                             | Berhasil |
| **Halaman Beranda – Hero Section & Campus Selection** 1. Perhatikan slider background hero section. 2. Pilih salah satu campus card (Pontianak/Sanggau/Kapuas Hulu/Sukamara). 3. Verifikasi scroll otomatis ke peta.                                                                                                             | Memastikan hero section interaktif dan campus selector berfungsi. | Background hero berganti otomatis setiap 5 detik (4 gambar). Klik campus card auto-scroll ke canvas peta. Peta menampilkan view sesuai kampus yang dipilih.                                                                                                                                                                     | Background slider smooth transition. Campus card click berfungsi. Auto-scroll ke peta sempurna. View peta berubah sesuai koordinat kampus.                                                                                                                                                                    | Berhasil |
| **Canvas Peta – Multi-Campus Support** 1. Gunakan campus selector di header peta. 2. Pilih kampus berbeda (Pontianak, Sanggau, Kapuas Hulu, Sukamara). 3. Periksa perubahan koordinat & zoom level.                                                                                                                              | Memastikan sistem multi-campus berfungsi.                         | Dropdown campus selector tampil di header peta. Peta langsung pindah ke center koordinat kampus yang dipilih. Zoom level sesuai konfigurasi per kampus. Hanya bangunan kampus terpilih yang ditampilkan.                                                                                                                        | Campus selector berfungsi sempurna. Map center & zoom berubah dengan smooth. Filter bangunan per kampus akurat.                                                                                                                                                                                               | Berhasil |
| **Canvas Peta – Layer Control & Basemap** 1. Klik kontrol layer (pojok kanan atas). 2. Toggle visibility layer Buildings. 3. Ganti basemap dari Satellite (default) ke Topographic, lalu ke Dark Carto.                                                                                                                          | Memastikan layer control dan basemap switching berfungsi.         | Layer control dapat membuka panel basemap & overlay. Toggle Buildings menampilkan/menyembunyikan semua bangunan. Basemap berganti sesuai pilihan tanpa reload page.                                                                                                                                                             | Layer control panel tampil responsif. Buildings layer dapat di-toggle. Basemap switching lancar (Esri Satellite sebagai default, Esri Topographic, Dark Carto).                                                                                                                                               | Berhasil |
| **Canvas Peta – Kontrol Zoom & Reset** 1. Klik tombol Zoom In (+) beberapa kali. 2. Klik tombol Zoom Out (-). 3. Klik tombol Reset Position. 4. Test scroll wheel zoom.                                                                                                                                                          | Memastikan kontrol navigasi peta berfungsi.                       | Zoom in/out bekerja dengan smooth. Reset position mengembalikan ke center & zoom awal kampus. Scroll wheel dapat zoom peta. Tidak ada grey tiles saat zoom maksimal.                                                                                                                                                            | Zoom buttons berfungsi sempurna. Reset position dengan flyTo animation. Scroll zoom enabled. MaxZoom terkonfigurasi per kampus.                                                                                                                                                                               | Berhasil |
| **Interaksi Bangunan – Popup & Thumbnail** 1. Klik polygon bangunan di peta (pilih bangunan Interaktif). 2. Lihat isi popup. 3. Klik thumbnail gambar untuk full view.                                                                                                                                                           | Memastikan building interaction dan popup berfungsi.              | Popup muncul dengan nama bangunan. Thumbnail bangunan ditampilkan. Tombol "Detail Bangunan" tersedia. Klik thumbnail membuka gambar full size.                                                                                                                                                                                  | Popup tampil responsif dengan info lengkap. Thumbnail loading dengan benar. Klik thumbnail buka image viewer. Close button (X) berfungsi.                                                                                                                                                                     | Berhasil |
| **Detail Bangunan – Mode 2.5D & Floor Navigation** 1. Klik "Detail Bangunan" di popup. 2. Pilih lantai berbeda dari dropdown/list. 3. Toggle antara mode 2D dan 2.5D. 4. Test responsive di mobile.                                                                                                                              | Memastikan building detail page dan floor switching berfungsi.    | Redirect ke halaman building-details standalone. Default tampilan 2.5D dengan SVG floor plan. Dapat switch floor dengan smooth transition. Toggle 2D/2.5D mengubah perspektif. Layout responsive untuk mobile.                                                                                                                  | Building detail page load sempurna. Floor switching instant tanpa lag. 2D/2.5D toggle animation smooth. Mobile view optimal dengan touch friendly.                                                                                                                                                            | Berhasil |
| **Detail Ruangan – Pin Marker & Gallery** 1. Di halaman detail bangunan, klik pin marker ruangan pada floor plan. 2. Atau klik nama ruangan di list sebelah kanan. 3. Lihat info ruangan (nama, jurusan, prodi). 4. Klik tombol Gallery untuk lihat foto ruangan.                                                                | Memastikan room interaction dan gallery berfungsi.                | Klik pin marker/list item membuka panel info ruangan. Info ruangan lengkap (nama, nomor lantai, jurusan, prodi). Tombol Gallery tersedia. Gallery modal menampilkan semua foto ruangan. Gallery dapat dinavigasi dengan tombol prev/next.                                                                                       | Pin marker click detection akurat. Info ruangan tampil lengkap. Gallery modal loading foto dengan benar. Navigation gallery (prev/next) lancar. Lightbox untuk zoom foto.                                                                                                                                     | Berhasil |
| **Pencarian – Search Functionality** 1. Klik search box di kontrol panel peta. 2. Ketik nama gedung (contoh: "Teknik Elektro"). 3. Ketik nama ruangan (contoh: "Lab"). 4. Pilih hasil dari autocomplete.                                                                                                                         | Memastikan fitur search dengan autocomplete berfungsi.            | Search box dapat diakses dari map controls. Autocomplete muncul saat mengetik (min 2 karakter). Hasil search menampilkan gedung & ruangan. Klik hasil auto-zoom ke lokasi yang dipilih. Popup otomatis muncul untuk item yang dipilih.                                                                                          | Search autocomplete real-time. Hasil search akurat dan terfilter. Klik hasil zoom & open popup. Search case-insensitive.                                                                                                                                                                                      | Berhasil |
| **Login Admin – Authentication** 1. Akses halaman /login. 2. Input username & password yang valid. 3. Klik tombol Login. 4. Verifikasi redirect ke dashboard.                                                                                                                                                                    | Memastikan sistem autentikasi berfungsi.                          | Halaman login tampil dengan form username & password. Input validation berfungsi. Login berhasil dengan kredensial benar. Token JWT disimpan di localStorage. Redirect otomatis ke /dashboard setelah login.                                                                                                                    | Login page UI clean & responsive. Form validation berfungsi. JWT token tersimpan. Auto-redirect ke dashboard. Error message muncul jika kredensial salah.                                                                                                                                                     | Berhasil |
| **Dashboard – Overview & Statistics** 1. Login sebagai admin. 2. Lihat halaman dashboard utama. 3. Periksa stat cards (Total Gedung, Lantai, Ruangan, Galeri). 4. Periksa list gedung terbaru. 5. Gunakan campus selector di sidebar.                                                                                            | Memastikan dashboard analytics dan multi-campus filter berfungsi. | Dashboard tampil tanpa hero section & footer. Stat cards menampilkan jumlah akurat per kategori. List gedung terbaru dengan pagination. Persentase digitalisasi kampus. Campus selector filter data real-time. Greeting message sesuai waktu (Pagi/Siang/Sore/Malam).                                                           | Dashboard layout clean & informative. Statistics akurat dan update real-time. Pagination gedung berfungsi. Campus filter instant update. Analytics card dengan visualisasi menarik.                                                                                                                           | Berhasil |
| **Admin – CRUD Bangunan** 1. Pilih gedung di peta dashboard. 2. Klik "Edit" di popup. 3. Ubah nama bangunan. 4. Ubah thumbnail (upload gambar baru). 5. Ubah status Interaktif/Noninteraktif. 6. Simpan perubahan.                                                                                                               | Memastikan manajemen data bangunan berfungsi.                     | Klik gedung membuka popup dengan tombol Edit. Modal edit muncul dengan form lengkap. Input nama dapat diubah. Upload thumbnail support JPG/PNG. Toggle Interaktif/Noninteraktif berfungsi. Tombol Simpan update data ke database. Toast notification muncul setelah berhasil.                                                   | Popup edit akurat. Form input validation berfungsi. Image upload + preview berfungsi. Data tersimpan ke DB. Toast "Berhasil memperbarui data" muncul. Peta auto-refresh data bangunan.                                                                                                                        | Berhasil |
| **Admin – Map Editor (Draw Geometry)** 1. Di dashboard, klik tombol "Tambah Gedung Baru". 2. Aktifkan drawing tools. 3. Gambar polygon untuk area bangunan. 4. Edit vertex polygon yang sudah dibuat. 5. Simpan geometri.                                                                                                        | Memastikan map drawing & editing tools berfungsi.                 | Drawing sidebar muncul dengan toolbar. Dapat draw polygon di peta. Vertex polygon dapat di-drag untuk edit shape. Delete vertex dengan klik kanan. Geometry tersimpan dalam format GeoJSON. Polygon langsung muncul di peta setelah save.                                                                                       | Drawing tools intuitif & responsive. Polygon drawing akurat. Edit mode berfungsi sempurna. GeoJSON valid & tersimpan. Real-time preview saat drawing.                                                                                                                                                         | Berhasil |
| **Admin – CRUD Lantai** 1. Pilih gedung, klik Edit, lalu Edit Lantai. 2. Klik "Tambah Lantai". 3. Upload file SVG denah lantai. 4. Edit nama/order lantai. 5. Hapus lantai (dengan konfirmasi). 6. Periksa notifikasi toast.                                                                                                     | Memastikan manajemen lantai berfungsi.                            | Modal list lantai tampil. Button Tambah Lantai buka upload form. Hanya accept file .SVG. Preview SVG sebelum upload. Edit lantai dapat ubah nama file. Konfirmasi muncul sebelum delete. Toast notification untuk setiap operasi (sukses/error).                                                                                | Modal lantai responsive. File validation (SVG only) berfungsi. Upload & preview SVG lancar. Delete dengan konfirmasi modal. Toast muncul dengan pesan yang sesuai: - "Format file harus SVG" - "Lantai berhasil ditambahkan" - "Lantai berhasil dihapus"                                                      | Berhasil |
| **Admin – CRUD Ruangan & Pin Positioning** 1. Pilih gedung, Edit Lantai, Pilih lantai, Lihat list ruangan. 2. Klik "Tambah Ruangan". 3. Isi form ruangan (nama, jurusan, prodi, dll). 4. Klik "Plot Lokasi Ruangan". 5. Klik posisi di denah SVG untuk set pin marker. 6. Simpan ruangan. 7. Edit & hapus ruangan.               | Memastikan manajemen ruangan dan pin positioning berfungsi.       | List ruangan per lantai ditampilkan. Form tambah ruangan lengkap. Modal plot lokasi tampilkan denah SVG lantai. Klik di SVG set posisi pin (posisi_x, posisi_y dalam %). Pin marker muncul di posisi yang diklik. Data tersimpan dengan koordinat akurat. Edit ruangan dapat ubah posisi pin. Delete ruangan dengan konfirmasi. | Form ruangan validation berfungsi. Modal plot lokasi load SVG dengan benar. Click detection akurat di SVG. Posisi pin tersimpan dalam % (0-100). Pin positioning presisi. CRUD ruangan lengkap berfungsi. Toast notification untuk semua operasi.                                                             | Berhasil |
| **Admin – CRUD Gallery Ruangan** 1. Pilih ruangan, klik "Edit Gallery". 2. Upload foto baru (JPG/PNG). 3. Preview foto yang sudah ada. 4. Hapus foto dari gallery. 5. Periksa limit ukuran file.                                                                                                                                 | Memastikan manajemen gallery ruangan berfungsi.                   | Modal gallery menampilkan semua foto ruangan. Button upload foto berfungsi. Support multiple file upload. File size limit 10MB. Preview thumbnail sebelum upload. Delete foto dengan konfirmasi. Toast notification setelah upload/delete.                                                                                      | Gallery modal responsive dengan grid layout. Multiple upload berfungsi. File validation (size, type) akurat. Image optimization otomatis. Delete foto instant update. Toast "Gallery berhasil ditambahkan/dihapus".                                                                                           | Berhasil |
| **Admin – Auto-Logout (1 Hari)** 1. Login sebagai admin. 2. Biarkan inactive selama durasi token (1 hari = 24 jam). 3. Atau manually test dengan expired token.                                                                                                                                                                  | Memastikan auto-logout setelah 1 hari berfungsi.                  | JWT token memiliki expiry 1 hari (86400 detik). Setelah 1 hari, token otomatis invalid. User di-logout otomatis. Redirect ke halaman login.                                                                                                                                                                                     | JWT expiry configuration 1 hari. Auto-logout trigger saat token expired. Local storage cleared. Auto-redirect ke /login.                                                                                                                                                                                      | Berhasil |
| **Admin – Logout Manual** 1. Klik tombol "Logout" di sidebar dashboard. 2. Verifikasi redirect ke halaman login. 3. Coba akses /dashboard tanpa login.                                                                                                                                                                           | Memastikan logout manual dan protected route berfungsi.           | Button Logout tampil di sidebar bawah. Klik logout hapus token dari localStorage. Redirect ke /login setelah logout. Protected route /dashboard require auth. Akses tanpa login auto-redirect ke /login.                                                                                                                        | Logout button berfungsi sempurna. Token & user data dihapus. Redirect ke login instant. Route protection dengan middleware auth. Unauthorized access blocked.                                                                                                                                                 | Berhasil |
| **Responsivitas Mobile – Homepage** 1. Buka website di mobile device atau browser dev tools (375px). 2. Test navbar mobile (logo, cuaca, dark mode, language toggle). 3. Test hero section di mobile (background slider, text, campus cards). 4. Test interaksi campus selector cards. 5. Test peta di mobile (touch zoom, pan). | Memastikan homepage responsive di perangkat mobile.               | Layout otomatis adjust untuk mobile. Navbar tetap full width tanpa hamburger menu. Cuaca simplified di mobile (hanya icon & suhu, tanpa deskripsi & tanggal). Hero section text & spacing optimal untuk small screen. Campus cards grid 2 kolom di mobile (grid-cols-2). Peta tetap interaktif dengan touch gestures.           | Mobile layout perfect (tested 375px, iPhone SE, iPhone 12, iPad). Navbar mobile compact dengan semua kontrol (logo, cuaca simplified, dark mode, language toggle). Hero section font size & spacing responsive. Campus cards 2x2 grid in mobile, smooth hover/click. Map touch zoom & pan berfungsi sempurna. | Berhasil |
| **Responsivitas Mobile – Dashboard Admin** 1. Login ke dashboard di mobile. 2. Uji sidebar mobile (menu toggle). 3. Uji tata letak kartu statistik. 4. Uji daftar gedung. 5. Uji input form & modal di mobile.                                                                                                                   | Memastikan dashboard responsif dan dapat digunakan di mobile.     | Sidebar mobile dengan tombol toggle (hamburger). Tata letak kartu statistik menyesuaikan grid (2 kolom → 1 kolom). Daftar gedung dapat di-scroll dan terbaca dengan baik. Input form & modal ramah mobile. Upload file berfungsi di browser mobile.                                                                             | Menu hamburger toggle sidebar berjalan lancar. Grid statistik responsif (2x2 di tablet, 1 kolom di mobile). Daftar gedung dengan scroll horizontal jika diperlukan. Modal form tampil penuh layar di mobile. Upload file berfungsi di browser iOS & Android.                                                  | Berhasil |
| **Dark Mode Persistence** 1. Aktifkan Dark Mode. 2. Refresh page / close tab. 3. Buka kembali website. 4. Verifikasi dark mode tetap aktif.                                                                                                                                                                                      | Memastikan dark mode preference tersimpan.                        | Dark mode preference disimpan di localStorage/cookies. Setelah refresh/reopen, theme tetap dark. Tidak ada flash of wrong theme (FOUT). Theme sync antara homepage & dashboard.                                                                                                                                                 | Theme preference saved via next-themes. localStorage `theme: "dark"` tersimpan. No FOUT, langsung load dengan theme yang benar. Sync perfect di semua page.                                                                                                                                                   | Berhasil |

Berdasarkan tabel di atas, seluruh kasus uji untuk fitur-fitur inti platform telah berhasil dijalankan dan memberikan hasil sesuai dengan yang diharapkan.

4.2 Hasil Pengujian
Hasil pengujian sistem PointMap diperoleh berdasarkan pelaksanaan skenario pengujian pada Tabel 4.1 Skenario Pengujian. Pengujian dilakukan secara sistematis menggunakan metode integration testing untuk memastikan setiap komponen sistem dapat bekerja sama dengan baik sesuai rancangan pada Bab III. Pengujian mencakup 20 kasus uji utama yang melibatkan fitur-fitur yang dapat diakses tanpa login (guest user) hingga fitur manajemen yang memerlukan autentikasi sebagai admin.

Setiap kasus uji dilakukan dengan langkah-langkah yang terstruktur, dimulai dari pengujian komponen dasar seperti navbar dan hero section, dilanjutkan dengan fitur peta interaktif dan multi-campus support, fitur pencarian dan navigasi, interaksi dengan bangunan dan ruangan, hingga pengujian pengelolaan data di dashboard admin. Pengujian juga mencakup aspek responsivitas di perangkat mobile dan persistensi pengaturan pengguna seperti dark mode.

Secara umum, seluruh fitur pada sistem telah berjalan sesuai dengan hasil yang diharapkan. Status pengujian untuk seluruh 20 kasus uji dinyatakan **Berhasil**, menunjukkan bahwa fitur navigasi peta interaktif, sistem multi-campus, pencarian lokasi, tampilan detail bangunan 2D/2.5D, galeri ruangan, sistem autentikasi admin, serta pengelolaan data (CRUD) bangunan, lantai, ruangan, dan galeri dapat digunakan tanpa error.

Untuk memperjelas hasil pengujian, berikut disajikan dokumentasi berupa tangkapan layar dari beberapa halaman utama dan fitur penting pada sistem yang mengacu pada skenario pengujian yang telah dilakukan:

A. Fitur Pengguna (Guest User)

4.2.1 Halaman Beranda – Navbar dan Hero Section
Berdasarkan skenario pengujian Halaman Beranda – Navbar & Language Toggle dan Hero Section & Campus Selection, halaman beranda menampilkan komponen utama dengan hasil sebagai berikut:

1. Navbar
   Navbar menampilkan tiga elemen utama: logo PointMap di sisi kiri, informasi cuaca kota Pontianak di bagian tengah yang menampilkan suhu dan kondisi cuaca melalui integrasi dengan OpenWeatherMap API, serta kontrol global berupa tombol Dark Mode dan Language Toggle (ID/EN) di sisi kanan. Pengujian toggle bahasa menunjukkan bahwa sistem berhasil mengubah seluruh teks interface antara Bahasa Indonesia dan Bahasa Inggris secara dinamis tanpa memerlukan reload halaman. Fitur dark mode berfungsi dengan transisi warna yang halus dan konsisten di seluruh komponen interface.

   Gambar 4.1 Navbar Bahasa Indonesia - Light Mode

   Gambar 4.2 Navbar Bahasa Inggris - Light Mode

   Gambar 4.3 Navbar Dark Mode

   Gambar 4.4 Informasi Cuaca dari OpenWeatherMap API

2. Hero Section
   Hero section menampilkan background slider yang berganti secara otomatis setiap 5 detik dengan empat gambar berbeda dan efek transisi yang halus. Teks hero section tertata dengan baik dengan ukuran font yang responsif menyesuaikan berbagai ukuran layar perangkat.

   Gambar 4.5 Hero Section - Background Slider Gambar 1

   Gambar 4.6 Hero Section - Background Slider Gambar 2

3. Campus Selection
   Komponen campus selection menampilkan empat kartu kampus (Politeknik Negeri Pontianak, PSDKU Polnep Sanggau, PDD Polnep Kapuas Hulu, dan PSDKU Polnep Sukamara) dengan desain card yang responsif. Pengujian interaksi menunjukkan bahwa ketika salah satu campus card diklik, halaman akan melakukan auto-scroll dengan smooth scrolling menuju area canvas peta, dan secara bersamaan peta langsung menampilkan view sesuai dengan koordinat center dan level zoom yang dikonfigurasi untuk kampus yang dipilih.

   Gambar 4.7 Campus Selection - Empat Kartu Kampus

   Gambar 4.8 Campus Card Diklik - Proses Auto Scroll

   Gambar 4.9 Peta Menampilkan View Kampus Terpilih

4.2.2 Peta Interaktif – Multi-Campus Support dan Layer Control
Berdasarkan skenario pengujian Canvas Peta – Multi-Campus Support dan Layer Control & Basemap, sistem peta interaktif menunjukkan hasil pengujian sebagai berikut:

1. Multi-Campus Support
   Dropdown campus selector yang terletak di header canvas peta memungkinkan pengguna untuk memilih kampus yang berbeda (Pontianak, Sanggau, Kapuas Hulu, atau Sukamara). Pengujian menunjukkan bahwa ketika kampus diubah, peta secara otomatis berpindah ke koordinat center kampus yang dipilih dengan menggunakan animasi flyTo yang halus, serta menyesuaikan level zoom sesuai dengan konfigurasi masing-masing kampus. Sistem berhasil memfilter dan hanya menampilkan bangunan dari kampus yang terpilih secara real-time tanpa memerlukan reload halaman.

   Gambar 4.10 Dropdown Campus Selector di Header Peta

   Gambar 4.11 Peta Kampus Kapuas Hulu Setelah Ganti Campus

2. Layer Control dan Basemap
   Di sisi kanan atas peta terdapat kontrol layer yang berfungsi untuk mengelola tampilan peta. Kontrol ini memungkinkan pengguna untuk toggle visibility layer Buildings, sehingga dapat menampilkan atau menyembunyikan seluruh bangunan di peta sesuai kebutuhan. Selain itu, pengguna dapat mengganti basemap antara tiga pilihan: Esri Satellite (default), Esri Topographic, dan Carto Dark. Setiap kali pilihan basemap diubah, peta berganti secara instant tanpa reload halaman dan tanpa mengganggu layer lain yang sedang ditampilkan.

   Gambar 4.12 Layer Buildings Disembunyikan (Toggle Off)

   Gambar 4.13 Basemap Esri Satellite sebagai Default

   Gambar 4.14 Basemap Esri Topographic Setelah Diganti

   Gambar 4.15 Basemap Carto Dark Setelah Diganti

4.2.3 Peta Interaktif – Kontrol Navigasi dan GPS
Berdasarkan skenario pengujian Canvas Peta – Kontrol Zoom & Reset, hasil pengujian kontrol navigasi peta adalah sebagai berikut:

1. Kontrol Zoom
   Tombol Zoom In (+) dan Zoom Out (-) bekerja dengan smooth transition untuk memperbesar dan memperkecil tampilan peta. Scroll wheel pada mouse juga berfungsi dengan baik sebagai alternatif kontrol zoom. Sistem telah menerapkan konfigurasi maxZoom yang berbeda untuk setiap kampus sesuai ketersediaan tile peta, sehingga berhasil mencegah munculnya grey tiles (tile kosong) ketika pengguna melakukan zoom hingga level maksimal yang diizinkan.

   Gambar 4.16 Tombol Kontrol Zoom In dan Zoom Out

   Gambar 4.17 Peta pada Zoom Level Minimum

   Gambar 4.18 Peta pada Zoom Level Maksimal (Tanpa Grey Tiles)

2. Reset Position
   Tombol Reset Position berfungsi untuk mengembalikan tampilan peta ke koordinat center dan level zoom awal sesuai kampus yang sedang dipilih. Pengujian menunjukkan bahwa fitur ini menggunakan animasi flyTo yang memberikan efek perpindahan yang halus dan menyenangkan.

   Gambar 4.19 Tombol Reset Position

   Gambar 4.20 Peta Kembali ke Posisi Awal Setelah Reset

3. GPS Tracking (Lokasi Saya)
   Fitur Lokasi Saya memanfaatkan Geolocation API browser untuk mendeteksi posisi pengguna. Ketika akses GPS diizinkan oleh pengguna, marker posisi user ditampilkan dengan akurat di peta beserta akurasi radius yang divisualisasikan dalam bentuk lingkaran. Ketika akses GPS ditolak, sistem menampilkan pesan error yang informatif dan user-friendly untuk memberikan panduan kepada pengguna.

   Gambar 4.21 Marker Posisi User (GPS Diizinkan)

   Gambar 4.22 Pesan Error Informatif (GPS Ditolak)

4.2.4 Interaksi Bangunan – Popup dan Thumbnail
Berdasarkan skenario pengujian Interaksi Bangunan – Popup & Thumbnail, hasil pengujian interaksi dengan bangunan adalah sebagai berikut:
Ketika pengguna mengklik polygon bangunan dengan kategori "Interaktif" di peta, popup informasi muncul secara responsif. Popup menampilkan nama bangunan, thumbnail gambar, dan tombol "Detail Bangunan". Thumbnail gambar yang ditampilkan dapat diklik untuk membuka lightbox (image viewer) sehingga gambar dapat dilihat dalam ukuran penuh dengan kualitas yang baik. Tombol close pada popup dan lightbox berfungsi dengan baik untuk menutup tampilan.

Gambar 4.23 Bangunan Diklik - Popup Informasi Muncul

Gambar 4.24 Thumbnail Diklik - Image Viewer Full Size

4.2.5 Detail Bangunan – Mode 2D/2.5D dan Navigasi Lantai
Berdasarkan skenario pengujian Detail Bangunan – Mode 2.5D & Floor Navigation, halaman detail bangunan menunjukkan hasil pengujian sebagai berikut:

1. Mode Tampilan
   Ketika pengguna mengklik tombol "Detail Bangunan" dari popup, sistem melakukan redirect ke halaman building-details standalone yang menampilkan denah bangunan dalam tampilan 2.5D sebagai default dengan efek perspektif 3D. Toggle button untuk beralih antara mode 2D dan 2.5D bekerja dengan smooth transition tanpa lag. Mode 2D menampilkan denah secara flat tanpa perspektif untuk memudahkan pembacaan detail ruangan dengan lebih presisi.

   Gambar 4.25 Detail Bangunan - Tampilan Awal 2.5D

   Gambar 4.27 Detail Bangunan Mode 2.5D

   Gambar 4.28 Detail Bangunan Mode 2D

2. Floor Navigation
   Dropdown dan list lantai memungkinkan perpindahan antar lantai secara instant dengan loading denah SVG yang cepat.

   Gambar 4.29 Dropdown Selector untuk Memilih Lantai

   Gambar 4.30 Denah Lantai 1 Ditampilkan

   Gambar 4.31 Denah Lantai 2 Ditampilkan

4.2.6 Detail Ruangan – Pin Marker dan Galeri Foto
Berdasarkan skenario pengujian Detail Ruangan – Pin Marker & Gallery, hasil pengujian interaksi dengan ruangan adalah sebagai berikut:

1. Pin Marker
   Pin marker ruangan ditampilkan dengan posisi akurat di atas denah SVG lantai sesuai koordinat yang tersimpan di database (posisi_x, posisi_y dalam persen). Click detection pada pin marker bekerja dengan akurat. Pengguna dapat mengklik pin marker atau nama ruangan dari list di sebelah kanan untuk membuka panel info ruangan yang menampilkan informasi lengkap seperti nama ruangan, nomor lantai, jurusan, dan program studi.

   Gambar 4.32 Pin Marker Ruangan di Denah Mode 2.5D

   Gambar 4.33 Pin Marker Ruangan di Denah Mode 2D

   Gambar 4.34 Panel Info Ruangan Setelah Klik Pin

   Gambar 4.35 Klik Nama Ruangan dari List

2. Galeri Foto
   Tombol Gallery yang tersedia pada panel info ruangan berfungsi untuk membuka modal yang menampilkan semua foto ruangan. Fitur navigation dengan tombol prev/next bekerja lancar untuk berpindah antar foto. Lightbox untuk zoom foto berfungsi dengan baik ketika foto diklik.

   Gambar 4.36 Tombol Gallery pada Panel Info Ruangan

   Gambar 4.37 Gallery Modal Menampilkan Foto Ruangan

   Gambar 4.38 Navigation Prev/Next dalam Gallery

4.2.7 Fitur Pencarian Lokasi
Berdasarkan skenario pengujian Pencarian – Search Functionality, hasil pengujian fitur pencarian lokasi adalah sebagai berikut:

Search box dapat diakses dari map controls panel. Ketika pengguna mengetik minimal 2 karakter, autocomplete suggestions muncul secara real-time dengan hasil yang relevan. Hasil pencarian menampilkan baik gedung maupun ruangan yang sesuai dengan keyword yang dimasukkan. Pencarian bersifat case-insensitive sehingga tidak membedakan huruf besar atau kecil. Ketika pengguna memilih salah satu hasil dari autocomplete, peta otomatis melakukan zoom dan pan ke lokasi yang dipilih dengan animasi yang smooth, kemudian popup informasi muncul secara otomatis untuk menampilkan detail lokasi yang dipilih.

Gambar 4.39 Search Box di Map Controls Panel

Gambar 4.40 Autocomplete Suggestions untuk Pencarian Gedung

Gambar 4.41 Autocomplete Suggestions untuk Pencarian Ruangan

Gambar 4.42 Hasil Search Dipilih - Auto Zoom dan Popup Muncul

B. Fitur Administrator

4.2.8 Autentikasi Admin – Login
Berdasarkan skenario pengujian Login Admin – Authentication, sistem autentikasi menunjukkan hasil pengujian sebagai berikut:

Halaman login diakses melalui route /login. Form validation memastikan field username dan password diisi sebelum submit. Ketika kredensial benar, sistem melakukan autentikasi menggunakan JWT (JSON Web Token), token disimpan di localStorage browser dan sistem redirect otomatis ke /dashboard. Ketika kredensial salah, sistem menampilkan error message "Username atau password salah".

Gambar 4.43 Halaman Login dengan Form Username dan Password

Gambar 4.44 Pesan Error untuk Kredensial Salah

Gambar 4.45 Redirect ke Dashboard Setelah Login Berhasil

4.2.9 Dashboard Admin – Overview dan Statistik
Berdasarkan skenario pengujian Dashboard – Overview & Statistics, dashboard admin menunjukkan hasil pengujian sebagai berikut:

Dashboard tampil tanpa hero section dan footer untuk menampilkan interface yang fokus pada manajemen data. Greeting message di bagian atas menyesuaikan dengan waktu akses pengguna, menampilkan "Selamat Pagi", "Selamat Siang", "Selamat Sore", atau "Selamat Malam". Stat cards menampilkan statistik Total Gedung, Total Lantai, Total Ruangan, dan Total Galeri yang update secara real-time dengan icon serta warna yang berbeda untuk setiap kategori. Analytics card menampilkan persentase digitalisasi kampus, dan list gedung terbaru ditampilkan dengan sistem pagination untuk memudahkan navigasi data. Campus selector yang terletak di sidebar berfungsi untuk memfilter data secara real-time, sehingga ketika kampus diubah, semua statistik dan data ter-update secara otomatis tanpa memerlukan reload halaman.

Gambar 4.46 Halaman Dashboard dengan Greeting Message

Gambar 4.47 Stat Cards - Total Gedung, Lantai, Ruangan, Galeri

Gambar 4.48 Analytics Card Persentase Digitalisasi

Gambar 4.49 List Gedung Terbaru dengan Pagination

Gambar 4.50 Campus Selector di Sidebar untuk Filter Kampus

4.2.10 Manajemen Bangunan – CRUD Operations
Berdasarkan skenario pengujian Admin – CRUD Bangunan, fitur manajemen data bangunan menunjukkan hasil pengujian sebagai berikut. Operasi CRUD (Create, Read, Update, Delete) bangunan dilakukan melalui halaman manajemen bangunan khusus (`/dashboard/bangunan`) yang menyediakan tampilan table dan grid view dengan interface yang user-friendly dan feedback system yang jelas.

1. Tambah Bangunan (Create)
   Admin mengakses halaman Manajemen Gedung dan mengklik tombol "Tambah Gedung" untuk membuka modal form tambah data. Form tambah bangunan mencakup input nama gedung, upload thumbnail gambar, input jumlah lantai, pemilihan kategori kampus dari dropdown, dan pengaturan status interaksi (Interaktif/Noninteraktif). Fitur khusus yang tersedia adalah Map Editor untuk menggambar geometri polygon bangunan di peta (dijelaskan detail di bagian 4.2.11). Form validation memastikan semua field required terisi dengan benar sebelum data dapat disimpan. Setelah berhasil, toast notification "Bangunan berhasil ditambahkan" muncul, modal tertutup, dan data baru langsung muncul di list bangunan.

   Gambar 4.51 Halaman Manajemen Gedung - Tombol Tambah Bangunan

   Gambar 4.52 Form Tambah Bangunan dalam Modal

   Gambar 4.53 Toast Notification Bangunan Berhasil Ditambahkan

2. Lihat Data Bangunan (Read)
   Halaman Manajemen Gedung menampilkan semua data bangunan dalam dua mode tampilan: Grid View dan Table View. Admin dapat toggle antara kedua mode menggunakan tombol di pojok kanan atas. Grid View menampilkan kartu gedung dengan thumbnail, nama, jumlah lantai, dan badge status interaktif dalam layout grid responsif. Table View menampilkan data dalam format tabel dengan kolom ID, Thumbnail, Nama Gedung, Lantai, Interaksi, dan Aksi. Fitur search box memungkinkan admin mencari gedung berdasarkan nama dengan pencarian real-time. Data otomatis terfilter sesuai kampus yang dipilih di campus selector sidebar. Sistem pagination menampilkan 10 item per halaman untuk memudahkan navigasi data yang banyak.

   Gambar 4.54 Grid View - Kartu Gedung dengan Thumbnail

   Gambar 4.55 Table View - Tabel Data Bangunan

   Gambar 4.56 Search Gedung

3. Edit Bangunan (Update)
   Setiap kartu gedung di Grid View atau baris di Table View memiliki tombol "Edit" yang membuka modal form edit. Form edit menampilkan semua data bangunan saat ini dan memungkinkan admin mengubah berbagai informasi dalam satu modal terintegrasi. Field yang dapat diubah meliputi: nama bangunan dengan validation untuk memastikan tidak kosong, upload thumbnail baru (mendukung format JPG/PNG dengan preview sebelum save), jumlah lantai, toggle status Interaktif/Noninteraktif, dan pemilihan kategori kampus. Untuk mengubah geometri polygon bangunan, admin dapat mengakses Map Editor melalui opsi edit geometri (dijelaskan detail di bagian 4.2.11). Form validation mencegah pengiriman data yang tidak valid seperti nama kosong atau file thumbnail bukan gambar. Setelah admin mengklik tombol "Simpan", sistem meng-update data ke database melalui API backend. Toast notification "Berhasil memperbarui data bangunan" muncul sebagai konfirmasi, modal tertutup, dan data yang diupdate langsung muncul di list tanpa perlu reload halaman.

   Gambar 4.57 Halaman Manajemen Gedung - Tombol Edit Bangunan

   Gambar 4.58 Modal Edit Bangunan dengan Form Lengkap

   Gambar 4.59 Upload Thumbnail dengan Preview

   Gambar 4.60 Toast Notification Berhasil Update Data

4. Hapus Bangunan (Delete)
   Setiap item gedung memiliki tombol "Hapus" (icon trash) yang ketika diklik menampilkan modal konfirmasi delete dengan desain yang menarik. Modal konfirmasi menampilkan icon peringatan, judul "Hapus Gedung?", dan pesan bahwa tindakan ini tidak dapat dibatalkan. Sistem menerapkan mekanisme keamanan integritas data, di mana penghapusan bangunan akan ditolak jika masih terdapat data terkait seperti lantai, ruangan, atau galeri foto. Admin harus menghapus data terkait terlebih dahulu secara manual. Admin dapat memilih "Batal" untuk membatalkan atau "Ya, Hapus" untuk mencoba menghapus. Setelah konfirmasi, sistem mengirim DELETE request ke API backend. Jika berhasil, item gedung langsung hilang dari list dan toast notification "Gedung berhasil dihapus" muncul. Jika gedung masih memiliki dependencies, sistem menampilkan error toast yang merinci jumlah data (lantai, ruangan, galeri) yang harus dihapus terlebih dahulu.

   Gambar 4.62 Halaman Manajemen Gedung - Tombol Hapus Bangunan

   Gambar 4.63 Modal Konfirmasi Hapus Bangunan dengan Peringatan Cascade

   Gambar 4.64 Toast Notification Bangunan Berhasil Dihapus

Seluruh operasi CRUD bangunan berjalan dengan lancar dan stabil. Halaman manajemen dengan dual-view (grid/table) memberikan fleksibilitas tampilan sesuai preferensi admin. Sistem berhasil menjaga integritas data dengan validasi dan cascade delete, serta memberikan user feedback yang jelas melalui toast notification untuk setiap operasi yang dilakukan.

4.2.11 Map Editor – Drawing dan Editing Geometry
Berdasarkan skenario pengujian Admin – Map Editor (Draw Geometry), tools untuk menggambar dan mengedit geometri bangunan menunjukkan hasil pengujian sebagai berikut:

Ketika admin mengklik tombol "Tambah Gedung Baru" di dashboard, drawing sidebar muncul dengan toolbar lengkap. Drawing tools yang tersedia bersifat intuitif dan responsive untuk memudahkan admin menggambar polygon area bangunan di peta. Setelah polygon dibuat, admin dapat masuk ke edit mode untuk menyesuaikan bentuk bangunan, vertex polygon dapat di-drag untuk mengubah shape dan ukuran area, serta dapat dihapus dengan klik kanan untuk menyederhanakan bentuk. Geometry yang dibuat otomatis disimpan dalam format GeoJSON yang valid, setelah save polygon langsung muncul di peta dengan style yang sesuai, dan real-time preview saat drawing memudahkan admin melihat hasil akhir sebelum menyimpan.

Gambar 4.65 Drawing Sidebar dengan Toolbar

Gambar 4.66 Menggambar Polygon Area Bangunan

Gambar 4.67 Edit Mode - Drag Vertex Polygon

Gambar 4.68 Real-time Preview saat Drawing

4.2.12 Manajemen Lantai – Upload dan Edit Denah SVG
Berdasarkan skenario pengujian Admin – CRUD Lantai, pengelolaan lantai bangunan menunjukkan hasil pengujian sebagai berikut:

Admin mengakses halaman Manajemen Lantai (`/dashboard/lantai`) yang menampilkan semua gambar denah lantai dari berbagai gedung. Halaman ini menyediakan tampilan Grid View dan Table View yang dapat di-toggle. Dropdown "Semua Gedung" memungkinkan filter lantai berdasarkan gedung tertentu. Data lantai otomatis terfilter berdasarkan kampus yang dipilih di campus selector sidebar.

1. Tambah Lantai
   Button "Tambah Lantai" membuka form upload file. File validation berfungsi dengan ketat dan hanya menerima file dengan ekstensi .SVG. Jika admin mencoba upload file selain SVG, sistem menampilkan toast notification dengan pesan "Format file harus SVG". Preview SVG ditampilkan sebelum upload untuk memastikan file yang benar telah dipilih. Setelah upload berhasil, toast "Lantai berhasil ditambahkan" muncul.

   Gambar 4.69 Modal Tambah Lantai Bangunan

   Gambar 4.70 Notifikasi Format File Harus SVG

   Gambar 4.71 Upload Gambar Lantai Format SVG

   Gambar 4.72 Notifikasi Lantai Berhasil Ditambahkan

2. Lihat Data Lantai (Read)
   Grid View menampilkan kartu lantai dengan preview SVG, badge nama gedung, dan nama file. Table View menampilkan data dalam format tabel dengan kolom Gedung, File, Preview, dan Aksi. Preview SVG ditampilkan dalam ukuran kecil di setiap item untuk identifikasi visual yang mudah. Sistem pagination menampilkan 10 item per halaman.

   Gambar 4.73 Grid View - Kartu Lantai dengan Preview SVG

   Gambar 4.74 Table View - Tabel Data Lantai

   Gambar 4.75 Filter Gedung Data Lantai

3. Edit Lantai
   Tombol "Edit" pada setiap item membuka modal untuk upload ulang file SVG atau mengubah data lantai. Admin dapat mengganti file SVG dengan yang baru. Perubahan tersimpan dengan baik setelah klik "Simpan". Toast "Lantai berhasil diperbarui" muncul sebagai konfirmasi.

   Gambar 4.76 Halaman Manajemen Lantai - Tombol Edit Lantai

   Gambar 4.77 Modal Edit Lantai - Upload Ulang SVG

   Gambar 4.78 Notifikasi Lantai Berhasil Diperbarui

4. Hapus Lantai
   Tombol "Hapus" (icon trash) pada setiap item lantai menampilkan modal konfirmasi dengan peringatan "Hapus Gambar Lantai?" dan pesan bahwa tindakan ini tidak dapat dibatalkan. Setelah konfirmasi, sistem mengirim DELETE request. Jika berhasil, item langsung hilang dari list dan toast "Gambar lantai berhasil dihapus" muncul. Sistem memvalidasi keberadaan data terkait sebelum menghapus; jika lantai masih memiliki ruangan atau galeri, penghapusan ditolak dan sistem menampilkan error toast yang menjelaskan data apa saja yang perlu dihapus terlebih dahulu untuk menjaga konsistensi database.

   Gambar 4.79 Halaman Manajemen Lantai - Tombol Hapus Lantai

   Gambar 4.80 Modal Konfirmasi Hapus Lantai

   Gambar 4.81 Notifikasi Lantai Berhasil Dihapus

4.2.13 Manajemen Ruangan – CRUD dan Pin Positioning
Berdasarkan skenario pengujian Admin – CRUD Ruangan & Pin Positioning, pengelolaan ruangan dan positioning pin marker menunjukkan hasil pengujian sebagai berikut:

Admin mengakses halaman Manajemen Ruangan (`/dashboard/ruangan`) yang menampilkan semua ruangan dari berbagai gedung dan lantai. Halaman ini menyediakan tampilan Grid View dan Table View yang dapat di-toggle. Fitur search box memungkinkan pencarian berdasarkan nama ruangan, jurusan, atau prodi. Dropdown "Semua Gedung" memungkinkan filter ruangan berdasarkan gedung tertentu. Data ruangan otomatis terfilter berdasarkan kampus yang dipilih di campus selector sidebar.

1. Tambah Ruangan
   Tombol "Tambah Ruangan" di pojok kanan atas membuka modal form. Form mencakup dropdown untuk memilih gedung, input nomor lantai, nama ruangan, dropdown jurusan dan program studi, serta dropdown kategori ruangan. Fitur khusus yang sangat penting adalah "Plot Lokasi Ruangan". Ketika button ini diklik, modal terpisah muncul menampilkan denah SVG lantai yang dipilih berdasarkan gedung dan nomor lantai yang telah dipilih. Admin dapat mengklik posisi di mana pin marker ruangan akan ditampilkan pada denah. Click detection di SVG bekerja dengan akurat dan menangkap koordinat klik dalam persentase (0-100% untuk x dan y). Pin marker muncul di posisi yang diklik sebagai preview real-time. Posisi pin tersimpan sebagai posisi_x dan posisi_y dalam database dengan presisi yang baik. Form validation memastikan field required seperti nama ruangan dan posisi pin terisi dengan benar. Setelah semua data diisi dan posisi pin ditentukan, admin klik "Simpan" dan data ruangan tersimpan ke database. Modal tertutup dan toast "Ruangan berhasil ditambahkan" muncul sebagai konfirmasi.

   Gambar 4.82 Modal Tambah Ruangan

   Gambar 4.83 Modal Plot Lokasi Ruangan - Tampilan Denah SVG

   Gambar 4.84 Klik Posisi di Denah untuk Set Pin Marker

   Gambar 4.85 Preview Pin Marker Setelah Dipilih

   Gambar 4.86 Notifikasi Ruangan Berhasil Ditambahkan

2. Lihat Data Ruangan (Read)
   Grid View menampilkan kartu ruangan dengan informasi gedung (badge biru), nama ruangan, nomor lantai, jurusan dan prodi. Setiap kartu dilengkapi tombol "Edit" dan "Galeri" untuk manajemen foto ruangan. Table View menampilkan data dalam format tabel dengan kolom lengkap termasuk Nama Ruangan, Gedung, Lantai, Jurusan, Prodi, Kategori, dan Aksi. Sistem pagination menampilkan 10 item per halaman.

   Gambar 4.87 Grid View - Kartu Ruangan

   Gambar 4.88 Table View - Tabel Data Ruangan

   Gambar 4.89 Search Ruangan

3. Edit Ruangan
   Tombol "Edit" pada setiap item membuka modal form edit yang telah terisi dengan data ruangan saat ini. Admin dapat mengubah semua informasi ruangan termasuk nama, jurusan, prodi, kategori, dan yang paling penting adalah posisi pin marker. Modal edit menyediakan akses ke "Plot Lokasi Ruangan" kembali untuk mengubah posisi pin jika diperlukan dengan menampilkan denah SVG dan preview pin marker saat ini. Toast "Ruangan berhasil diubah" muncul setelah update berhasil. Jika ada validation error, sistem menampilkan toast error dengan informasi yang jelas.

   Gambar 4.90 Modal Edit Ruangan dengan Form Lengkap

   Gambar 4.91 Notifikasi Ruangan Berhasil Diubah

4. Hapus Ruangan
   Tombol "Hapus" (icon trash) pada setiap item ruangan menampilkan modal konfirmasi dengan peringatan "Hapus Ruangan?" dan pesan bahwa tindakan ini tidak dapat dibatalkan. Setelah konfirmasi, sistem mengirim DELETE request. Jika berhasil, Item langsung hilang dari list dan toast "Ruangan berhasil dihapus" muncul. Demi keamanan data, sistem tidak mengizinkan penghapusan ruangan yang masih memiliki foto galeri. Jika kondisi ini terpenuhi, sistem menampilkan error toast yang menginformasikan jumlah foto yang harus dihapus terlebih dahulu sebelum ruangan dapat dihapus.

   Gambar 4.92 Modal Konfirmasi Hapus Ruangan

   Gambar 4.93 Notifikasi Ruangan Berhasil Dihapus

5. Manajemen Galeri Ruangan (dari Halaman Ruangan)
   Setiap kartu ruangan di Grid View memiliki tombol "Galeri" (icon images) yang membuka modal gallery khusus untuk ruangan tersebut. Modal gallery menampilkan semua foto yang sudah ter-upload dalam grid layout responsif dengan efek hover yang smooth. Admin dapat menambah foto baru dengan klik area "Tambah Foto" yang membuka file picker untuk multiple upload. Preview foto yang dipilih ditampilkan di bagian "Siap Diupload" sebelum admin klik tombol "Simpan". File validation memastikan hanya file gambar (JPG/PNG) dengan ukuran maksimal 10MB yang dapat di-upload. Setelah upload berhasil, foto langsung muncul di grid gallery dan toast "Foto berhasil diupload" muncul. Setiap foto memiliki tombol delete yang muncul saat hover, dengan konfirmasi modal sebelum penghapusan. Fancybox terintegrasi untuk viewing foto dalam ukuran penuh ketika foto diklik.

   Gambar 4.94 Tombol Galeri pada Kartu Ruangan

   Gambar 4.95 Modal Galeri Ruangan dengan Grid Layout

   Gambar 4.96 Upload Multiple Foto dengan Preview

   Gambar 4.97 Notifikasi Foto Berhasil Diupload

CRUD ruangan berfungsi lengkap dan stabil dengan validasi serta user feedback (toast notifications) yang baik untuk setiap operasi. Fitur pin positioning yang terintegrasi dengan denah SVG memberikan presisi lokasi ruangan untuk ditampilkan di halaman detail bangunan mode 2.5D.

4.2.14 Manajemen Galeri Ruangan (Halaman Dedicated)
Berdasarkan skenario pengujian Admin – CRUD Gallery Ruangan, selain manajemen galeri melalui modal pada halaman Ruangan, aplikasi juga menyediakan halaman dedicated untuk manajemen galeri secara terpusat.

Admin mengakses halaman Manajemen Galeri (`/dashboard/galeri`) yang menampilkan semua foto galeri dari semua ruangan dalam satu view. Halaman ini khusus untuk melihat dan mengelola semua foto secara kolektif dengan fitur search berdasarkan nama ruangan, gedung, atau deskripsi. Data ditampilkan dalam grid layout dengan pagination client-side (12 item per halaman).

1. Lihat Semua Foto Galeri (Read)
   Grid menampilkan foto dalam aspect-square cards dengan image yang sudah di-optimize. Hover effect menampilkan overlay gradient dengan informasi nama ruangan dan gedung. Search box memungkinkan filtering real-time berdasarkan nama ruangan atau gedung. Setiap foto menampilkan tombol delete yang muncul saat hover untuk akses cepat ke fungsi hapus.

   Gambar 4.98 Grid View - Gallery Ruangan

   Gambar 4.99 Search Filter Gallery

2. Upload Foto Baru
   Tombol "Upload Foto" di pojok kanan atas membuka modal form untuk upload foto galeri ruangan. Modal mencakup dropdown untuk memilih ruangan (dengan informasi gedung), input deskripsi foto (opsional), dan area upload yang mendukung multiple file upload. File validation memastikan hanya file gambar (JPG/PNG) dengan ukuran maksimal 10MB yang dapat di-upload. Preview thumbnail ditampilkan sebelum upload untuk memastikan foto yang benar telah dipilih. Setelah upload berhasil, modal tertutup, data refresh otomatis, dan toast "Foto berhasil diupload" muncul. Foto baru langsung muncul di grid gallery.

   Gambar 4.100 Modal Upload Foto Gallery

   Gambar 4.101 Upload dengan Preview Thumbnail

   Gambar 4.102 Notifikasi Foto Berhasil Diupload

3. Hapus Foto
   Tombol delete pada setiap foto menampilkan modal konfirmasi browser native untuk mencegah penghapusan tidak sengaja. Setelah konfirmasi, foto terhapus dari database dan storage server. Item foto langsung hilang dari grid tanpa reload halaman. Toast "Foto berhasil dihapus" muncul sebagai konfirmasi. Sistem menghandle error dengan baik jika terjadi kegagalan saat delete.

   Gambar 4.103 Konfirmasi Hapus Foto dari Gallery

   Gambar 4.104 Notifikasi Gallery Berhasil Dihapus

Gallery modal dengan grid layout responsive memudahkan admin melihat dan mengelola banyak foto sekaligus.

4.2.15 Sistem Autentikasi – Logout dan Auto-Logout
Berdasarkan skenario pengujian Admin – Auto-Logout (1 Hari) dan Admin – Logout Manual, sistem autentikasi menunjukkan hasil pengujian sebagai berikut:

1. Logout Manual
   Button "Logout" tampil di bagian bawah sidebar dashboard dengan ikon yang jelas. Ketika admin klik logout, sistem menghapus JWT token dan user data dari localStorage browser. Redirect ke halaman /login terjadi secara instant setelah logout. Setelah logout, jika admin mencoba akses route yang protected seperti /dashboard tanpa login, sistem otomatis redirect kembali ke /login. Middleware auth berfungsi dengan baik untuk melindungi halaman admin.

   Gambar 4.105 Button Logout di Sidebar Dashboard

   Gambar 4.106 Redirect ke Login Setelah Logout

2. Auto-Logout (1 Hari)
   JWT token dikonfigurasi dengan expiry time 1 hari (86400 detik). Setelah 1 hari sejak login, token otomatis menjadi invalid.

   Ketika admin dengan expired token mencoba melakukan request ke API atau akses dashboard, sistem otomatis mendeteksi token expired dan trigger auto-logout. Local storage di-clear dan user di-redirect ke halaman login dengan pesan yang informatif.

   Gambar 4.107 Pesan Auto-Logout Token Expired

Route protection dengan middleware auth berfungsi sempurna, unauthorized access ke halaman admin otomatis di-block dan di-redirect ke login.

C. Aspek Non-Fungsional

4.2.16 Responsivitas Mobile
Berdasarkan skenario pengujian Responsivitas Mobile – Homepage dan Responsivitas Mobile – Dashboard Admin, sistem menunjukkan hasil pengujian sebagai berikut:

1. Homepage Mobile
   Layout otomatis menyesuaikan untuk layar mobile (tested di 375px, iPhone SE, iPhone 12, dan iPad). Navbar tetap full width tanpa memerlukan hamburger menu yang kompleks sehingga semua elemen penting tetap accessible. Informasi cuaca di mobile di-simplify untuk menghemat space dengan hanya menampilkan icon dan suhu, sementara deskripsi cuaca dan tanggal di-hide untuk layar kecil. Hero section text dan spacing optimal untuk small screen dengan font size yang adjust otomatis. Campus cards menggunakan grid 2 kolom di mobile (grid-cols-2) untuk memanfaatkan lebar layar dengan baik. Smooth hover effect pada desktop berubah menjadi touch-friendly click interaction di mobile. Peta tetap sepenuhnya interaktif dengan touch gestures. Touch zoom (pinch to zoom) dan pan berfungsi sempurna. Semua kontrol peta seperti layer control, zoom buttons, dan search tetap accessible serta tidak terpotong di layar kecil.

   Gambar 4.108 Homepage Responsive di iPhone SE (375px)

   Gambar 4.109 Navbar Mobile Compact

   Gambar 4.110 Campus Cards Grid 2 Kolom di Mobile

   Gambar 4.111 Touch Zoom pada Peta Mobile

2. Dashboard Mobile
   Sidebar menggunakan tombol toggle (hamburger menu) untuk menghemat space di mobile. Toggle sidebar berjalan lancar dengan animasi smooth. Grid statistik responsive menggunakan 2x2 di tablet dan 1 kolom di mobile untuk optimal readability. Daftar gedung dapat di-scroll dengan baik, menggunakan scroll horizontal jika diperlukan untuk tabel yang lebar. Modal dan form input ramah mobile dengan tampil full screen atau near-full-screen di mobile untuk memaksimalkan area kerja. Upload file berfungsi dengan baik di browser mobile iOS dan Android, kompatibel dengan native file picker kedua platform.

   Gambar 4.112 Dashboard Mobile dengan Hamburger Menu

   Gambar 4.113 Stat Cards Responsive 1 Kolom di Mobile

   Gambar 4.114 Modal Form Full Screen di Mobile

4.2.17 Dark Mode dan Persistensi Preferensi
Berdasarkan skenario pengujian Dark Mode Persistence, fitur dark mode menunjukkan hasil pengujian sebagai berikut:

Dark mode preference disimpan menggunakan next-themes di localStorage dengan key "theme: dark" atau "theme: light". Setelah user mengaktifkan dark mode dan melakukan refresh halaman atau close dan reopen browser tab, theme tetap dark mode tanpa kembali ke light mode. Tidak ada flash of unstyled content (FOUT) atau flash of wrong theme. Halaman langsung load dengan theme yang benar sejak awal render, hal ini dicapai dengan implementasi theme provider yang proper dan SSR-safe. Theme synchronization sempurna antara homepage dan dashboard, jika user set dark mode di homepage kemudian navigate ke dashboard, dark mode tetap aktif, begitu juga sebaliknya perubahan theme di halaman manapun akan persist ke seluruh aplikasi. Transisi antara light dan dark mode smooth dengan animation yang tidak mengganggu, memberikan user experience yang menyenangkan.

Gambar 4.115 Dark Mode Aktif di Homepage

Gambar 4.116 Dark Mode Persistent Setelah Refresh

Gambar 4.117 Theme Sync Homepage ke Dashboard

4.3 Pembahasan
Berdasarkan hasil pengujian pada Tabel 4.1 Skenario Pengujian serta dokumentasi yang disajikan pada bagian 4.2, dapat disimpulkan bahwa seluruh fitur pada sistem PointMap telah berfungsi sesuai dengan rancangan pada Bab III. Fitur yang dapat diakses tanpa login mencakup navigasi peta interaktif multi-campus, kontrol layer dan basemap, kontrol zoom dan GPS, serta penampilan popup informasi bangunan. Fitur lain seperti tampilan detail 2D/2.5D dengan floor navigation, galeri ruangan dengan pin marker, dan fitur pencarian lokasi dengan autocomplete juga berjalan lancar dan memberikan respon yang sesuai dengan hasil yang diharapkan. Hal ini menunjukkan bahwa integrasi antara frontend dan backend berjalan dengan baik, terutama pada proses pengambilan dan penampilan data dari basis data melalui API. Fitur admin yang memerlukan autentikasi juga telah diuji dan dinyatakan berhasil. Fitur-fitur tersebut mencakup sistem login dengan JWT, dashboard dengan statistik real-time, pengelolaan data bangunan dengan map editor untuk menggambar geometri, dan pengelolaan lantai dengan upload SVG. Selain itu, pengelolaan ruangan dengan pin positioning, pengelolaan galeri foto, serta sistem logout manual dan auto-logout juga berfungsi dengan baik. Operasi Create, Read, Update, dan Delete (CRUD) dapat dilakukan tanpa menimbulkan error, dan perubahan data dapat langsung terlihat pada tampilan peta. Hasil pengujian juga membuktikan bahwa sistem mampu menampilkan informasi sesuai kategori kampus dan mengatur visibility layer peta dengan baik. Sistem mendukung multi-campus dengan filter data yang akurat. Fitur Dark Mode bekerja konsisten di semua halaman dengan persistensi preferensi yang reliable. Responsivitas mobile di homepage dan dashboard juga berfungsi dengan excellent, memastikan pengalaman pengguna yang optimal di berbagai perangkat. Dengan tidak ditemukannya error selama proses pengujian terhadap 20 kasus uji yang telah didefinisikan, maka sistem PointMap dapat dikatakan telah memenuhi kebutuhan fungsional dan non-fungsional yang telah didefinisikan pada tahap perancangan. Meski demikian, pengembangan selanjutnya dapat mempertimbangkan peningkatan performa pemuatan peta pada koneksi internet lambat.

BAB V
PENUTUP

5.1 Kesimpulan
Berdasarkan hasil yang telah dicapai, dapat disimpulkan bahwa website PointMap berhasil dibuat sebagai peta interaktif berbasis web untuk lingkungan Politeknik Negeri Pontianak. Aplikasi ini mampu menampilkan informasi gedung dan ruangan secara visual serta mendukung navigasi antar lokasi kampus dengan tampilan yang interaktif dan responsif.
Seluruh fitur utama seperti pencarian ruangan, informasi bangunan, galeri foto, navigasi rute terpendek, serta panel admin dengan fungsi CRUD telah berjalan sesuai perancangan dan berhasil diuji secara fungsional dan non-fungsional. Tampilan antarmuka yang mendukung perangkat mobile dan keamanan akses berbasis JWT juga berfungsi dengan baik.
Struktur basis data relasional yang dirancang mendukung integritas data dan keterhubungan antar entitas, sedangkan arsitektur pemisahan antara frontend dan backend memberikan fleksibilitas dalam pengelolaan.
Dengan demikian, tujuan tugas akhir untuk merancang dan membuat aplikasi peta interaktif berbasis web telah tercapai secara keseluruhan. Namun, terdapat keterbatasan pada penyediaan data ruangan yang belum merata di semua gedung, khususnya untuk galeri foto, yang ke depannya dapat menjadi bahan pengembangan lanjutan.

5.2 Saran
Berdasarkan hasil implementasi dan pengujian, terdapat beberapa hal yang dapat dijadikan bahan pertimbangan untuk pengembangan lebih lanjut, baik dari sisi fitur maupun cakupan data, yaitu:

1. Penyempurnaan fitur navigasi
   Fitur routing masih memiliki beberapa bug yang signifikan, terutama dalam menangani titik tujuan dengan banyak pintu masuk, serta dalam membedakan jalur kendaraan dan jalur pejalan kaki. Perlu dilakukan optimasi terhadap algoritma yang digunakan agar dapat mengakomodasi berbagai skenario navigasi secara lebih akurat.
2. Pelengkapan data ruangan
   Saat ini data ruangan baru tersedia secara lengkap untuk Jurusan Teknik Elektro. Pengembangan lebih lanjut disarankan untuk melengkapi data dari seluruh jurusan dan gedung lainnya agar pengguna dapat memperoleh informasi yang lebih menyeluruh.
3. Pengembangan tampilan peta ke mode 3D penuh dan panorama
   Pengembangan lebih lanjut dapat mempertimbangkan peningkatan dari tampilan 2.5D saat ini menjadi peta 3D yang lebih realistis. Selain itu, fitur tambahan seperti kamera 360° atau tampilan panorama dapat diterapkan untuk memberikan pengalaman eksplorasi visual yang lebih interaktif, mirip dengan fitur Street View pada platform peta modern.
4. Peningkatan dokumentasi dan pemahaman algoritma routing
   Salah satu kendala utama dalam pengembangan adalah kompleksitas algoritma rute terpendek. Oleh karena itu, disarankan untuk menambahkan dokumentasi teknis yang lebih mendalam serta referensi yang dapat membantu pengembang berikutnya dalam memahami dan memodifikasi algoritma tersebut.

DAFTAR PUSTAKA

[1] P. N. Pontianak, “Sejarah Singkat Politeknik Negeri Pontianak,” 2022. https://polnep.ac.id/page/sejarah-singkat (accessed Apr. 13, 2025).
[2] P. N. Pontianak, “Profil Politeknik Negeri Pontianak,” 2022. https://polnep.ac.id/page/profil-polnep (accessed Apr. 13, 2025).
[3] P. Studi, T. Geomatika, and K. I. T. S. Sukolilo, “PEMBUATAN PETA INTERAKTIF KAMPUS ITS SUKOLILO SURABAYA BERBASIS WEB,” p. 60111, 2011.
[4] T. J. Cheatham, J. H. Crenshaw, O. Pascal, and T. Pascal, “Object-Oriented v s Waterfall Software Development Middle Tennessee State University An Object-Oriented Software Development ( OOSD ) Methodology . Table 1 - Analysis Document OOSD offers increased productivity OOSD provides reduced complexity OOSD requires fewer lines of code OOSD produces reusable software OOSD is faster OOS is easier to debug OOS is easier to maintain,” pp. 595–599, 1991, doi: 10.1145/327164.328778.
[5] S. Sahara, M. Wulandari, F. Khairunnisa, and A. Info, “Pengembangan Aplikasi Peta Interaktif UNJ untuk Mahasiswa dan Pengunjung,” vol. 5, no. 2, pp. 1730–1739, 2024.
[6] R. K. Riando, B. T. Hanggara, and A. P. Kharisma, “Pengembangan Aplikasi Peta Interaktif Tiga Dimensi Studi Kasus Fakultas Ilmu Komputer Universitas Brawijaya,” vol. 4, no. 9, pp. 3075–3082, 2020.
[7] M. Atik, S. Ekowati, Z. Permata, R. Eko, and S. Siagian, “Google Maps API Dalam Perancangan Sistem Informasi Geografis ( SIG ) Pemetaan Batas Wilayah Universitas Kristen,” vol. 6, no. 1, pp. 31–42, 2022.
[8] I. Vercel, “Next.js Docs.” https://nextjs.org/docs#what-is-nextjs
[9] Nodejs, “Introduction to Node.js.” https://nodejs.org/en/learn/getting-started/introduction-to-nodejs#an-example-nodejs-application
[10] Sequelize, “Introduction Sequelize.” https://sequelize.org/docs/v6/
[11] Bloghoster, “Mengenal Pengertian MySQL dan Fungsinya.” https://blog.hoster.co.id/mengenal-pengertian-mysql-dan-fungsinya/
[12] Volodymyr Agafonkin, “Leaflet- a JavaScript library for interactive maps.” https://leafletjs.com/
[13] Figma, "Figma: The Collaborative Interface Design Tool." https://www.figma.com/
[14] “ArcGIS Pro Esri Indonesia.” http://esriindonesia.co.id/id/arcgis-pro

LAMPIRAN

1. Hasil Plagiarisme
