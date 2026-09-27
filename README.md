# Foxy PLTS Card

Custom Lovelace card untuk Home Assistant yang menampilkan aliran daya PV, grid, inverter, load, dan battery bank dengan animasi SVG.

## Fitur v0.1

- Animated PV → inverter flow
- Grid import/export dengan arah animasi otomatis
- Inverter → load flow
- Battery charge/discharge dengan arah animasi otomatis
- Multi-battery (JK BMS friendly)
- SOC, voltage, current, power per battery
- Responsive desktop/mobile
- Konfigurasi entity murni dari YAML

## Install manual

Copy `foxy-plts-card.js` ke:

`/config/www/foxy-plts-card/foxy-plts-card.js`

Tambahkan Resource:

`/local/foxy-plts-card/foxy-plts-card.js`

Type: `JavaScript Module`

Lalu gunakan YAML contoh di folder `examples/`.

## Tambahkan melalui pemilih card

Setelah card terpasang melalui HACS atau sebagai resource manual, buka dashboard dalam mode Edit, pilih **Add card**, lalu cari **Foxy PLTS Card**. Saat dipilih, konfigurasi YAML awal akan terisi otomatis sesuai contoh di `examples/dashboard.yaml` (tanpa perlu menyalinnya). Ganti semua `sensor.*` contoh dengan entity ID di Home Assistant Anda sebelum menyimpan. Jika baru memperbarui card dari versi sebelumnya, muat ulang halaman browser agar konfigurasi awal terbaru terbaca.

## Catatan sign convention

- `grid.power > 0` = import dari PLN ke rumah
- `grid.power < 0` = export ke grid
- `battery.power > 0` = charging
- `battery.power < 0` = discharging

Kalau sensor Anda memakai tanda kebalikan, buat template sensor di Home Assistant atau akan ditambahkan opsi invert pada rilis berikutnya.

## Detail sensor dengan klik

Klik ikon atau angka daya PV, grid, inverter, dan load untuk membuka dialog detail entity Home Assistant. Angka tegangan, arus, SOC, daya, dan bar SOC tiap baterai membuka detail sensor masing-masing. Ikon battery bank membuka detail SOC baterai pertama, atau sensor `battery_bank.soc` jika Anda mengaturnya. Angka SOC rata-rata dan total daya bank merupakan hasil hitung card, sehingga tidak memiliki dialog entity tersendiri. Semua nilai yang bisa diklik juga bisa dibuka dengan Enter atau spasi saat dipilih melalui keyboard.
