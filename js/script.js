let contadorVariacao = 0;

document.addEventListener('DOMContentLoaded', () => {
    const nomeSalvo = localStorage.getItem('atendente_nome');
    if (!nomeSalvo) {
        document.getElementById('modalAtendente').style.display = 'flex';
    }

    const btnVariacao = document.getElementById('btnVariacaoLogin');
    if (btnVariacao) {
        btnVariacao.addEventListener('click', gerarVariacaoLogin);
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

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    contadorVariacao = 0;

    const nomeInput = document.getElementById('nome').value;
    const siglaCidade = document.getElementById('cidade').value;

    if (!nomeInput.trim() || !siglaCidade) return;

    processarEGerarAcesso(nomeInput, siglaCidade, contadorVariacao);
});

function processarEGerarAcesso(nomeInput, siglaCidade, modoVariacao) {
    const nomeAtendente = localStorage.getItem('atendente_nome') || 'Não identificado';
    
    const usuario = gerarLogin(nomeInput, siglaCidade, modoVariacao);
    const senha = gerarSenha(usuario);

    document.getElementById('usuarioResult').value = usuario;
    document.getElementById('senhaResult').value = senha;
    document.getElementById('resultContainer').classList.add('active');

    salvarLog(nomeAtendente, usuario, senha);
}

function gerarVariacaoLogin() {
    const nomeInput = document.getElementById('nome').value;
    const siglaCidade = document.getElementById('cidade').value;

    if (!nomeInput.trim() || !siglaCidade) return;

    contadorVariacao = contadorVariacao === 0 ? 1 : 0;
    processarEGerarAcesso(nomeInput, siglaCidade, contadorVariacao);
}

function removerAcentos(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function gerarLogin(nomeCompleto, sigla, modo = 0) {
    let limpo = removerAcentos(nomeCompleto)
        .toLowerCase()
        .replace(/[^a-z\s]/g, '')
        .trim();

    let partes = limpo.split(/\s+/).filter(Boolean);
    let primeiroNome = partes[0] || 'usuario';
    let ultimoNome = partes.length > 1 ? partes[partes.length - 1] : '';

    let nomeFormatado = '';

    if (modo % 2 === 1 && ultimoNome) {
        nomeFormatado = `${ultimoNome}.${primeiroNome}`;
    } else {
        nomeFormatado = ultimoNome ? `${primeiroNome}.${ultimoNome}` : primeiroNome;
    }

    return `${nomeFormatado}.${sigla}`;
}

function gerarSenha(usuario) {
    const partes = usuario.split('.');
    const anoAtual = new Date().getFullYear();
    
    let primeiraLetra = partes[0] ? partes[0].charAt(0) : 'u';
    let segundaLetra = partes[1] ? partes[1].charAt(0) : 't';

    return `${primeiraLetra}${segundaLetra}${anoAtual}`;
}

async function salvarLog(atendente, usuario, senha) {
    try {
        await fetch('/api/logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                atendente: atendente,
                login_criado: usuario,
                senha_criada: senha
            })
        });
    } catch (err) {
        console.error('Erro ao salvar log:', err);
    }
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
