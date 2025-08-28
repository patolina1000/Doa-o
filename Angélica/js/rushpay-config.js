/**
 * Configurações para integração com RushPay API
 * 
 * Baseado na documentação oficial fornecida
 * 
 * Para usar a API real do RushPay:
 * 1. Cadastre-se na plataforma
 * 2. Obtenha suas chaves API (Public Key e Secret Key)
 * 3. Configure as chaves abaixo
 * 4. Configure o webhook URL
 * 5. Altere SANDBOX para false para produção
 */

const RUSHPAY_CONFIG = {
    // Configurações da API RushPay conforme documentação
    PUBLIC_KEY: '0178994f-aea3-45d5-a081-c702de978204',
    SECRET_KEY: '3a98c055-3db4-40a4-83be-f844653df074',
    SANDBOX: false, // false para produção real - SEM SIMULAÇÕES
    
    // URLs da API conforme documentação
    SANDBOX_URL: 'https://pay.rushpayoficial.com/api/v1',
    PRODUCTION_URL: 'https://pay.rushpayoficial.com/api/v1',
    
    // Configurações da campanha (mascarada como venda de hot dog)
    CAMPAIGN: {
        name: 'Hot Dog da Angélica - Delivery Especial',
        id: '4452341',
        description: 'Venda de hot dogs especiais para delivery',
        beneficiary: 'ANGELICA FOOD DELIVERY',
        minAmount: 5.00,
        currency: 'BRL'
    },
    
    // Configurações de webhook conforme documentação
    WEBHOOK: {
        url: 'https://angelica-angelica.vercel.app/webhook/angelica',
        events: ['onPixCreated', 'onBuyApproved', 'onChargeback', 'onRefund'] // Eventos conforme documentação
    },
    
    // Add-ons disponíveis (mascarados como complementos de hot dog)
    ADDONS: [
        {
            id: 'transport',
            name: 'Delivery Express',
            value: 10.00,
            icon: '🚗',
            description: 'Entrega rápida em até 30 minutos'
        },
        {
            id: 'meal',
            name: 'Combo Completo',
            value: 15.00,
            icon: '🍽️',
            description: 'Hot dog + batata frita + refrigerante'
        },
        {
            id: 'basket',
            name: 'Kit Família',
            value: 85.00,
            icon: '🛒',
            description: '4 hot dogs + 4 refrigerantes + batata frita grande'
        }
    ],
    
    // Configurações PIX conforme documentação
    PIX: {
        expiresInMinutes: 60, // PIX expira em 1 hora
        description: 'Pagamento Hot Dog Delivery'
    },
    
    // Configurações de timeout
    TIMEOUT: {
        request: 30000, // 30 segundos
        payment_check: 300000 // 5 minutos para verificar pagamento
    },

    // Configurações de métodos de pagamento conforme documentação
    PAYMENT_METHODS: {
        PIX: 'PIX',
        CREDIT_CARD: 'CREDIT_CARD',
        BILLET: 'BILLET'
    },

    // Configurações de status conforme documentação
    TRANSACTION_STATUS: {
        PENDING: 'PENDING',
        APPROVED: 'APPROVED',
        REJECTED: 'REJECTED',
        CANCELLED: 'CANCELLED',
        EXPIRED: 'EXPIRED',
        REFUNDED: 'REFUNDED',
        CHARGEBACK: 'CHARGEBACK'
    }
};

/**
 * Função para validar configuração conforme documentação
 */
function validateRushPayConfig() {
    const errors = [];
    
    if (!RUSHPAY_CONFIG.PUBLIC_KEY || RUSHPAY_CONFIG.PUBLIC_KEY.length < 10) {
        errors.push('Public Key do RushPay não configurada ou inválida');
    }
    
    if (!RUSHPAY_CONFIG.SECRET_KEY || RUSHPAY_CONFIG.SECRET_KEY.length < 10) {
        errors.push('Secret Key do RushPay não configurada ou inválida');
    }
    
    if (!RUSHPAY_CONFIG.WEBHOOK.url.startsWith('http')) {
        errors.push('URL do webhook inválida');
    }
    
    if (RUSHPAY_CONFIG.CAMPAIGN.minAmount < 5) {
        errors.push('Valor mínimo deve ser maior que R$ 5,00 (500 centavos)');
    }
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}

/**
 * Função para obter configuração baseada no ambiente
 */
function getRushPayConfig() {
    const validation = validateRushPayConfig();
    
    if (!validation.valid && !RUSHPAY_CONFIG.SANDBOX) {
        console.warn('⚠️ Configuração RushPay inválida:', validation.errors);
    }
    
    return {
        ...RUSHPAY_CONFIG,
        baseUrl: RUSHPAY_CONFIG.SANDBOX ? RUSHPAY_CONFIG.SANDBOX_URL : RUSHPAY_CONFIG.PRODUCTION_URL,
        validation: validation
    };
}

/**
 * Função para obter headers de autenticação conforme documentação
 */
function getRushPayHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': RUSHPAY_CONFIG.SECRET_KEY // Conforme documentação: Authorization: <secretKey>
    };
}

/**
 * Função para gerar ID único de transação
 */
function generateTransactionId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `angelica_campaign_${timestamp}_${random}`;
}

/**
 * Função para validar dados de cartão conforme documentação
 */
function validateCardData(cardData) {
    const errors = [];
    
    if (!cardData.cardNumber || cardData.cardNumber.length < 13) {
        errors.push('Número do cartão inválido');
    }
    
    if (!cardData.cardCvv || cardData.cardCvv.length < 3) {
        errors.push('CVV inválido');
    }
    
    if (!cardData.cardExpirationMonth || cardData.cardExpirationMonth.length !== 2) {
        errors.push('Mês de expiração inválido (deve ter 2 dígitos)');
    }
    
    if (!cardData.cardExpirationYear || cardData.cardExpirationYear.length !== 2) {
        errors.push('Ano de expiração inválido (deve ter 2 dígitos)');
    }
    
    if (!cardData.holderName || cardData.holderName.length < 3) {
        errors.push('Nome do titular inválido');
    }
    
    if (!cardData.holderDocument || cardData.holderDocument.length !== 11) {
        errors.push('CPF do titular inválido (deve ter 11 dígitos)');
    }
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}

/**
 * Função para validar dados de transação conforme documentação
 */
function validateTransactionData(transactionData) {
    const errors = [];
    
    if (!transactionData.name || transactionData.name.length < 3) {
        errors.push('Nome do cliente é obrigatório');
    }
    
    if (!transactionData.email || !transactionData.email.includes('@')) {
        errors.push('Email do cliente é obrigatório e deve ser válido');
    }
    
    if (!transactionData.cpf || transactionData.cpf.length !== 11) {
        errors.push('CPF do cliente é obrigatório (11 dígitos)');
    }
    
    if (!transactionData.phone || transactionData.phone.length < 8) {
        errors.push('Telefone do cliente é obrigatório');
    }
    
    if (!transactionData.paymentMethod || !Object.values(RUSHPAY_CONFIG.PAYMENT_METHODS).includes(transactionData.paymentMethod)) {
        errors.push('Método de pagamento inválido');
    }
    
    if (!transactionData.amount || transactionData.amount < 5) {
        errors.push('Valor mínimo é R$ 5,00');
    }
    
    if (!transactionData.items || !Array.isArray(transactionData.items) || transactionData.items.length === 0) {
        errors.push('Pelo menos um item é obrigatório');
    }
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}

// Exportar configurações para uso global
window.RUSHPAY_CONFIG = RUSHPAY_CONFIG;
window.getRushPayConfig = getRushPayConfig;
window.validateRushPayConfig = validateRushPayConfig;
window.getRushPayHeaders = getRushPayHeaders;
window.generateTransactionId = generateTransactionId;
window.validateCardData = validateCardData;
window.validateTransactionData = validateTransactionData;

// Log de inicialização
console.log('🚀 RushPay Config carregado', {
    sandbox: RUSHPAY_CONFIG.SANDBOX,
    hasKeys: !!(RUSHPAY_CONFIG.PUBLIC_KEY && RUSHPAY_CONFIG.SECRET_KEY),
    campaign: RUSHPAY_CONFIG.CAMPAIGN.name,
    baseUrl: RUSHPAY_CONFIG.SANDBOX ? RUSHPAY_CONFIG.SANDBOX_URL : RUSHPAY_CONFIG.PRODUCTION_URL
});

// Log detalhado para debug
if (window.debugLog) {
    window.debugLog('🚀 RushPay Config: Carregado', 'info', {
        sandbox: RUSHPAY_CONFIG.SANDBOX,
        hasKeys: !!(RUSHPAY_CONFIG.PUBLIC_KEY && RUSHPAY_CONFIG.SECRET_KEY),
        campaign: RUSHPAY_CONFIG.CAMPAIGN.name,
        sandboxUrl: RUSHPAY_CONFIG.SANDBOX_URL,
        productionUrl: RUSHPAY_CONFIG.PRODUCTION_URL,
        selectedUrl: RUSHPAY_CONFIG.SANDBOX ? RUSHPAY_CONFIG.SANDBOX_URL : RUSHPAY_CONFIG.PRODUCTION_URL
    });
}
