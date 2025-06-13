CREATE DATABASE IF NOT EXISTS pointmap;
USE pointmap;

CREATE TABLE IF NOT EXISTS admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL
);
INSERT INTO admin (username, password)
VALUES ('adminpolnep', 'password123');

CREATE TABLE IF NOT EXISTS prodi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    jurusan VARCHAR(100) NOT NULL,
    prodi VARCHAR(100) NOT NULL
);
INSERT INTO prodi (jurusan, prodi)
VALUES ('Teknik Elektro', 'D3 Teknik Informatika');

CREATE TABLE IF NOT EXISTS gedung (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    kode VARCHAR(20) NOT NULL UNIQUE,
    jumlah_lantai INT NOT NULL,
    jenis_gedung VARCHAR(50) NOT NULL,
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    x_pixel INT,
    y_pixel INT
);
INSERT INTO gedung (nama, kode, jumlah_lantai, jenis_gedung, latitude, longitude, x_pixel, y_pixel)
VALUES ('Gedung Teori Bersama', 'TB-1', 2, 'perkuliahan', -0.0671234, 109.3665432, 450, 320);

CREATE TABLE IF NOT EXISTS lantai (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_lantai VARCHAR(50) NOT NULL,
    nomor_lantai INT NOT NULL,
    id_gedung INT NOT NULL,
    FOREIGN KEY (id_gedung) REFERENCES gedung(id) ON DELETE CASCADE
);
INSERT INTO lantai (nama_lantai, nomor_lantai, id_gedung)
VALUES ('Lantai 1', 1, 1);

CREATE TABLE IF NOT EXISTS ruangan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_ruangan VARCHAR(100) NOT NULL,
    id_lantai INT NOT NULL,
    id_gedung INT NOT NULL,
    id_prodi INT,
    fungsi VARCHAR(100),
    x_pixel INT,
    y_pixel INT,
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    FOREIGN KEY (id_lantai) REFERENCES lantai(id) ON DELETE CASCADE,
    FOREIGN KEY (id_gedung) REFERENCES gedung(id) ON DELETE CASCADE,
    FOREIGN KEY (id_prodi) REFERENCES prodi(id) ON DELETE SET NULL
);
INSERT INTO ruangan (nama_ruangan, id_lantai, id_gedung, id_prodi, fungsi, x_pixel, y_pixel, latitude, longitude)
VALUES ('Lab Komputer 1', 1, 1, 1, 'Laboratorium Praktikum', 470, 350, -0.0671000, 109.3666000);

CREATE TABLE IF NOT EXISTS log_pengunjung (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_ruangan INT NOT NULL,
    jumlah_kunjungan INT NOT NULL DEFAULT 0,
    last_visited TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_ruangan) REFERENCES ruangan(id) ON DELETE CASCADE
);
INSERT INTO log_pengunjung (id_ruangan, jumlah_kunjungan)
VALUES (1, 7);
