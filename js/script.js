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
    // 1. Limpa acentos e caracteres especiais
    let limpo = removerAcentos(nomeCompleto)
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .trim();

    // 2. Separa por espaços
    let partes = limpo.split(/\s+/);

    // 3. Pega primeiro e último nome
    let primeiroNome = partes[0];
    let ultimoNome = partes.length > 1 ? partes[partes.length - 1] : '';

    // 4. Formata como primeiro.ultimo (ou só primeiro caso só tenha 1)
    let nomeFormatado = ultimoNome ? `${primeiroNome}.${ultimoNome}` : primeiroNome;

    return `${nomeFormatado}.${sigla}`;
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
