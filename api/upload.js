export const config = {
  api: {
    bodyParser: {
      sizeLimit: "4mb",
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      status: "erro",
      mensagem: "Método não permitido.",
    });
  }

  try {
    const url = process.env.APPS_SCRIPT_URL;

    if (!url) {
      throw new Error("APPS_SCRIPT_URL não configurada.");
    }

    const resposta = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(req.body),
      redirect: "follow",
    });

    const texto = await resposta.text();

    let resultado;
    try {
      resultado = JSON.parse(texto);
    } catch {
      throw new Error(
        "O Google retornou uma resposta que não é JSON."
      );
    }

    if (!resposta.ok || resultado.status !== "sucesso") {
      return res.status(502).json({
        status: "erro",
        mensagem:
          resultado.mensagem || "Falha no processamento pelo Google.",
      });
    }

    return res.status(200).json(resultado);
  } catch (erro) {
    console.error("Erro no upload:", erro);

    return res.status(502).json({
      status: "erro",
      mensagem: "Não foi possível confirmar o envio dos arquivos.",
    });
  }
}
