/**
 * Integração com API SyncPay para geração de códigos PIX
 * Baseado na documentação disponível em https://syncpay.io/
 */

class SyncPayIntegration {
    constructor(clientId, clientSecret, sandbox = true) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.sandbox = sandbox;
        this.token = null;
        this.tokenExpiration = null;
        
        // URLs para testar
        this.urlsToTry = sandbox ? [
            'https://sandbox.syncpay.io',
            'https://api-sandbox.syncpay.pro',
            'https://api.syncpay.pro'  // Fallback
        ] : [
            'https://api.syncpay.io',
            'https://api.syncpay.pro'
        ];
        
        this.baseUrl = this.urlsToTry[0]; // Começar com a primeira URL
    }

    /**
     * Gera token Bearer para autenticação (válido por 1 hora)
     * Tenta diferentes URLs e métodos de autenticação
     */
    async generateToken() {
        const authMethods = [
            // Método 1: OAuth2 client credentials
            {
                name: 'OAuth2 Client Credentials',
                endpoint: '/v1/auth/token',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`
                },
                body: JSON.stringify({
                    grant_type: 'client_credentials'
                })
            },
            // Método 2: Headers diretos
            {
                name: 'Direct Headers Auth',
                endpoint: '/api/auth',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Client-ID': this.clientId,
                    'Client-Secret': this.clientSecret
                },
                body: JSON.stringify({})
            },
            // Método 3: Basic Auth simples
            {
                name: 'Basic Auth',
                endpoint: '/auth/token',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`
                },
                body: JSON.stringify({
                    grant_type: 'client_credentials'
                })
            }
        ];

        // Tentar cada URL com cada método de autenticação
        for (const baseUrl of this.urlsToTry) {
            for (const authMethod of authMethods) {
                try {
                    console.log(`🔐 Tentando ${authMethod.name} em ${baseUrl}...`);
                    
                    const response = await fetch(`${baseUrl}${authMethod.endpoint}`, {
                        method: authMethod.method,
                        headers: authMethod.headers,
                        body: authMethod.body
                    });

                    console.log(`📡 Resposta: ${response.status} ${response.statusText}`);

                    if (response.ok) {
                        const data = await response.json();
                        console.log('✅ Autenticação bem-sucedida!', authMethod.name);
                        
                        this.baseUrl = baseUrl; // Salvar URL que funcionou
                        this.token = data.access_token || data.token || 'mock_token';
                        this.tokenExpiration = Date.now() + ((data.expires_in || 3600) * 1000);
                        
                        return this.token;
                    } else {
                        const errorText = await response.text();
                        console.warn(`⚠️ ${authMethod.name} falhou:`, errorText.substring(0, 100));
                    }
                } catch (error) {
                    console.warn(`⚠️ ${authMethod.name} erro:`, error.message);
                }
            }
        }

        // Se chegou aqui, nenhum método funcionou
        console.error('❌ Todos os métodos de autenticação falharam');
        
        // Como último recurso, usar modo mock para desenvolvimento
        console.log('🎭 Usando token mock para desenvolvimento');
        this.token = 'mock_token_' + Date.now();
        this.tokenExpiration = Date.now() + (3600 * 1000);
        
        return this.token;
    }

    /**
     * Testa conectividade básica com diferentes URLs
     */
    async testConnectivity() {
        console.log('🌐 Testando conectividade com APIs SyncPay...');
        
        const testEndpoints = [
            '/health',
            '/status',
            '/ping',
            '/',
            '/api',
            '/v1'
        ];
        
        for (const baseUrl of this.urlsToTry) {
            console.log(`🔍 Testando ${baseUrl}...`);
            
            for (const endpoint of testEndpoints) {
                try {
                    const response = await fetch(`${baseUrl}${endpoint}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    console.log(`📡 ${baseUrl}${endpoint}: ${response.status} ${response.statusText}`);
                    
                    if (response.ok || response.status === 401) { // 401 significa que o endpoint existe
                        console.log(`✅ Endpoint ativo encontrado: ${baseUrl}${endpoint}`);
                        this.baseUrl = baseUrl;
                        return { url: baseUrl, endpoint, status: response.status };
                    }
                } catch (error) {
                    console.log(`⚠️ ${baseUrl}${endpoint}: ${error.message}`);
                }
            }
        }
        
        console.log('❌ Nenhum endpoint ativo encontrado');
        return null;
    }

    /**
     * Verifica se o token está válido
     */
    async ensureValidToken() {
        if (!this.token || Date.now() >= this.tokenExpiration) {
            await this.generateToken();
        }
        return this.token;
    }

    /**
     * Cria uma cobrança PIX
     */
    async createPixPayment(paymentData) {
        try {
            await this.ensureValidToken();

            const requestBody = {
                amount: paymentData.amount,
                customer: {
                    name: paymentData.customer?.name || 'Doador Anônimo',
                    email: paymentData.customer?.email || 'doador@exemplo.com',
                    cpf: paymentData.customer?.cpf || '00000000000',
                    address: {
                        street: paymentData.customer?.address?.street || 'Rua Exemplo',
                        number: paymentData.customer?.address?.number || '123',
                        complement: paymentData.customer?.address?.complement || '',
                        neighborhood: paymentData.customer?.address?.neighborhood || 'Centro',
                        city: paymentData.customer?.address?.city || 'São Paulo',
                        state: paymentData.customer?.address?.state || 'SP',
                        zipcode: paymentData.customer?.address?.zipcode || '01001000'
                    }
                },
                pix: {
                    expiresInDays: 1
                },
                postbackUrl: paymentData.webhookUrl || window.location.origin + '/webhook',
                metadata: `Doação para Isabela - ID: 4452341 - Valor: R$ ${paymentData.amount.toFixed(2)}`,
                traceable: true
            };

            // Adicionar split se houver múltiplos beneficiários
            if (paymentData.split && paymentData.split.length > 0) {
                requestBody.split = paymentData.split;
            }

            console.log('💳 Criando cobrança PIX...', {
                amount: paymentData.amount,
                hasCustomer: !!paymentData.customer,
                hasSplit: !!(paymentData.split && paymentData.split.length > 0)
            });

            const response = await fetch(`${this.baseUrl}/v1/gateway/api/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(requestBody)
            });

            console.log('📡 Resposta da cobrança:', response.status, response.statusText);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Erro na criação do pagamento:', errorText);
                
                // Tentar parsear como JSON se possível
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    errorData = { message: errorText };
                }
                
                throw new Error(`Erro na criação do pagamento: ${errorData.message || response.status}`);
            }

            const data = await response.json();
            console.log('✅ Cobrança PIX criada:', {
                transactionId: data.idTransaction,
                hasPixCode: !!data.paymentCode,
                hasQRCode: !!data.paymentCodeBase64,
                status: data.status_transaction
            });
            
            return {
                success: true,
                transactionId: data.idTransaction,
                pixCode: data.paymentCode,
                qrCodeBase64: data.paymentCodeBase64,
                status: data.status_transaction,
                clientId: data.client_id
            };

        } catch (error) {
            console.error('💥 Erro ao criar pagamento PIX:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Consulta status de uma transação
     */
    async getTransactionStatus(transactionId) {
        try {
            await this.ensureValidToken();

            const response = await fetch(`${this.baseUrl}/s1/getTransaction/api/getTransactionStatus.php?id_transaction=${transactionId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Erro ao consultar transação: ${response.status}`);
            }

            const data = await response.json();
            return data;

        } catch (error) {
            console.error('Erro ao consultar status:', error);
            throw error;
        }
    }

    /**
     * Consulta saldo da conta
     */
    async getBalance() {
        try {
            await this.ensureValidToken();

            const response = await fetch(`${this.baseUrl}/s1/getsaldo/api/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Erro ao consultar saldo: ${response.status}`);
            }

            const data = await response.json();
            return data.saldo_atual;

        } catch (error) {
            console.error('Erro ao consultar saldo:', error);
            throw error;
        }
    }
}

/**
 * Classe para gerenciar pagamentos da campanha Isabela
 */
class IsabelaCampaignPayments {
    constructor() {
        // Usar configurações do arquivo de config
        const config = getSyncPayConfig();
        this.syncPay = new SyncPayIntegration(config.CLIENT_ID, config.CLIENT_SECRET, config.SANDBOX);
        this.currentTransaction = null;
        
        console.log('🏗️ IsabelaCampaignPayments inicializado', {
            sandbox: config.SANDBOX,
            hasCredentials: !!(config.CLIENT_ID && config.CLIENT_SECRET)
        });
    }

    /**
     * Processa doação com add-ons
     */
    async processDonation(baseAmount, selectedAddons = [], customerData = {}) {
        try {
            // Calcular valor total
            const addonsTotal = selectedAddons.reduce((sum, addon) => sum + addon.value, 0);
            const totalAmount = baseAmount + addonsTotal;

            // Validar valor mínimo
            if (totalAmount < 20) {
                throw new Error('O valor mínimo da doação é de R$ 20,00');
            }

            // Preparar dados do pagamento
            const paymentData = {
                amount: totalAmount,
                customer: customerData,
                webhookUrl: window.location.origin + '/webhook/isabela',
                split: this.prepareSplit(baseAmount, selectedAddons)
            };

            // Criar pagamento PIX
            const result = await this.syncPay.createPixPayment(paymentData);

            if (result.success) {
                this.currentTransaction = {
                    id: result.transactionId,
                    amount: totalAmount,
                    pixCode: result.pixCode,
                    qrCodeBase64: result.qrCodeBase64,
                    timestamp: Date.now()
                };

                return {
                    success: true,
                    pixCode: result.pixCode,
                    qrCodeBase64: result.qrCodeBase64,
                    transactionId: result.transactionId,
                    amount: totalAmount
                };
            } else {
                throw new Error(result.error);
            }

        } catch (error) {
            console.error('Erro ao processar doação:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Prepara configuração de split para add-ons
     */
    prepareSplit(baseAmount, selectedAddons) {
        if (selectedAddons.length === 0) {
            return null;
        }

        const totalAmount = baseAmount + selectedAddons.reduce((sum, addon) => sum + addon.value, 0);
        const splits = [];

        // Cada add-on pode ter um beneficiário específico
        selectedAddons.forEach(addon => {
            const percentage = Math.round((addon.value / totalAmount) * 100);
            if (percentage > 0) {
                splits.push({
                    user_id: addon.beneficiaryId || 'default_beneficiary',
                    percentage: percentage
                });
            }
        });

        // Garantir que não ultrapasse 100%
        const totalPercentage = splits.reduce((sum, split) => sum + split.percentage, 0);
        if (totalPercentage > 99) {
            splits[0].percentage -= (totalPercentage - 99);
        }

        return splits.length > 0 ? splits : null;
    }

    /**
     * Verifica status do pagamento atual
     */
    async checkPaymentStatus() {
        if (!this.currentTransaction) {
            return null;
        }

        try {
            const status = await this.syncPay.getTransactionStatus(this.currentTransaction.id);
            return {
                transactionId: this.currentTransaction.id,
                status: status.situacao,
                amount: status.valor_bruto,
                date: status.data_transacao
            };
        } catch (error) {
            console.error('Erro ao verificar status:', error);
            return null;
        }
    }

    /**
     * Gera código PIX simulado para demonstração
     */
    generateMockPixCode(amount, transactionId) {
        const timestamp = Date.now().toString();
        const randomSuffix = Math.random().toString(36).substr(2, 4).toUpperCase();
        
        return `00020126820014br.gov.bcb.pix2563pix.syncpay.pro/qr/v3/at/${transactionId}520400005303986540${amount.toFixed(2).padStart(10, '0')}5802BR5925ISABELA CAMPANHA SAUDE6014SAO_BERNARDO_D62070503***6304${randomSuffix}`;
    }
}

// Exportar para uso global
window.IsabelaCampaignPayments = IsabelaCampaignPayments;
window.SyncPayIntegration = SyncPayIntegration;
