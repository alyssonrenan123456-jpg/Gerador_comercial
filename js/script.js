document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const nomeInput = document.getElementById('nome').value;
    const siglaCidade = document.getElementById('cidade').value;

    if (!nomeInput.trim() || !siglaCidade) return;

    const usuario = gerarLogin(nomeInput, siglaCidade);
    const senha = gerarSenha(usuario);

    document.getElementById('usuarioResult').value = usuario;
    document.getElementById('senhaResult').value = senha;

    // Exibe o painel de resultado com animação
    document.getElementById('resultContainer').classList.add('active');
});

function removerAcentos(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function gerarLogin(nomeCompleto, sigla) {
    let limpo = removerAcentos(nomeCompleto)
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .trim();

    let partes = limpo.split(/\s+/);
    let primeiroNome = partes[0];
    let ultimoNome = partes.length > 1 ? partes[partes.length - 1] : '';

    let nomeFormatado = ultimoNome ? `${primeiroNome}.${ultimoNome}` : primeiroNome;
    return `${nomeFormatado}.${sigla}`;
}

function gerarSenha(usuario) {
    const partes = usuario.split('.');
    const anoAtual = new Date().getFullYear();
    
    let primeiraLetra = partes[0] ? partes[0].charAt(0) : 'u';
    let segundaLetra = partes[1] ? partes[1].charAt(0) : 't';

    return `${primeiraLetra}${segundaLetra}${anoAtual}`;
}

function copiarTexto(elementId, botao) {
    const inputElement = document.getElementById(elementId);
    inputElement.select();
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
