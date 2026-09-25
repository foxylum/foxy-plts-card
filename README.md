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

## Catatan sign convention

- `grid.power > 0` = import dari PLN ke rumah
- `grid.power < 0` = export ke grid
- `battery.power > 0` = charging
- `battery.power < 0` = discharging

Kalau sensor Anda memakai tanda kebalikan, buat template sensor di Home Assistant atau akan ditambahkan opsi invert pada rilis berikutnya.
