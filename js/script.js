// Controle de variação do login
let contadorVariacao = 0;

// Controle do nome do atendente
document.addEventListener('DOMContentLoaded', () => {
    const nomeSalvo = localStorage.getItem('atendente_nome');
    if (!nomeSalvo) {
        document.getElementById('modalAtendente').style.display = 'flex';
    }

    // Evento para o botão de variação/login duplicado
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

// Evento de submissão do formulário
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    // Reseta o contador de variações sempre que um novo formulário é submetido
    contadorVariacao = 0;

    const nomeInput = document.getElementById('nome').value;
    const siglaCidade = document.getElementById('cidade').value;

    if (!nomeInput.trim() || !siglaCidade) return;

    processarEGerarAcesso(nomeInput, siglaCidade, contadorVariacao);
});

// Função para tratar os padrões de login com base no contador
function processarEGerarAcesso(nomeInput, siglaCidade, modoVariacao) {
    const nomeAtendente = localStorage.getItem('atendente_nome') || 'Não identificado';
    
    const usuario = gerarLogin(nomeInput, siglaCidade, modoVariacao);
    const senha = gerarSenha(usuario);

    document.getElementById('usuarioResult').value = usuario;
    document.getElementById('senhaResult').value = senha;
    document.getElementById('resultContainer').classList.add('active');

    // Envia Log para a API Turso
    salvarLog(nomeAtendente, usuario, senha);
}

// Handler para o clique no botão de variação
function gerarVariacaoLogin() {
    const nomeInput = document.getElementById('nome').value;
    const siglaCidade = document.getElementById('cidade').value;

    if (!nomeInput.trim() || !siglaCidade) return;

    // Incrementa a variação (1, 2, 3...)
    contadorVariacao++;
    processarEGerarAcesso(nomeInput, siglaCidade, contadorVariacao);
}

function removerAcentos(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Função de geração de login adaptada com suporte a variações
function gerarLogin(nomeCompleto, sigla, modo = 0) {
    let limpo = removerAcentos(nomeCompleto)
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .trim();

    let partes = limpo.split(/\s+/);
    let primeiroNome = partes[0];
    let segundoNome = partes.length > 2 ? partes[1] : '';
    let ultimoNome = partes.length > 1 ? partes[partes.length - 1] : '';

    let nomeFormatado = '';

    // Lógica de Variações de Nome:
    switch (modo % 4) {
        case 1:
            // Variação 1: Inverte (sobrenome.nome.cidade) -> ex: agostin.joao.ctb
            nomeFormatado = ultimoNome ? `${ultimoNome}.${primeiroNome}` : `${primeiroNome}1`;
            break;
        case 2:
            // Variação 2: Inclui o segundo nome se existir ou adiciona sufixo '2'
            if (segundoNome) {
                nomeFormatado = `${primeiroNome}.${segundoNome}`;
            } else {
                nomeFormatado = ultimoNome ? `${primeiroNome}.${ultimoNome}2` : `${primeiroNome}2`;
            }
            break;

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
