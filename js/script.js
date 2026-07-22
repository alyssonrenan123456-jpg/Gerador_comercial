// Controle do nome do atendente
document.addEventListener('DOMContentLoaded', () => {
    const nomeSalvo = localStorage.getItem('atendente_nome');
    if (!nomeSalvo) {
        document.getElementById('modalAtendente').style.display = 'flex';
    }
});

document.getElementById('btnSalvarAtendente').addEventListener('click', () => {
    const input = document.getElementById('nomeAtendenteInput');
    const nome = input.value.trim();
    if (nome) {
        localStorage.setItem('atendente_nome', nome);
        document.getElementById('modalAtendente').style.display = 'none';
    } else {
        alert('Por favor, informe seu nome para continuar.');
    }
});

// Evento de submissão do formulário
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const nomeInput = document.getElementById('nome').value;
    const siglaCidade = document.getElementById('cidade').value;
    const nomeAtendente = localStorage.getItem('atendente_nome') || 'Não identificado';

    if (!nomeInput.trim() || !siglaCidade) return;

    const usuario = gerarLogin(nomeInput, siglaCidade);
    const senha = gerarSenha(usuario);

    document.getElementById('usuarioResult').value = usuario;
    document.getElementById('senhaResult').value = senha;
    document.getElementById('resultContainer').classList.add('active');

    // Envia Log para a API Turso
    try {
        await fetch('/api/logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                atendente: nomeAtendente,
                login_criado: usuario,
                senha_criada: senha
            })
        });
    } catch (err) {
        console.error('Erro ao salvar log:', err);
    }
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
        setTimeout(() => {
            botao.textContent = textoOriginal;
        }, 1500);
    });
}
