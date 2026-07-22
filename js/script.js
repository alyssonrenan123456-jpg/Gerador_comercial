document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const nomeInput = document.getElementById('nome').value;
    const siglaCidade = document.getElementById('cidade').value;

    if (!nomeInput.trim() || !siglaCidade) return;

    const usuario = gerarLogin(nomeInput, siglaCidade);
    const senha = gerarSenha(usuario);

    document.getElementById('usuarioResult').value = usuario;
    document.getElementById('senhaResult').value = senha;

    document.getElementById('resultContainer').classList.add('active');
});

function removerAcentos(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function gerarLogin(nomeCompleto, sigla) {
    let limpo = removerAcentos(nomeCompleto)
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove caracteres especiais
        .trim()
        .replace(/\s+/g, '.'); // Substitui espaços por ponto

    return `${limpo}.${sigla}`;
}

function gerarSenha(usuario) {
    const partes = usuario.split('.');
    const anoAtual = new Date().getFullYear();

    let primeiraLetra = partes[0] ? partes[0].charAt(0) : '';
    let segundaLetra = partes[1] ? partes[1].charAt(0) : '';

    return `${primeiraLetra}${segundaLetra}${anoAtual}`;
}

function copiarTexto(elementId, botao) {
    const inputElement = document.getElementById(elementId);
    
    inputElement.select();
    inputElement.setSelectionRange(0, 99999); // Para dispositivos móveis

    navigator.clipboard.writeText(inputElement.value).then(() => {
        const textoOriginal = botao.textContent;
        botao.textContent = "Copiado!";
        botao.classList.add('copied');

        setTimeout(() => {
            botao.textContent = textoOriginal;
            botao.classList.remove('copied');
        }, 1500);
    });
}
