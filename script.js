document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formChamado');
  const mensagemDiv = document.getElementById('mensagem');

  const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycby9AbSpe8BMKYutA2Q3L1OgzghOcd75GxHOskleo9qdiXZ5-4sR0ZDEn7ZnCaYkGaWw/exec";

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const motivo = document.getElementById('motivo').value.trim();
    const area = document.getElementById('area').value;

    if (!nome || !email || !motivo || !area) {
      alert("Preencha todos os campos.");
      return;
    }

    // Envia para o Google Sheets
    const formData = new FormData();
    formData.append("nome", nome);
    formData.append("email", email);
    formData.append("motivo", motivo);
    formData.append("area", area);

    await fetch(GOOGLE_SHEETS_URL, {
      method: "POST",
      body: formData
    });

    // Envio de e-mail para o responsável correto
    let responsavelEmail = "";

    if (area === "TI_AGUA_SUL") {
      responsavelEmail = "auxinformatica@vitaengenharia.com.br";
    }

    if (area === "TI_BARRA_FUNDA") {
      responsavelEmail = "ti@vitaengenharia.com.br";
    }

    if (responsavelEmail !== "") {
      emailjs.send("service_vita", "template_4e1dwk8", {
        nome,
        email,
        motivo,
        area,
        responsavel: responsavelEmail
      });
    }

    mensagemDiv.textContent = "Chamado enviado com sucesso!";
    mensagemDiv.classList.remove('hidden');

    form.reset();
  });
});
