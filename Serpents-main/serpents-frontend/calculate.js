(function () {

  // ===== BACKEND URL =====
  const BACKEND = "http://127.0.0.1:8000";  // CHANGE THIS

  // ===== DOM ELEMENTS =====
  const form = document.getElementById("carbonFootprintForm");
  const resultEl = document.getElementById("result");
  const aiAdviceBtn = document.getElementById("aiAdviceBtn");
  const aiAdviceEl = document.getElementById("aiAdvice");
  const pdfBtn = document.getElementById("pdfBtn");
  const saveBtn = document.getElementById("saveBtn");
  const historyEl = document.getElementById("history");
  const historyList = document.getElementById("historyList");
  const clearHistoryBtn = document.getElementById("clearHistoryBtn");

  const timeframeRadios = document.querySelectorAll('input[name="timeframe"]');

  // =====================================================
  //      CO₂ EMISSION FACTORS (per unit)
  // =====================================================

  const EF = {
    transport: {
      car: 0.192,     // kg per km
      bike: 0.05,
      bus: 0.089,
      train: 0.041,
      ev: 0.05
    },

    electricity: {
      led: 0.00036,      // 0.36 g/min
      fan: 0.0050,        // 5 g/min
      ac: 0.0200,         // 20 g/min
      laptop: 0.0020,
      mobile: 0.0005
    },

    food: {
      veg: 0.5,        // kg/meal
      nonveg: 2.5,
      fastfood: 1.8,
      dairy: 1.2       // per litre
    },

    waste: {
      plastic: 6.0,
      paper: 1.2,
      wet: 0.4,
      ewaste: 12.0
    },

    purchase: {
      clothes: 25,
      electronics: 70,
      cosmetics: 8,
      packaged: 3.5
    }
  };

  const WEEKLY_TARGET_MIN = 38.5;
  const WEEKLY_TARGET_MAX = 57.7;

  function fmt(n) {
    return Number(n).toFixed(2);
  }

  function getTimeframe() {
    return [...timeframeRadios].find(r => r.checked).value;
  }

  function scaleToTimeframe(value, timeframe) {
    if (timeframe === "month") return value * 4.3;
    if (timeframe === "year") return value * 52;
    return value;
  }

  // =====================================================
  //               CALCULATIONS
  // =====================================================

  function calculateFootprint() {
    // Transport
    const km = parseFloat(document.getElementById("transport_km").value) || 0;
    const type = document.getElementById("transport_type").value;
    const transportCO2 = km * EF.transport[type];

    // Electricity (minutes → kg)
    const led = (parseFloat(document.getElementById("led_min").value) || 0) * EF.electricity.led;
    const fan = (parseFloat(document.getElementById("fan_min").value) || 0) * EF.electricity.fan;
    const ac = (parseFloat(document.getElementById("ac_min").value) || 0) * EF.electricity.ac;
    const laptop = (parseFloat(document.getElementById("laptop_min").value) || 0) * EF.electricity.laptop;
    const mobile = (parseFloat(document.getElementById("mobile_min").value) || 0) * EF.electricity.mobile;

    const electricityCO2 = led + fan + ac + laptop + mobile;

    // Food
    const veg = (parseFloat(document.getElementById("veg_meals").value) || 0) * EF.food.veg;
    const nonveg = (parseFloat(document.getElementById("nonveg_meals").value) || 0) * EF.food.nonveg;
    const fastfood = (parseFloat(document.getElementById("fastfood_meals").value) || 0) * EF.food.fastfood;
    const dairy = (parseFloat(document.getElementById("dairy_litre").value) || 0) * EF.food.dairy;

    const foodCO2 = veg + nonveg + fastfood + dairy;

    // Waste
    const plastic = (parseFloat(document.getElementById("plastic_kg").value) || 0) * EF.waste.plastic;
    const paper = (parseFloat(document.getElementById("paper_kg").value) || 0) * EF.waste.paper;
    const wet = (parseFloat(document.getElementById("wet_kg").value) || 0) * EF.waste.wet;
    const ewaste = (parseFloat(document.getElementById("ewaste_kg").value) || 0) * EF.waste.ewaste;

    const wasteCO2 = plastic + paper + wet + ewaste;

    // Purchases
    const clothes = (parseFloat(document.getElementById("clothes").value) || 0) * EF.purchase.clothes;
    const electronics = (parseFloat(document.getElementById("electronics").value) || 0) * EF.purchase.electronics;
    const cosmetics = (parseFloat(document.getElementById("cosmetics").value) || 0) * EF.purchase.cosmetics;
    const packaged = (parseFloat(document.getElementById("packaged").value) || 0) * EF.purchase.packaged;

    const purchaseCO2 = clothes + electronics + cosmetics + packaged;

    const totalWeekly = transportCO2 + electricityCO2 + foodCO2 + wasteCO2 + purchaseCO2;

    return {
      totalWeekly,
      parts: {
        Transport: transportCO2,
        Electricity: electricityCO2,
        Food: foodCO2,
        Waste: wasteCO2,
        Purchases: purchaseCO2
      }
    };
  }

  // =====================================================
  //                    RENDER UI
  // =====================================================

  let chart;

  function renderChart(parts) {
    const ctx = document.getElementById("breakdownChart").getContext("2d");
    if (chart) chart.destroy();
    chart = new Chart(ctx, {
      type: "pie",
      data: {
        labels: Object.keys(parts),
        datasets: [{ data: Object.values(parts) }]
      },
      options: { responsive: true }
    });
  }

  function render(result) {
    const timeframe = getTimeframe();

    const scaledParts = {};
    for (let k in result.parts) {
      scaledParts[k] = scaleToTimeframe(result.parts[k], timeframe);
    }

    const total = scaleToTimeframe(result.totalWeekly, timeframe);

    renderChart(scaledParts);

    resultEl.innerHTML = `
      <h2>Total CO₂: <strong>${fmt(total)}</strong> kg (${timeframe})</h2>
      <ul>
        ${Object.entries(scaledParts)
          .map(([k, v]) => `<li><strong>${k}:</strong> ${fmt(v)} kg</li>`)
          .join("")}
      </ul>
    `;

    resultEl.dataset.payload = JSON.stringify({
      total: result.totalWeekly,
      breakdown: result.parts
    });
  }

  // =====================================================
  //                      SAVE HISTORY
  // =====================================================

  function renderHistory() {
    const arr = JSON.parse(localStorage.getItem("cf_history") || "[]");

    historyList.innerHTML = arr
      .map(
        (h, i) =>
          `<li>#${i + 1} — ${new Date(h.date).toLocaleString()} — <b>${fmt(
            h.total
          )}</b> kg</li>`
      )
      .join("");

    historyEl.hidden = arr.length === 0;
  }

  saveBtn.addEventListener("click", () => {
    const payload = JSON.parse(resultEl.dataset.payload || "{}");
    if (!payload.total) return alert("Calculate first!");

    const arr = JSON.parse(localStorage.getItem("cf_history") || "[]");

    arr.unshift({
      date: new Date().toISOString(),
      total: payload.total
    });

    localStorage.setItem("cf_history", JSON.stringify(arr.slice(0, 20)));
    renderHistory();
  });

  clearHistoryBtn.addEventListener("click", () => {
    localStorage.removeItem("cf_history");
    renderHistory();
  });

  // =====================================================
  //                       PDF EXPORT
  // =====================================================

  pdfBtn.addEventListener("click", () => {
    const payload = JSON.parse(resultEl.dataset.payload || "{}");
    if (!payload.total) return alert("Calculate first!");

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    pdf.setFontSize(16);
    pdf.text("Carbon Footprint Report", 10, 15);

    pdf.setFontSize(12);
    pdf.text(`Total Weekly CO₂: ${fmt(payload.total)} kg`, 10, 25);

    let y = 35;
    pdf.text("Breakdown:", 10, y);
    y += 8;

    Object.entries(payload.breakdown).forEach(([k, v]) => {
      pdf.text(`${k}: ${fmt(v)} kg`, 12, y);
      y += 8;
    });

    pdf.save("carbon_report.pdf");
  });

  // =====================================================
  //                       AI ADVICE
  // =====================================================

  aiAdviceBtn.addEventListener("click", async () => {
    const payload = JSON.parse(resultEl.dataset.payload || "{}");
    if (!payload.total) return alert("Calculate first!");

    aiAdviceEl.style.display = "block";
    aiAdviceEl.textContent = "🤖 Generating advice...";

    try {
      const res = await fetch(`${BACKEND}/advice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      aiAdviceEl.textContent = data.advice || "No advice found.";

    } catch (err) {
      aiAdviceEl.textContent = "Error: " + err.message;
    }
  });

  // =====================================================
  // FORM SUBMIT
  // =====================================================
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const result = calculateFootprint();
    render(result);
  });

  renderHistory();

})();
