/**
 * Configurações para integração com SyncPay
 * 
 * Para usar a API real do SyncPay:
 * 1. Cadastre-se em https://syncpay.io/
 * 2. Obtenha sua chave API
 * 3. Substitua 'SUA_API_KEY_AQUI' pela chave real
 * 4. Configure o webhook URL
 * 5. Altere SANDBOX para false para produção
 */

const SYNCPAY_CONFIG = {
    // Configurações da API
    CLIENT_ID: '7e242a99-acfd-44ea-bc30-c0f21b8d7826',
    CLIENT_SECRET: 'f5bfa7dd-9c6a-4773-997b-05b54eb7c343',
    API_KEY: 'f5bfa7dd-9c6a-4773-997b-05b54eb7c343', // Usando client secret como API key
    SANDBOX: true, // true para testes iniciais, mude para false quando confirmar que funciona
    
    // URLs da API (testando diferentes endpoints baseados na documentação)
    SANDBOX_URL: 'https://sandbox.syncpay.io',
    PRODUCTION_URL: 'https://api.syncpay.io',
    ALTERNATIVE_SANDBOX: 'https://api-sandbox.syncpay.pro',
    ALTERNATIVE_PRODUCTION: 'https://api.syncpay.pro',
    
    // Configurações da campanha
    CAMPAIGN: {
        name: 'Ajude Isabela nessa jornada tão difícil',
        id: '4452341',
        description: 'Campanha para ajudar Isabela no tratamento de saúde',
        beneficiary: 'ISABELA CAMPANHA SAUDE',
        minAmount: 20.00
    },
    
    // Configurações de webhook
    WEBHOOK: {
        url: window.location.origin + '/webhook/isabela',
        events: ['payment.approved', 'payment.cancelled', 'payment.refunded']
    },
    
    // Add-ons disponíveis
    ADDONS: [
        {
            id: 'transport',
            name: 'Auxílio transporte',
            value: 10.00,
            icon: '🚗',
            beneficiaryId: 'transport_fund'
        },
        {
            id: 'meal',
            name: 'Auxílio Refeição',
            value: 15.00,
            icon: '🍽️',
            beneficiaryId: 'meal_fund'
        },
        {
            id: 'basket',
            name: 'Doar Cesta Básica',
            value: 85.00,
            icon: '🛒',
            beneficiaryId: 'basket_fund'
        }
    ],
    
    // Configurações PIX
    PIX: {
        expirationDays: 1,
        description: 'Doação para campanha Isabela'
    }
};

/**
 * Função para validar configuração
 */
function validateSyncPayConfig() {
    const errors = [];
    
    if (!SYNCPAY_CONFIG.CLIENT_ID || SYNCPAY_CONFIG.CLIENT_ID === 'SUA_API_KEY_AQUI') {
        errors.push('Client ID do SyncPay não configurado');
    }
    
    if (!SYNCPAY_CONFIG.CLIENT_SECRET || SYNCPAY_CONFIG.CLIENT_SECRET === 'SUA_API_KEY_AQUI') {
        errors.push('Client Secret do SyncPay não configurado');
    }
    
    if (!SYNCPAY_CONFIG.WEBHOOK.url.startsWith('http')) {
        errors.push('URL do webhook inválida');
    }
    
    if (SYNCPAY_CONFIG.CAMPAIGN.minAmount < 1) {
        errors.push('Valor mínimo deve ser maior que R$ 1,00');
    }
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}

/**
 * Função para obter configuração baseada no ambiente
 */
function getSyncPayConfig() {
    const validation = validateSyncPayConfig();
    
    if (!validation.valid && !SYNCPAY_CONFIG.SANDBOX) {
        console.warn('Configuração SyncPay inválida:', validation.errors);
    }
    
    return {
        ...SYNCPAY_CONFIG,
        baseUrl: SYNCPAY_CONFIG.SANDBOX ? SYNCPAY_CONFIG.SANDBOX_URL : SYNCPAY_CONFIG.PRODUCTION_URL,
        validation: validation
    };
}

// Exportar configurações
window.SYNCPAY_CONFIG = SYNCPAY_CONFIG;
window.getSyncPayConfig = getSyncPayConfig;
window.validateSyncPayConfig = validateSyncPayConfig;
