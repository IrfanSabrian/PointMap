# Use Case Diagram PointMap (Revised - Flowchart Style)

Kode Mermaid ini menggunakan tipe `graph TD` (Flowchart) yang lebih stabil namun distyling agar terlihat seperti Use Case Diagram (bentuk Oval).

## 1. Use Case Diagram Pengunjung

```mermaid
graph TD
    %% Actor
    U("<b>Pengunjung</b>")
    style U fill:#F3E5F5,stroke:#7B1FA2,stroke-width:2px,color:#000

    %% Use Cases (Bentuk Stadium/Oval)
    UC1(["<b>Memilih Kampus</b>"])
    UC2(["<b>Melihat Peta Interaktif</b>"])
    UC3(["<b>Mencari Lokasi</b><br/>(Gedung/Ruangan)"])
    UC4(["<b>Melihat Detail Bangunan</b><br/>(Mode 2D/2.5D)"])
    UC5(["<b>Melihat Daftar</b><br/>Lantai & Ruangan"])
    UC6(["<b>Melihat Detail Ruangan</b><br/>& Galeri Foto"])

    %% Styles for Use Cases
    classDef usecase fill:#fff,stroke:#333,stroke-width:1px,rx:20,ry:20;
    class UC1,UC2,UC3,UC4,UC5,UC6 usecase;

    %% Relations
    U --> UC1
    U --> UC2
    U --> UC3

    UC1 -.->|include| UC2
    UC2 --> UC4
    UC3 -.->|extends| UC4
    UC4 --> UC5
    UC5 --> UC6
```

## 2. Use Case Diagram Admin

```mermaid
graph TD
    %% Actor
    A("<b>Admin</b>")
    style A fill:#F3E5F5,stroke:#7B1FA2,stroke-width:2px,color:#000

    %% Use Cases
    UC_Login(["<b>Login</b>"])
    UC_Logout(["<b>Logout</b>"])

    subgraph Dashboard ["Dashboard Admin"]
        style Dashboard fill:#F8F9FA,stroke:#DEE2E6

        UC_Kampus(["<b>Mengelola Data Kampus</b>"])
        UC_Gedung(["<b>Mengelola Data Gedung</b>"])
        UC_Lantai(["<b>Mengelola Detail Lantai</b><br/>(Upload SVG)"])
        UC_Ruangan(["<b>Mengelola Ruangan</b><br/>(Pin Lokasi)"])
        UC_Galeri(["<b>Mengelola Galeri Foto</b>"])
    end

    %% Styles for Use Cases
    classDef usecase fill:#fff,stroke:#1565C0,stroke-width:1px,rx:20,ry:20;
    class UC_Login,UC_Logout,UC_Kampus,UC_Gedung,UC_Lantai,UC_Ruangan,UC_Galeri usecase;

    %% Relations
    A --> UC_Login
    UC_Login --> UC_Kampus
    UC_Login --> UC_Gedung

    UC_Gedung --> UC_Lantai
    UC_Lantai --> UC_Ruangan
    UC_Ruangan --> UC_Galeri

    UC_Login --> UC_Logout
```
