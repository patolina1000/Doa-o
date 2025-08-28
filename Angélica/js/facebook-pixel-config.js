/**
 * Configurações do Facebook Pixel - Campanha Angélica
 * 
 * Configuração centralizada para todos os eventos do Facebook
 */

const FACEBOOK_PIXEL_CONFIG = {
    // Configurações principais
    PIXEL_ID: '1513482096307953',
    ACCESS_TOKEN: 'EAARGi7UlLlYBPRnu2QY9Sy1KMvImxGLjTwrVNnGzS2OOELuzMicB3e7m1PQZAFTxj4ZAsZAmzrK516jTC9JoZCfNBKsFwuOTlGVt26s906JZBInZAI3uHpSOOyRbDrtv73S7DXyluOZCsagruKgEfLq5SBQ1C4y4eA4gqYvvbThtfA0ALww2cbYs4pz7wfubwZDZD',
    
    // Configurações da campanha
    CAMPAIGN: {
        name: 'Campanha Doação Angélica',
        category: 'Health/Medical/Donation',
        currency: 'BRL'
    },
    
    // IDs de conteúdo para diferentes páginas
    CONTENT_IDS: {
        campaign_page: 'donation_campaign_angelica',
        donation_form: 'donation_form_angelica',
        donation_completed: 'donation_completed_angelica'
    },
    
    // Configurações de debug
    DEBUG: true, // Alterar para false em produção
    
    // URLs para CAPI
    CAPI_URL: `https://graph.facebook.com/v18.0/1513482096307953/events`
};

/**
 * Classe para gerenciar eventos do Facebook Pixel
 */
class FacebookPixelManager {
    constructor() {
        this.pixelId = FACEBOOK_PIXEL_CONFIG.PIXEL_ID;
        this.accessToken = FACEBOOK_PIXEL_CONFIG.ACCESS_TOKEN;
        this.debug = FACEBOOK_PIXEL_CONFIG.DEBUG;
        
        this.log('🎯 FacebookPixelManager inicializado', {
            pixelId: this.pixelId,
            debug: this.debug
        });
    }
    
    /**
     * Log de debug
     */
    log(message, data = null) {
        if (this.debug) {
            console.log(`[Facebook Pixel] ${message}`, data || '');
        }
    }
    
    /**
     * Verificar se fbq está disponível
     */
    isFbqAvailable() {
        return typeof fbq !== 'undefined';
    }
    
    /**
     * Disparar evento PageView
     */
    trackPageView(pageType = 'general') {
        if (!this.isFbqAvailable()) {
            this.log('❌ fbq não disponível para PageView');
            return false;
        }
        
        this.log('📄 Tracking PageView', { pageType });
        fbq('track', 'PageView');
        return true;
    }
    
    /**
     * Disparar evento ViewContent
     */
    trackViewContent(contentType = 'campaign_page', customData = {}) {
        if (!this.isFbqAvailable()) {
            this.log('❌ fbq não disponível para ViewContent');
            return false;
        }
        
        const contentId = FACEBOOK_PIXEL_CONFIG.CONTENT_IDS[contentType] || contentType;
        
        const eventData = {
            content_type: 'product',
            content_ids: [contentId],
            content_name: customData.content_name || FACEBOOK_PIXEL_CONFIG.CAMPAIGN.name,
            content_category: FACEBOOK_PIXEL_CONFIG.CAMPAIGN.category,
            value: customData.value || 0,
            currency: FACEBOOK_PIXEL_CONFIG.CAMPAIGN.currency,
            ...customData
        };
        
        this.log('👁️ Tracking ViewContent', { contentType, eventData });
        fbq('track', 'ViewContent', eventData);
        return true;
    }
    
    /**
     * Disparar evento InitiateCheckout
     */
    trackInitiateCheckout(value = 0, customData = {}) {
        if (!this.isFbqAvailable()) {
            this.log('❌ fbq não disponível para InitiateCheckout');
            return false;
        }
        
        const eventData = {
            content_category: FACEBOOK_PIXEL_CONFIG.CAMPAIGN.category,
            content_name: FACEBOOK_PIXEL_CONFIG.CAMPAIGN.name,
            content_ids: [FACEBOOK_PIXEL_CONFIG.CONTENT_IDS.donation_form],
            value: value,
            currency: FACEBOOK_PIXEL_CONFIG.CAMPAIGN.currency,
            ...customData
        };
        
        this.log('🛒 Tracking InitiateCheckout', { value, eventData });
        fbq('track', 'InitiateCheckout', eventData);
        return true;
    }
    
    /**
     * Disparar evento AddPaymentInfo
     */
    trackAddPaymentInfo(value, customData = {}) {
        if (!this.isFbqAvailable()) {
            this.log('❌ fbq não disponível para AddPaymentInfo');
            return false;
        }
        
        const eventData = {
            content_category: FACEBOOK_PIXEL_CONFIG.CAMPAIGN.category,
            value: value,
            currency: FACEBOOK_PIXEL_CONFIG.CAMPAIGN.currency,
            ...customData
        };
        
        this.log('💳 Tracking AddPaymentInfo', { value, eventData });
        fbq('track', 'AddPaymentInfo', eventData);
        return true;
    }
    
    /**
     * Disparar evento Purchase
     */
    trackPurchase(value, transactionId, customData = {}) {
        if (!this.isFbqAvailable()) {
            this.log('❌ fbq não disponível para Purchase');
            return false;
        }
        
        const eventData = {
            content_name: 'Doação Angélica',
            content_category: FACEBOOK_PIXEL_CONFIG.CAMPAIGN.category,
            content_ids: [FACEBOOK_PIXEL_CONFIG.CONTENT_IDS.donation_completed],
            value: value,
            currency: FACEBOOK_PIXEL_CONFIG.CAMPAIGN.currency,
            transaction_id: transactionId,
            ...customData
        };
        
        this.log('🎉 Tracking Purchase', { value, transactionId, eventData });
        fbq('track', 'Purchase', eventData);
        return true;
    }
    
    /**
     * Disparar evento Donate (específico para doações)
     */
    trackDonate(value, customData = {}) {
        if (!this.isFbqAvailable()) {
            this.log('❌ fbq não disponível para Donate');
            return false;
        }
        
        const eventData = {
            value: value,
            currency: FACEBOOK_PIXEL_CONFIG.CAMPAIGN.currency,
            content_name: FACEBOOK_PIXEL_CONFIG.CAMPAIGN.name,
            content_category: FACEBOOK_PIXEL_CONFIG.CAMPAIGN.category,
            ...customData
        };
        
        this.log('❤️ Tracking Donate', { value, eventData });
        fbq('track', 'Donate', eventData);
        return true;
    }
    
    /**
     * Enviar evento via CAPI (Conversions API)
     */
    async sendToCAPI(eventName, eventData, userData = {}) {
        if (!this.accessToken) {
            this.log('❌ Access Token não configurado para CAPI');
            return false;
        }
        
        try {
            const capiData = {
                data: [{
                    event_name: eventName,
                    event_time: Math.floor(Date.now() / 1000),
                    action_source: 'website',
                    event_source_url: window.location.href,
                    user_data: {
                        client_ip_address: await this.getClientIP(),
                        client_user_agent: navigator.userAgent,
                        ...userData
                    },
                    custom_data: {
                        currency: FACEBOOK_PIXEL_CONFIG.CAMPAIGN.currency,
                        ...eventData
                    }
                }],
                access_token: this.accessToken
            };
            
            this.log('📡 Enviando para CAPI', { eventName, capiData });
            
            const response = await fetch(FACEBOOK_PIXEL_CONFIG.CAPI_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(capiData)
            });
            
            if (response.ok) {
                const result = await response.json();
                this.log('✅ CAPI enviado com sucesso', result);
                return true;
            } else {
                const error = await response.text();
                this.log('❌ Erro no CAPI', { status: response.status, error });
                return false;
            }
        } catch (error) {
            this.log('❌ Erro ao enviar CAPI', { error: error.message });
            return false;
        }
    }
    
    /**
     * Obter IP do cliente (para CAPI)
     */
    async getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            this.log('⚠️ Não foi possível obter IP do cliente', error);
            return null;
        }
    }
    
    /**
     * Hash de dados pessoais (para CAPI)
     */
    async hashData(data) {
        if (!data) return null;
        
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data.toLowerCase().trim());
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
}

// Instância global do gerenciador
window.FacebookPixelManager = FacebookPixelManager;
window.FACEBOOK_PIXEL_CONFIG = FACEBOOK_PIXEL_CONFIG;

// Criar instância global
if (typeof window.fbPixelManager === 'undefined') {
    window.fbPixelManager = new FacebookPixelManager();
}

// Log de inicialização
console.log('🎯 Facebook Pixel Config carregado', {
    pixelId: FACEBOOK_PIXEL_CONFIG.PIXEL_ID,
    debug: FACEBOOK_PIXEL_CONFIG.DEBUG,
    campaign: FACEBOOK_PIXEL_CONFIG.CAMPAIGN.name
});
