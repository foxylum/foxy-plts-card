class FoxyPltsCard extends HTMLElement {
  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    this.config = {
      title: "Foxy PLTS",
      animation: "dots",
      thresholds: { active_w: 10 },
      colors: {
        pv: "#fbbf24",
        grid_import: "#ef4444",
        grid_export: "#22c55e",
        load: "#22d3ee",
        battery_charge: "#22c55e",
        battery_discharge: "#f97316",
        idle: "#64748b",
      },
      ...config,
    };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this.config) this._render();
  }

  getCardSize() { return 6; }

  _num(entity) {
    if (!entity || !this._hass?.states?.[entity]) return 0;
    const v = Number(this._hass.states[entity].state);
    return Number.isFinite(v) ? v : 0;
  }

  _fmtPower(w) {
    const n = Number(w) || 0;
    if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(2)} kW`;
    return `${Math.round(n)} W`;
  }

  _fmt(entity, unit="", digits=1) {
    if (!entity || !this._hass?.states?.[entity]) return `—${unit ? " "+unit : ""}`;
    const n = Number(this._hass.states[entity].state);
    if (!Number.isFinite(n)) return `${this._hass.states[entity].state}${unit ? " "+unit : ""}`;
    return `${n.toFixed(digits)}${unit ? " "+unit : ""}`;
  }

  _batteryBlock(b, i) {
    const soc = this._num(b.soc);
    const power = this._num(b.power);
    const voltage = this._fmt(b.voltage, "V", 2);
    const current = this._fmt(b.current, "A", 2);
    return `
      <div class="battery-mini">
        <div class="battery-head">
          <span>${b.name || `Battery ${i+1}`}</span>
          <strong>${soc.toFixed(0)}%</strong>
        </div>
        <div class="soc-track"><div class="soc-fill" style="width:${Math.max(0, Math.min(100, soc))}%"></div></div>
        <div class="battery-metrics">
          <span>${this._fmtPower(power)}</span>
          <span>${voltage}</span>
          <span>${current}</span>
        </div>
      </div>
    `;
  }

  _render() {
    if (!this.config) return;
    const c = this.config;
    const pv = this._num(c.pv?.power);
    const grid = this._num(c.grid?.power);
    const load = this._num(c.load?.power);
    const inv = this._num(c.inverter?.power);
    const bats = Array.isArray(c.batteries) ? c.batteries : (c.battery ? [c.battery] : []);
    const batPower = bats.reduce((s,b) => s + this._num(b.power), 0);
    const active = c.thresholds?.active_w ?? 10;

    const pvActive = Math.abs(pv) >= active;
    const gridActive = Math.abs(grid) >= active;
    const loadActive = Math.abs(load) >= active;
    const batActive = Math.abs(batPower) >= active;

    const gridColor = !gridActive ? c.colors.idle : (grid >= 0 ? c.colors.grid_import : c.colors.grid_export);
    const batColor = !batActive ? c.colors.idle : (batPower >= 0 ? c.colors.battery_charge : c.colors.battery_discharge);
    const batDir = batPower >= 0 ? "forward" : "reverse";
    const gridDir = grid >= 0 ? "forward" : "reverse";

    const totalSoc = bats.length
      ? bats.reduce((s,b) => s + this._num(b.soc),0) / bats.length
      : 0;

    this.innerHTML = `
      <ha-card>
        <style>
          :host { display:block; }
          ha-card {
            background: radial-gradient(circle at 50% 30%, #172033 0%, #0b1020 58%, #070b14 100%);
            color: var(--primary-text-color);
            overflow:hidden;
            border-radius:18px;
          }
          .wrap { padding:18px; }
          .title { font-size:16px; font-weight:700; letter-spacing:.08em; opacity:.9; margin-bottom:8px; }
          .stage { position:relative; min-height:520px; }
          svg.flowmap { position:absolute; inset:0; width:100%; height:100%; pointer-events:none; }
          .flow {
            fill:none; stroke-width:5; stroke-linecap:round; opacity:.88;
            stroke-dasharray:2 14; animation:dash 1.15s linear infinite;
          }
          .flow.off { animation:none; opacity:.24; }
          .flow.reverse { animation-direction:reverse; }
          @keyframes dash { to { stroke-dashoffset:-32; } }
          .node {
            position:absolute; transform:translate(-50%,-50%);
            min-width:122px; text-align:center; z-index:2;
          }
          .node .icon { font-size:38px; line-height:1; filter:drop-shadow(0 0 12px currentColor); }
          .node .value { font-size:21px; font-weight:800; margin-top:6px; }
          .node .sub { font-size:11px; opacity:.72; margin-top:3px; }
          .node .label { font-size:10px; letter-spacing:.14em; opacity:.62; margin-top:4px; }
          .pv { left:50%; top:11%; color:${c.colors.pv}; }
          .grid { left:11%; top:50%; color:${gridColor}; }
          .inv { left:50%; top:50%; }
          .load { left:89%; top:50%; color:${c.colors.load}; }
          .bat { left:50%; top:84%; color:${batColor}; min-width:190px; }
          .invbox {
            width:104px; height:104px; margin:auto;
            display:grid; place-items:center; border-radius:24px;
            background:linear-gradient(145deg,#26334b,#111827);
            border:1px solid rgba(255,255,255,.14);
            box-shadow:0 10px 35px rgba(0,0,0,.35), inset 0 1px rgba(255,255,255,.06);
          }
          .batteries { margin-top:12px; display:grid; gap:8px; }
          .battery-mini {
            color:#e5e7eb; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08);
            border-radius:12px; padding:8px 10px; text-align:left;
          }
          .battery-head, .battery-metrics { display:flex; justify-content:space-between; gap:8px; font-size:11px; }
          .soc-track { height:6px; border-radius:99px; background:#20293a; overflow:hidden; margin:6px 0; }
          .soc-fill { height:100%; background:${batColor}; }
          @media (max-width:600px) {
            .stage { min-height:470px; }
            .node .value { font-size:17px; }
            .node { min-width:100px; }
            .invbox { width:88px; height:88px; }
          }
        </style>
        <div class="wrap">
          <div class="title">${c.title || "Foxy PLTS"}</div>
          <div class="stage">
            <svg class="flowmap" viewBox="0 0 1000 600" preserveAspectRatio="none">
              <path class="flow ${pvActive ? "" : "off"}" d="M500 95 L500 270" stroke="${c.colors.pv}"/>
              <path class="flow ${gridActive ? "" : "off"} ${gridDir === "reverse" ? "reverse":""}" d="M150 300 L440 300" stroke="${gridColor}"/>
              <path class="flow ${loadActive ? "" : "off"}" d="M560 300 L850 300" stroke="${c.colors.load}"/>
              <path class="flow ${batActive ? "" : "off"} ${batDir === "reverse" ? "reverse":""}" d="M500 360 L500 505" stroke="${batColor}"/>
            </svg>

            <div class="node pv">
              <div class="icon">☀</div>
              <div class="value">${this._fmtPower(pv)}</div>
              <div class="sub">${this._fmt(c.pv?.voltage,"V",1)} · ${this._fmt(c.pv?.current,"A",1)}</div>
              <div class="label">SOLAR</div>
            </div>

            <div class="node grid">
              <div class="icon">⚡</div>
              <div class="value">${this._fmtPower(grid)}</div>
              <div class="sub">${this._fmt(c.grid?.voltage,"V",1)}</div>
              <div class="label">GRID</div>
            </div>

            <div class="node inv">
              <div class="invbox">
                <div>
                  <div class="icon">⟳</div>
                  <div class="value">${this._fmtPower(inv || load)}</div>
                </div>
              </div>
              <div class="sub">${this._fmt(c.inverter?.voltage,"V",1)}</div>
              <div class="label">INVERTER</div>
            </div>

            <div class="node load">
              <div class="icon">⌂</div>
              <div class="value">${this._fmtPower(load)}</div>
              <div class="label">LOAD</div>
            </div>

            <div class="node bat">
              <div class="icon">▣</div>
              <div class="value">${totalSoc.toFixed(0)}%</div>
              <div class="sub">${this._fmtPower(batPower)}</div>
              <div class="label">BATTERY BANK</div>
              <div class="batteries">
                ${bats.map((b,i)=>this._batteryBlock(b,i)).join("")}
              </div>
            </div>
          </div>
        </div>
      </ha-card>`;
  }
}

customElements.define("foxy-plts-card", FoxyPltsCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "foxy-plts-card",
  name: "Foxy PLTS Card",
  description: "Animated solar, grid, inverter, load and battery energy flow card."
});
