const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vStPJ-dLKm5eh2GSriXgHf0g_icP_TLVej5O0gaoivM-vUU1W7_qcXlzT4pTJvJcm7DHVQ2OmbtnmVq/pub?gid=0&single=true&output=csv";

const API_URL =
  "https://script.google.com/macros/s/AKfycby9AbSpe8BMKYutA2Q3L1OgzghOcd75GxHOskleo9qdiXZ5-4sR0ZDEn7ZnCaYkGaWw/exec";

let painelResetado = false; // flag para indicar se o painel está resetado

// ---------------------------
// CARREGAR CHAMADOS
// ---------------------------
async function carregarChamados() {
  if (painelResetado) return; // não recarregar se o painel estiver resetado

  const tabela = document.querySelector("#tabelaChamados tbody");

  try {
    const csvTexto = await fetch(CSV_URL).then((r) => r.text());
    const parsed = Papa.parse(csvTexto, { header: true, skipEmptyLines: true });

    tabela.innerHTML = "";

    parsed.data.forEach((linha) => {
      const id = linha.ID || "";
      const data = linha.data || "";
      const nome = linha.nome || "";
      const email = linha.email || "";
      const motivo = linha.motivo || "";
      const area = linha.area || "";
      const status = linha.status || "";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${id}</td>
        <td>${data}</td>
        <td>${nome}</td>
        <td>${email}</td>
        <td>${area}</td>
        <td class="status">${status}</td>
        <td>
          <select class="alterarStatus" data-id="${id}">
            <option value="Aberto" ${status === "Aberto" ? "selected" : ""}>Aberto</option>
            <option value="Em andamento" ${status === "Em andamento" ? "selected" : ""}>Em andamento</option>
            <option value="Concluído" ${status === "Concluído" ? "selected" : ""}>Concluído</option>
          </select>
        </td>
      `;
      tabela.appendChild(tr);
    });
  } catch (err) {
    console.error("Erro ao carregar CSV:", err);
    alert("Erro ao carregar chamados.");
  }
}

// ---------------------------
// ALTERAR STATUS
// ---------------------------
document.addEventListener("change", async (e) => {
  if (e.target.classList.contains("alterarStatus")) {
    const id = e.target.dataset.id;
    const status = e.target.value;

    try {
      const resp = await fetch(API_URL, {
        method: "POST",
        body: new URLSearchParams({
          atualizarStatus: "true",
          id: id,
          status: status,
        }),
      });

      const json = await resp.json();

      if (json && json.sucesso) {
        const linha = e.target.closest("tr");
        linha.querySelector(".status").textContent = status;
        mostrarMensagem(`Status do chamado ${id} atualizado para "${status}"`);
      } else {
        alert("Erro ao atualizar status.");
      }
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      alert("Erro ao atualizar status.");
    }
  }
});

// ---------------------------
// RESETAR PAINEL (apenas visual)
// ---------------------------
document.getElementById("resetPainel").addEventListener("click", () => {
  const tabela = document.querySelector("#tabelaChamados tbody");
  tabela.innerHTML = "";
  painelResetado = true;
  mostrarMensagem("Painel resetado!");
});

// ---------------------------
// RECARREGAR PAINEL
// ---------------------------
document.getElementById("recarregarPainel").addEventListener("click", () => {
  painelResetado = false;
  carregarChamados();
  mostrarMensagem("Painel recarregado!");
});

// ---------------------------
// MENSAGEM TEMPORÁRIA
// ---------------------------
function mostrarMensagem(msg) {
  let div = document.getElementById("mensagemPainel");
  if (!div) {
    div = document.createElement("div");
    div.id = "mensagemPainel";
    div.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #c8e6c9;
      color: #2e7d32;
      padding: 12px 18px;
      border-radius: 6px;
      box-shadow: 0 3px 8px rgba(0,0,0,0.2);
      font-weight: bold;
      z-index: 9999;
    `;
    document.body.appendChild(div);
  }

  div.textContent = msg;
  div.style.display = "block";

  setTimeout(() => {
    div.style.display = "none";
  }, 3000);
}

// ---------------------------
// FILTRO EM TEMPO REAL
// ---------------------------
document.getElementById("filtro").addEventListener("input", function () {
  const termo = this.value.toLowerCase();
  const linhas = document.querySelectorAll("#tabelaChamados tbody tr");
  linhas.forEach((tr) => {
    tr.style.display = tr.innerText.toLowerCase().includes(termo) ? "" : "none";
  });
});

// ---------------------------
// CARREGAR CHAMADOS AO ABRIR
// ---------------------------
carregarChamados();
