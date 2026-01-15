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
Gambar 3.26 Struktur File Backend /scripts/ 43
Gambar 3.27 Struktur File Backend /tools/ 43
Gambar 3.28 Struktur File Backend File Utama 44
Gambar 3.29 Struktur File Frontend 45
Gambar 3.30 Struktur File Frontend /src/components/ 47
Gambar 3.31 Struktur File Frontend /src/hooks/ 48
Gambar 3.32 Struktur File Frontend /src/lib/ 50
Gambar 3.33 Struktur File Frontend /src/services/ 51
Gambar 3.34 Struktur File Frontend /src/types/ 52
Gambar 3.35 Struktur File Frontend /public/ 52
Gambar 3.36 Struktur File Konfigurasi Frontend 53
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
9. Adobe Illustrator
   Adobe Illustrator digunakan sebagai alat bantu desain grafis untuk membuat gambar peta dalam format vektor (SVG). Peta SVG yang dihasilkan kemudian dapat diimpor dan dimanipulasi di dalam elemen HTML5 <canvas>, sehingga menghasilkan peta interaktif yang presisi. Illustrator memudahkan proses desain tata letak gedung, ruangan, dan jalur kampus dengan tingkat akurasi yang tinggi sebelum dikonversi ke dalam tampilan interaktif berbasis web [13].
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
   Tabel ini menyimpan data administrator yang memiliki hak akses penuh terhadap sistem, termasuk kemampuan untuk mengelola data bangunan, ruangan, gambar, dan galeri. Atribut yang digunakan meliputi:

1) id_admin sebagai primary key,
2) username untuk nama pengguna,
3) password untuk sandi yang disimpan dalam bentuk terenkripsi.
   b) Tabel bangunan
   Tabel ini menyimpan data utama mengenai setiap bangunan yang ada di lingkungan kampus. Atribut penting meliputi:
4) nama bangunan,
5) interaksi yang menentukan jenis tampilan interaktif (misalnya 2D atau 2.5D),
6) lantai sebagai jumlah lantai gedung,
7) geometri yang menyimpan data spasial/geometrik dalam format teks (misalnya GeoJSON),
8) serta thumbnail sebagai gambar representasi bangunan.
   c) Tabel lantai_gambar
   Menyimpan data gambar visual per lantai gedung dalam bentuk file (umumnya SVG) untuk ditampilkan saat pengguna memilih tampilan 2.5D. Gambar ini berkaitan langsung dengan entitas bangunan, dan memiliki atribut seperti:
9) nama_file dan path_file sebagai informasi lokasi penyimpanan,
10) serta created_at sebagai penanda waktu unggah.
    d) Tabel ruangan
    Merupakan entitas penting yang merepresentasikan ruangan dalam setiap bangunan. Tabel ini menyimpan informasi seperti:
11) nama_ruangan dan nomor_lantai,
12) id_bangunan sebagai foreign key,
13) afiliasi nama_jurusan dan nama_prodi,
14) serta atribut visual seperti posisi_x, posisi_y, dan pin_style untuk keperluan rendering di peta interaktif.
    e) Tabel ruangan_gallery
    Tabel ini digunakan untuk menyimpan dokumentasi berupa gambar atau foto dari masing-masing ruangan. Setiap entri memiliki:
15) nama_file dan path_file,
16) serta timestamp created_at untuk penanda waktu unggah,
17) dan id_ruangan sebagai foreign key yang mengacu ke entitas ruangan.

2. Relasi Antar entitas
   Relasi antar tabel dirancang dengan memperhatikan integritas referensial melalui penggunaan foreign key. Setiap foreign key diberikan aturan cascade delete agar ketika entitas induk (seperti bangunan) dihapus, maka seluruh entitas yang bergantung padanya (seperti ruangan dan gambar lantai) juga akan terhapus secara otomatis. Pendekatan ini bertujuan untuk menjaga konsistensi dan integritas data serta mencegah adanya data yang tidak lagi memiliki referensi (orphan record).
   Adapun relasi antar entitas dalam sistem ini adalah sebagai berikut:
   a) Kolom id_bangunan pada tabel lantai_gambar memiliki relasi ke kolom id_bangunan pada tabel bangunan, dengan aturan penghapusan cascade.
   b) Kolom id_bangunan pada tabel ruangan memiliki relasi ke kolom id_bangunan pada tabel bangunan, juga dengan aturan penghapusan cascade.
   c) Kolom id_ruangan pada tabel ruangan_gallery memiliki relasi ke kolom id_ruangan pada tabel ruangan, dengan aturan penghapusan cascade.
   Dengan skema ini, seluruh data yang memiliki keterkaitan secara logis akan tetap terjaga relasinya selama sistem dijalankan, dan akan dibersihkan secara otomatis ketika data induk dihapus.

3. Diagram Entitas Relasi (ERD)
   Untuk memberikan gambaran visual terhadap struktur basis data dan hubungan antar entitas, berikut ditampilkan diagram Entity Relationship Diagram (ERD) yang merepresentasikan desain logis dari sistem PointMap.

3.4 Pengkodean
Tahap pengkodean merupakan proses penerjemahan hasil perancangan sistem ke dalam bentuk kode program yang dapat dijalankan oleh komputer. Seluruh rancangan modul, alur kerja, serta antarmuka yang telah disusun pada tahap desain diimplementasikan menggunakan bahasa pemrograman dan teknologi yang telah ditentukan pada tahap sebelumnya.
Pengkodean pada proyek ini mengikuti prinsip clean code, modular programming, dan best practices pengembangan perangkat lunak untuk memastikan kode yang dihasilkan mudah dipahami, dikelola, serta dikembangkan pada tahap pemeliharaan.
Kegiatan pengkodean diawali dengan penyiapan development environment, konfigurasi basis data, dan pembuatan API pada sisi backend. Selanjutnya, dilakukan pengembangan antarmuka (frontend) yang terintegrasi dengan API tersebut. Setiap modul dikembangkan secara terpisah, namun tetap mempertahankan konsistensi struktur kode, naming convention, dan standar dokumentasi.
3.4.1 Struktur File Backend
Backend aplikasi PointMap dibangun menggunakan Node.js dengan Express.js sebagai framework utama. Struktur backend disusun secara terorganisasi dengan memisahkan bagian pengelolaan data, logika pemrosesan, dan pengaturan rute API, sehingga kode lebih mudah dibaca, dipelihara, dan dikembangkan untuk kebutuhan selanjutnya.

Gambar 3.20 Struktur File Backend

A. /config/
Folder konfigurasi yang berisi file-file konfigurasi sistem:

1. cloudinary.js
   Konfigurasi Cloudinary untuk penyimpanan dan pengelolaan gambar dengan optimasi otomatis
2. db.js
   Konfigurasi database MySQL dengan Sequelize ORM, connection pooling, dan error handling

Gambar 3.21 Struktur File Backend /config/

B. /controllers/
Folder yang berisi logika bisnis aplikasi:

1. auth.js
   Controller untuk autentikasi admin dengan JWT, password hashing, dan session management.
2. bangunan.js
   Controller untuk manajemen data gedung dengan CRUD operations, validasi file upload, dan integrasi Cloudinary untuk thumbnail management.
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
F. /scripts/

1. migrateToCloudinary.js
   Script migrasi gambar dari local storage ke Cloudinary.
2. resetAutoIncrement.js
   Script reset auto increment database untuk development.

Gambar 3.26 Struktur File Backend /scripts/
G. /tools/

1. hash_password.js
   Tool untuk hashing password admin dengan bcrypt.

Gambar 3.27 Struktur File Backend /tools/
H. File utama

1. server.js
   Entry point aplikasi dengan konfigurasi Express dan middleware.
2. package.json
   Dependencies dan script npm
3. debug-db.js
   Script debugging untuk koneksi database

Gambar 3.28 Struktur File Backend File Utama
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
7. dashboard/page.tsx
   Dashboard admin dengan visualisasi data bangunan dan ruangan, serta integrasi peta interaktif.

Gambar 3.29 Struktur File Frontend

B. /src/components/
a) LeafletMap.tsx
Komponen utama peta interaktif dengan Leaflet yang mengintegrasikan semua fitur peta, routing, dan manajemen data bangunan/ruangan.
b) ParticlesCustom.tsx
Komponen animasi particles untuk latar belakang dengan efek polkadot (mode terang) dan bintang (mode gelap).
c) map/LeafletMap/BuildingDetailModal.tsx
Modal detail gedung dengan desain responsif, fitur edit thumbnail, lantai, dan navigasi rute.
d) map/LeafletMap/EditLantaiImageUploader.tsx
Uploader gambar lantai dengan fitur drag-and-drop, manajemen lantai, dan integrasi dengan data ruangan.
e) map/LeafletMap/EditRuanganForm.tsx
Formulir edit ruangan dengan dynamic fields, pin positioning, dan validasi input.
f) map/LeafletMap/MapControlsPanel.tsx
Panel kontrol peta dengan pengaturan layer, basemap switching, search functionality, dan legend.
g) map/LeafletMap/Navigation.tsx
Komponen navigasi dengan kontrol rute step-by-step, estimasi waktu dan jarak, serta mode transportasi.

Gambar 3.30 Struktur File Frontend /src/components/
C. /src/hooks/

1. auth/useAuth.ts
   Hook untuk mengelola status autentikasi dan manajemen token dengan fitur auto-logout, role-based access control, dan state management untuk login/logout.
2. gps/useGps.ts
   Hook untuk melacak posisi GPS menggunakan Web Geolocation API dengan fitur live tracking, device orientation (heading), campus boundary detection, dan troubleshooting GPS.
3. map/useFeatureSearch.ts
   Hook untuk pencarian fitur peta dengan autocomplete yang mendukung pencarian bangunan dan ruangan dengan display type dan informasi tambahan.
4. routing/useRouteDrawing.ts
   Hook untuk menggambar rute dengan alat interaktif menggunakan Leaflet polyline, dengan fungsi addRouteLine dan removeRouteLine.
5. routing/useRouting.ts
   Hook utama untuk algoritma routing dengan state management untuk route steps, active step index, estimasi waktu dan jarak, serta mode transportasi (jalan kaki/kendaraan).

Gambar 3.31 Struktur File Frontend /src/hooks/
D. /src/lib/

1. auth.ts
   Fungsi autentikasi dan validasi dengan praktik keamanan, termasuk JWT token validation, auto-logout scheduling, dan localStorage management.
2. map/basemaps.ts
   Konfigurasi layer peta dasar dari berbagai penyedia (Esri Satellite, Esri Topographic, Dark Carto, OpenStreetMap) tanpa memerlukan API key.
3. map/constants.ts
   Konstanta untuk peta dan routing, termasuk endpoint GeoJSON bangunan dari backend dan file GeoJSON statis untuk layer referensi.
4. map/styles.ts
   Gaya (style) untuk fitur peta dengan dukungan tema, termasuk konfigurasi style per kategori (Bangunan, Trotoar, Jalan, Lahan, Parkir, Kanopi, Kolam, Paving, Taman) dan style default.
5. routing.ts
   Algoritma routing utama menggunakan algoritma custom dengan fitur findNearestPoint, calculateDistance (Haversine formula), dan integrasi OSRM untuk rute dunia nyata.
6. routeSteps.ts
   Utility untuk navigasi langkah demi langkah dengan fitur perhitungan sudut belok, bearing calculation, dan instruksi navigasi yang detail.

Gambar 3.32 Struktur File Frontend /src/lib/
E. /src/services/

1. bangunan.ts
   Service untuk operasi gedung dengan fungsi updateBangunan dan uploadBangunanThumbnail, termasuk error handling dan JWT authentication.
2. lantaiGambar.ts
   Service untuk pengelolaan gambar lantai dengan CRUD operations (getLantaiGambarByBangunan, createLantaiGambar, deleteLantaiGambar, updateLantaiGambar) dan file upload handling.
3. ruangan.ts
   Service untuk operasi ruangan dengan CRUD operations (createRuangan, updateRuangan, getRuanganByBangunan, deleteRuangan) dan integrasi dengan data bangunan.

Gambar 3.33 Struktur File Frontend /src/services/
F. /src/types/

1. map.ts
   Tipe data (types) untuk peta, routing, dan fitur geografis, termasuk interface FeatureProperties untuk properti umum fitur peta (bangunan/ruangan), FeatureFixed yang extends GeoJSON. Feature, dan alias FeatureType yang digunakan di komponen.

Gambar 3.34 Struktur File Frontend /src/types/
G. /public/

1. geojson/
   File GeoJSON untuk data peta kampus.
2. img/
   Gambar gedung, lantai, dan ruangan dengan optimasi.
3. Slider/
   Gambar latar belakang slider dengan transisi halus (smooth transitions).
4. building-details/
   Halaman detail gedung yang berdiri sendiri dengan file HTML, CSS, dan JavaScript terpisah untuk fungsionalitas yang independen.

Gambar 3.35 Struktur File Frontend /public/
H. File Konfigurasi

1. next.config.ts
   Konfigurasi Next.js dengan konfigurasi default dan opsi yang dapat dikustomisasi.
2. tailwind.config.ts
   Konfigurasi Tailwind CSS dengan sistem desain kustom.
3. tsconfig.json
   Konfigurasi TypeScript dengan pemeriksaan tipe yang ketat (strict type checking).
4. package.json
   Daftar dependencies dan skrip npm, termasuk library untuk peta (Leaflet, ESRI), UI components (FontAwesome, React Icons), routing (Dijkstra), dan development tools.

Gambar 3.36 Struktur File Konfigurasi Frontend

BAB IV
HASIL DAN PEMBAHASAN

4.1 Skenario Pengujian
Pengujian sistem PointMap dilakukan dengan metode integration testing untuk memastikan seluruh komponen dan fitur dapat bekerja sama sesuai rancangan pada Bab III. Pengujian mencakup fitur yang dapat diakses tanpa login (guest) hingga fitur yang memerlukan autentikasi sebagai admin.
Rincian kasus uji, tujuan, hasil yang diharapkan, hasil aktual, serta status pengujian disajikan pada Tabel 4.1 Skenario Pengujian
Tabel 4.1 Skenario Pengujian
Kasus Uji & Langkah Pengujian Tujuan Hasil yang Diharapkan Hasil Aktual Status
Halaman Beranda – Navbar

1. Muat halaman pertama kali.
2. Klik tombol Dark Mode.
3. Klik tombol Login. Memastikan navbar tampil dan tombol berfungsi. Navbar muncul saat halaman dimuat.
   Dark mode mengubah tema warna.
   Tombol login menuju halaman login. Navbar tampil normal.
   Dark mode bekerja.
   Tombol login mengarahkan ke halaman login. Berhasil
   Halaman Beranda – Hero Section & Navigasi ke Peta
4. Klik tombol Jelajahi Peta pada hero section. Mengarahkan pengguna ke tampilan peta Leaflet. Halaman berpindah ke canvas peta Leaflet. Tombol mengarahkan ke peta Leaflet. Berhasil
   Canvas Peta – Layer Bangunan
5. Periksa warna layer bangunan sesuai kategori.
6. Sembunyikan/tampilkan layer.
7. Ubah tampilan peta menjadi satelit/topografi. Memastikan layer sesuai kategori dan kontrol layer berfungsi. Warna bangunan sesuai kategori.
   Layer dapat disembunyikan/ditampilkan.
   Peta berganti antara satelit/topografi. Warna sesuai kategori.
   Layer dapat di-hide/unhide.
   Tampilan peta berganti dengan lancar. Berhasil
   Canvas Peta – Kontrol Lokasi & Zoom
8. Klik tombol Lokasi Saya.
9. Klik Zoom In, Zoom Out, dan Reset Posisi. Memastikan kontrol peta berfungsi. Lokasi pengguna ditampilkan.
   Zoom in/out bekerja.
   Reset mengembalikan posisi awal peta. Lokasi terdeteksi dengan baik.
   Zoom berfungsi.
   Reset posisi berhasil. Berhasil
   Interaksi Bangunan – Popup
10. Klik bangunan di peta.
11. Lihat popup informasi. Memastikan popup tampil dengan benar. Popup menampilkan nama, thumbnail, dan tombol Rute & Detail. Popup tampil lengkap dengan tombol rute & detail. Berhasil
    Detail Bangunan – Tampilan 2.5D & Lantai
12. Klik Detail di popup.
13. Ubah lantai.
14. Switch antara 2D & 2.5D.
15. Klik marker ruangan. Memastikan detail bangunan tampil dan interaksi ruangan berfungsi. Lantai dapat diganti.
    Tampilan 2D/2.5D berganti.
    Marker ruangan menampilkan info & galeri.
    Ada tombol kembali ke peta Leaflet. Semua fungsi bekerja sesuai harapan. Berhasil
    Rute Navigasi
16. Klik Rute di popup bangunan.
17. Pilih mode (jalan kaki/kendaraan) & titik awal (lokasi saya/list).
18. Klik Cari Rute.
19. Gunakan tombol Next dan Prev di instruksi navigasi. Memastikan fitur rute berfungsi. Rute muncul di peta.
    Terdapat estimasi waktu & jarak.
    Instruksi navigasi bisa di-scroll Next/Prev. Rute muncul dengan instruksi lengkap.
    Estimasi waktu & jarak sesuai perhitungan. Berhasil
    Login Admin
20. Masukkan kredensial admin yang valid.
21. Login. Memastikan admin bisa login. Masuk ke dashboard admin tanpa hero section & footer. Login berhasil, dashboard sesuai desain. Berhasil
    Admin – Edit Data Bangunan
22. Pilih bangunan.
23. Edit nama & thumbnail.
24. Simpan perubahan. Memastikan data bangunan bisa diperbarui. Nama dan thumbnail bangunan berubah sesuai input. Perubahan tersimpan dan langsung terlihat. Berhasil
    Admin – Kelola Lantai
25. Tambah lantai baru.
26. Edit gambar lantai.
27. Hapus lantai. Memastikan CRUD lantai berfungsi. Lantai dapat ditambah, diubah, dan dihapus. Semua operasi lantai berhasil dilakukan. Berhasil
    Admin – Kelola Ruangan
28. Tambah ruangan.
29. Edit ruangan.
30. Hapus ruangan.
31. Kelola galeri ruangan. Memastikan CRUD ruangan dan galeri berfungsi. Data ruangan dan galeri sesuai hasil operasi. Semua operasi ruangan & galeri berjalan normal. Berhasil

Berdasarkan tabel di atas, seluruh kasus uji untuk fitur-fitur inti platform telah
berhasil dijalankan dan memberikan hasil sesuai dengan yang diharapkan.

4.2 Hasil Pengujian
Hasil pengujian sistem PointMap diperoleh berdasarkan pelaksanaan skenario pengujian pada Tabel 4.1 Skenario Pengujian. Seluruh pengujian dilakukan untuk memastikan setiap komponen sistem berfungsi sesuai rancangan pada Bab III, baik untuk pengguna tanpa login (guest) maupun pengguna admin.
Secara umum, seluruh fitur pada sistem telah berjalan sesuai dengan hasil yang diharapkan. Fitur navigasi, tampilan peta interaktif, pengelolaan data bangunan, lantai, ruangan, serta galeri dapat digunakan tanpa error. Status pengujian untuk seluruh kasus uji dinyatakan Berhasil.
Untuk memperjelas hasil pengujian, berikut disajikan dokumentasi berupa tangkapan layar dari beberapa halaman utama dan fitur penting pada sistem:

4.2.1 Halaman Beranda
Berdasarkan hasil pengujian pada tabel, halaman beranda menampilkan navbar dengan tombol Dark Mode dan Login, hero section dengan tombol Jelajahi Peta yang berfungsi mengarahkan ke peta Leaflet, serta komponen lain yang berfungsi sesuai harapan.

Gambar 4.1 Halaman Beranda Light Mode

Gambar 4.2 Halaman Beranda Dark Mode

4.2.2 Kontrol Peta
Berdasarkan hasil pengujian, kontrol peta pada canvas berfungsi dengan baik dan memberikan pengalaman navigasi yang lancar. Peta menampilkan layer bangunan dengan warna sesuai kategori masing-masing, dan pengguna dapat mengatur visibility layer tersebut. Selain itu, tersedia opsi untuk mengganti tampilan peta antara satelit dan topografi.
Fitur navigasi standar seperti zoom in/out berjalan halus, sedangkan tombol Lokasi Saya mampu mendeteksi posisi pengguna dengan akurat. Tombol reset posisi juga bekerja sesuai harapan dengan mengembalikan tampilan peta ke kondisi awal. Secara keseluruhan, seluruh kontrol peta telah diuji dan berfungsi sesuai harapan..

Gambar 4.3 Tampilan Canvas Peta Satelit dan Warna Kategori

Gambar 4.4 Tampilan Canvas Layer Bangunan Disembunyikan

Gambar 4.5 Tampilan Canvas Zoom in dan Zoom out

Gambar 4.6 Tampilan Canvas Lokasi Saya dan Akses GPS Diizinkan

Gambar 4.7 Tampilan Canvas Lokasi Saya dan Akses GPS Ditolak
4.2.3 Pop Up Informasi Bangunan
Popup informasi bangunan menampilkan data lengkap termasuk nama bangunan, thumbnail gambar, dan tombol aksi untuk Detail Bangunan dan Rute. Popup muncul dengan responsif saat pengguna mengklik bangunan di peta, memberikan akses cepat ke fitur-fitur utama platform.

Gambar 4.8 Pop up Layer Bangunan diklik

Gambar 4.9 Pop up Thumbnail di klik
4.2.4 Tampilan Detail Bangunan
Berdasarkan hasil pengujian, saat pengguna memilih opsi Detail pada popup bangunan, sistem menampilkan model bangunan dalam tampilan 2.5D yang dapat diganti menjadi 2D. Pengguna dapat memilih lantai, melihat marker ruangan, dan mengakses informasi serta galeri ruangan.

Gambar 4.10 Tampilan Detail Bangunan Awal

Gambar 4.11 Tampilan Detail Bangunan Salah Satu Lantai Diklik Mode 2.5D

Gambar 4.12 Tampilan Detail Bangunan Salah Satu Lantai Diklik Mode 2D

Gambar 4.13 Tampilan Detail Ruangan Klik Pin Marker / List Ruangan 2.5D

Gambar 4.14 Tampilan Detail Ruangan Klik Pin Marker / List Ruangan 2D

Gambar 4.15 Tampilan Detail Ruangan Gallery Diklik
4.2.5 Fitur Rute Navigasi
Pengujian menunjukkan bahwa fitur rute navigasi berfungsi dengan baik. Sistem mampu menghitung rute dari lokasi pengguna ke bangunan tujuan dengan estimasi waktu tempuh dan jarak yang cukup akurat. Pengguna dapat memilih mode transportasi, yaitu jalan kaki atau kendaraan.
Pada mode jalan kaki, pengguna bebas melewati seluruh jalur yang tersedia, termasuk jalan kecil maupun jalur alternatif yang tidak bisa dilewati kendaraan. Sedangkan pada mode kendaraan, sistem secara otomatis menerapkan aturan satu jalur dan hanya memperhitungkan jalan yang dapat dilalui kendaraan.
Selain itu, sistem juga menyediakan tombol Next dan Prev untuk memudahkan navigasi instruksi rute secara berurutan.

Gambar 4.16 Fitur Rute Navigasi Modal Cari Rute Lokasi Saya

Gambar 4.17 Instruksi Navigasi Titik Gerbang Terdekat Mode Kendaraan

Gambar 4.18 Fitur Rute Navigasi Modal Cari Rute Mode Jalan Kaki

Gambar 4.19 Instruksi Navigasi Titik Awal Mode Jalan Kaki

Gambar 4.20 Instruksi Navigasi Titik Pertengahan Mode Jalan Kaki

Gambar 4.21 Instruksi Navigasi Titik Tujuan Mode Jalan Kaki

Gambar 4.22 Fitur Rute Navigasi Modal Cari Rute Mode Kendaraan

Gambar 4.23 Instruksi Navigasi Titik Awal Mode Kendaraan

Gambar 4.24 Instruksi Navigasi Titik Pertengahan Mode Kendaraan

Gambar 4.25 Instruksi Navigasi Titik Tujuan Mode Kendaraan
4.2.6 Halaman Login
Pengujian menunjukkan bahwa halaman login menerima input kredensial admin dan mengarahkan pengguna yang berhasil login ke halaman dashboard. Fungsi autentikasi berjalan sesuai rancangan tanpa kendala.

Gambar 4.26 Halaman Login

4.2.7 Dashboard Dan Manajemen Data Admin
Berdasarkan hasil pengujian, dashboard admin berfungsi dengan baik sebagai pusat pengelolaan data sistem. Tampilan peta pada dashboard serupa dengan halaman utama namun tanpa hero section dan footer, sehingga lebih fokus pada fungsi manajemen data.
Admin dapat melakukan pengelolaan data bangunan, lantai, ruangan, serta galeri dengan interface yang intuitif. Seluruh fitur CRUD (Create, Read, Update, Delete) berjalan lancar dengan validasi input yang tepat serta adanya konfirmasi saat menghapus data. Pengelolaan galeri ruangan juga mendukung upload gambar yang responsif.
Secara keseluruhan, dashboard admin mendukung proses manajemen data dengan baik sesuai hasil pengujian.

Gambar 4.27 Halaman Dashboard

Gambar 4.28 Tampilan Dashboard Gedung Diklik

Gambar 4.29 Tampilan Dashboard Modal Edit Informasi Bangunan

Gambar 4.30 Notifikasi Berhasil Perbarui Data Nama / Interaksi Bangunan

Gambar 4.31 Tampilan Dashboard Modal Edit Thumbnail Bangunan

Gambar 4.32 Notifikasi Berhasil Perbarui Thumbnail Bangunan

Gambar 4.33 Modal Edit Lantai Bangunan

Gambar 4.34 Modal Tambah Lantai Bangunan

Gambar 4.35 Notifikasi Jika Upload Gambar Selain Format SVG

Gambar 4.36 Jika Upload Gambar Lantai Format SVG

Gambar 4.37 Notifikasi Jika Lantai berhasil Ditambah

Gambar 4.38 Modal Edit Lantai

Gambar 4.39 Notifikasi Edit Berhasil Dilakukan

Gambar 4.40 Peringatan Jika Lantai Dihapus

Gambar 4.41 Notifikasi Jika Lantai Berhasil Dihapus

Gambar 4.42 Modal List Ruangan Saat Lantai Diklik

Gambar 4.43 Modal Tambah Ruangan

Gambar 4.44 Modal Tentukan Posisi Ruangan Bagian 1

Gambar 4.45 Modal Tentukan Posisi Ruangan Bagian 2

Gambar 4.46 Modal Setelah Memilih Posisi Pin

Gambar 4.47 Notifikasi Jika Ruangan Berhasil Ditambahkan

Gambar 4.48 Modal Jika Ruangan Dihapus

Gambar 4.49 Notifikasi Jika Ruangan Berhasil Dihapus

Gambar 4.50 Dashboard Admin Edit Data Ruangan

Gambar 4.51 Modal Edit Informasi Ruangan

Gambar 4.52 Notifikasi Jika Perubahan Tidak Valid

Gambar 4.53 Notifikasi Jika Data Berhasil Diubah

Gambar 4.54 Modal Untuk Perbarui Gallery Ruangan

Gambar 4.55 Notifikasi Gallery Dihapus

Gambar 4.56 Modal Tambahkan Gallery

Gambar 4.57 Modal Berhasil Tambah Gallery
4.2.8 Responsivitas Dan User Experience
Pengujian menunjukkan bahwa platform responsif di berbagai ukuran layar dan memberikan user experience yang konsisten. Transisi antar halaman berjalan lancar, loading time optimal, dan interface yang intuitif memudahkan pengguna dalam navigasi dan penggunaan fitur-fitur platform.

Gambar 4.58 Tampilan Responsif Mobile
4.3 Pembahasan
Berdasarkan hasil pengujian pada Tabel 4.1 Skenario Pengujian serta dokumentasi yang disajikan pada bagian 4.2, dapat disimpulkan bahwa seluruh fitur pada sistem PointMap telah berfungsi sesuai dengan rancangan pada Bab III.
Fitur yang dapat diakses tanpa login, seperti navigasi peta Leaflet, kontrol layer, penampilan popup informasi bangunan, tampilan detail 2D/2.5D, galeri ruangan, serta navigasi rute, berjalan lancar dan memberikan respon yang sesuai dengan hasil yang diharapkan. Hal ini menunjukkan bahwa integrasi antara frontend dan backend berjalan dengan baik, terutama pada proses pengambilan dan penampilan data dari basis data melalui API.
Fitur admin yang memerlukan autentikasi, seperti pengelolaan data bangunan, lantai, ruangan, dan galeri, juga telah diuji dan dinyatakan berhasil. Operasi Create, Read, Update, dan Delete (CRUD) dapat dilakukan tanpa menimbulkan error, serta perubahan data dapat langsung terlihat pada tampilan peta.
Hasil pengujian juga membuktikan bahwa sistem mampu menampilkan informasi sesuai kategori, mengatur lapisan peta, serta melakukan perhitungan navigasi beserta estimasi waktu dan jarak tempuh secara akurat. Fitur Dark Mode bekerja konsisten di semua halaman, baik untuk pengguna biasa maupun admin.
Dengan tidak ditemukannya error selama proses pengujian, maka sistem PointMap dapat dikatakan telah memenuhi kebutuhan fungsional yang telah didefinisikan pada tahap perancangan. Meski demikian, pengembangan selanjutnya dapat mempertimbangkan peningkatan performa pemuatan peta pada koneksi internet lambat.

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
[13] Adobe Inc., “Vector Graphics Software - Adobe Ilustrator.” https://www.adobe.com/products/illustrator.html
[14] “ArcGIS Pro Esri Indonesia.” http://esriindonesia.co.id/id/arcgis-pro

LAMPIRAN



1. Hasil Plagiarisme
