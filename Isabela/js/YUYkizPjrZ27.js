const swiper = new Swiper('.galeria', {
    direction: 'horizontal',
    loop: true,

    pagination: {
        el: '.galeria-pagination',
    },
    autoplay: {
        delay: 8000,
    },
});
const meta =80000;
let arrecadado = 17503.00;
let apoiadores = 992;
let coracoes = 278;

const arrayDados = [
    { nome: "Doador anônimo", image: "images/W6zmSrNEZwLq.png", apoiador: 1, doado: 40, coracoes: 1 },
    { nome: "Juliana Aparecida", image: "images/W6zmSrNEZwLq.png", apoiador: 1, doado: 30, coracoes: 0 },
    { nome: "Doador anônimo", image: "images/W6zmSrNEZwLq.png", apoiador: 1, doado: 100, coracoes: 1 },
    { nome: "Doador anônimo", image: "images/W6zmSrNEZwLq.png", apoiador: 1, doado: 113.20, coracoes: 0 },
    { nome: "Lucas Fernandes", image: "images/W6zmSrNEZwLq.png", apoiador: 1, doado: 150, coracoes: 1 },
    { nome: "Doador anônimo", image: "images/W6zmSrNEZwLq.png", apoiador: 1, doado: 100, coracoes: 1 },
    { nome: "Fernanda Oliveira", image: "images/W6zmSrNEZwLq.png", apoiador: 1, doado: 200, coracoes: 0 },
    { nome: "Doador anônimo", image: "images/W6zmSrNEZwLq.png", apoiador: 1, doado: 50, coracoes: 1 },
    { nome: "João Castro", image: "images/W6zmSrNEZwLq.png", apoiador: 1, doado: 40, coracoes: 0 },
    { nome: "Doador anônimo", image: "images/W6zmSrNEZwLq.png", apoiador: 1, doado: 100, coracoes: 1 },
    { nome: "Marcela de Moraes", image: "images/W6zmSrNEZwLq.png", apoiador: 1, doado: 50, coracoes: 0 },
    { nome: "Doador anônimo", image: "images/W6zmSrNEZwLq.png", apoiador: 1, doado: 150, coracoes: 1 },
    { nome: "Doador anônimo", image: "images/W6zmSrNEZwLq.png", apoiador: 1, doado: 250, coracoes: 0 },
    { nome: "Marcelo Rodrigues", image: "images/W6zmSrNEZwLq.png", apoiador: 1, doado: 150, coracoes: 1 },
    { nome: "Taís Costa", image: "images/W6zmSrNEZwLq.png", apoiador: 1, doado: 150, coracoes: 1 },
    { nome: "Doador anônimo", image: "images/W6zmSrNEZwLq.png", apoiador: 1, doado: 100, coracoes: 0 },
    { nome: "Doador anônimo", image: "images/W6zmSrNEZwLq.png", apoiador: 1, doado: 40, coracoes: 1 },
    { nome: "Manoel Caetano Santos", image: "images/W6zmSrNEZwLq.png", apoiador: 1, doado: 30, coracoes: 0 }
];

let index = 0;

function atualizarValores() {
    if (index >= arrayDados.length) return;
    
    let item = arrayDados[index];
    apoiadores += item.apoiador;
    coracoes += item.coracoes;
    animarValor("apoiadores", apoiadores);
    animarValor("coracoes", coracoes);

    let novoValor = arrecadado + item.doado;
    animarValor("doado", novoValor, arrecadado);
    arrecadado = novoValor;
    
    exibirNotificacao(item.nome, item.image, item.doado);
    atualizarBarra();
    index++;
}

function atualizarBarra() {
    let porcentagem = (arrecadado / meta) * 100;
    let porcento = Math.round(porcentagem );
    document.getElementById("barra").style.width = porcentagem + "%";
    document.getElementById("barraMobile").style.width = porcentagem + "%";
    document.getElementById("porcentagem").innerHTML = porcento + "%";
}

function formatarMoeda(valor) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
}

function animarValor(id, novoValor, valorAntigo = 0) {
    let elementos = document.querySelectorAll(`#${id}, #valorMobile`);
    let inicio = valorAntigo || parseFloat(elementos[0].innerText.replace(/[^0-9.,]/g, "")) || 0;
    let incremento = (novoValor - inicio) / 50;
    let atual = inicio;
    let contador = 0;
    
    let animacao = setInterval(() => {
        atual += incremento;
        elementos.forEach(elemento => {
            elemento.innerText = id === "doado" ? formatarMoeda(atual) : atual.toFixed(0);
        });

        contador++;
        if (contador >= 50) {
            clearInterval(animacao);
            elementos.forEach(elemento => {
                elemento.innerText = id === "doado" ? formatarMoeda(novoValor) : novoValor;
            });
        }
    }, 20);
}

function exibirNotificacao(nome, image, valor) {
    let notificacao = document.createElement("div");
    notificacao.className = "notificacao";
    notificacao.innerHTML = `<div class="avatar"><img src="${image}" alt="${nome}"></div><div class="content"><h4>${nome}</h4> Acabou de doar <strong>${formatarMoeda(valor)}</strong>.</div>`;
    
    document.body.appendChild(notificacao);

    setTimeout(() => {
        let rect = notificacao.getBoundingClientRect();

        confetti({
            particleCount: 100,
            spread: 70,
            origin: {
                x: (rect.left + rect.width / 2) / window.innerWidth,
                y: (rect.top + rect.height / 2) / window.innerHeight
            }
        });
    }, 100);
    
    setTimeout(() => {
        notificacao.style.transform = "translatey(0)";
        notificacao.style.opacity = "0";
        setTimeout(() => notificacao.remove(), 500);
    }, 6000);
}

setInterval(atualizarValores, 30000);

document.addEventListener("DOMContentLoaded", () => {
    atualizarBarra();
});

document.addEventListener("DOMContentLoaded", () => {
    let script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js";
    document.head.appendChild(script);
});

function getTrackingParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        src: params.get('src'),
        sck: params.get('sck'),
        utm_source: params.get('utm_source'),
        utm_campaign: params.get('utm_campaign'),
        utm_medium: params.get('utm_medium'),
        utm_content: params.get('utm_content'),
        utm_term: params.get('utm_term')
    };
}

function serializeParams(params) {
    const urlParams = new URLSearchParams();
    
    // Adiciona todos os parâmetros, mesmo os nulos
    Object.entries(params).forEach(([key, value]) => {
        urlParams.append(key, value !== null ? value : null);
    });
    
    return urlParams.toString();
}

jQuery(function($){
    $(document).ready(function() {
        $('a[href^="#"]').on('click', function(e) {
          e.preventDefault();
          var id = $(this).attr('href'),
              targetOffset = $(id).offset().top;
                  
          $('html, body').animate({ 
              scrollTop: targetOffset - 60
          }, 1000);
        });

        $('.menu-mobile, .close-menu').click(function(){
            $('.nav-mobile').toggleClass('active');
        })
    });

    $('.btn-ajudar').click(function(){
        // Tracking Facebook Pixel - InitiateCheckout
        if (typeof window.fbPixelManager !== 'undefined') {
            window.fbPixelManager.trackInitiateCheckout(0, {
                content_name: 'Campanha Doação Angélica',
                source: 'btn-ajudar-click'
            });
            console.log('🎯 Facebook Pixel: InitiateCheckout disparado');
        } else if (typeof fbq !== 'undefined') {
            // Fallback direto se o manager não estiver disponível
            fbq('track', 'InitiateCheckout', {
                content_category: 'Health/Medical/Donation',
                content_name: 'Campanha Doação Angélica',
                content_ids: ['donation_form_angelica'],
                value: 0,
                currency: 'BRL'
            });
            console.log('🎯 Facebook Pixel: InitiateCheckout disparado (fallback)');
        }
        
        // Redirecionar para nossa página personalizada
        window.location.href = 'obrigado.html';    
    }); 
    // $('.fora-modal, .close-modal').click(function(){
    //     $('.modal-doar').toggleClass('open');
    // });
});

  