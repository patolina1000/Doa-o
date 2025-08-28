/**
 * Integração com API RushPay para geração de códigos PIX
 * Baseado na documentação oficial fornecida
 */

/**
 * Funções para gerar dados aleatórios
 */

// Gerar CPF aleatório válido
function generateRandomCPF() {
    // Gerar 9 dígitos aleatórios
    let cpf = '';
    for (let i = 0; i < 9; i++) {
        cpf += Math.floor(Math.random() * 10);
    }
    
    // Calcular primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf[i]) * (10 - i);
    }
    let digit1 = 11 - (sum % 11);
    if (digit1 >= 10) digit1 = 0;
    cpf += digit1;
    
    // Calcular segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf[i]) * (11 - i);
    }
    let digit2 = 11 - (sum % 11);
    if (digit2 >= 10) digit2 = 0;
    cpf += digit2;
    
    return cpf;
}

// Gerar email aleatório
function generateRandomEmail() {
    const domains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'icloud.com'];
    const names = ['joao', 'maria', 'pedro', 'ana', 'carlos', 'julia', 'lucas', 'sofia', 'gabriel', 'isabella'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomNumber = Math.floor(Math.random() * 9999);
    const randomDomain = domains[Math.floor(Math.random() * domains.length)];
    
    return `${randomName}${randomNumber}@${randomDomain}`;
}

// Gerar telefone aleatório brasileiro
function generateRandomPhone() {
    const ddd = Math.floor(Math.random() * 90) + 11; // DDD entre 11 e 99
    const prefix = Math.floor(Math.random() * 9000) + 1000; // 4 dígitos
    const suffix = Math.floor(Math.random() * 9000) + 1000; // 4 dígitos
    
    return `55${ddd}${prefix}${suffix}`; // Formato: 55 + DDD + 4 dígitos + 4 dígitos
}

class RushPayIntegration {
    constructor(publicKey, secretKey, sandbox = true) {
        this.publicKey = publicKey;
        this.secretKey = secretKey;
        this.sandbox = sandbox;
        // URL base conforme documentação
        this.baseUrl = 'https://pay.rushpayoficial.com/api/v1';
        
        console.log('🏗️ RushPayIntegration inicializada', {
            sandbox: this.sandbox,
            baseUrl: this.baseUrl,
            hasKeys: !!(publicKey && secretKey)
        });
        
        // Log detalhado para debug
        if (window.debugLog) {
            window.debugLog('🏗️ RushPayIntegration: Inicializada', 'info', {
                sandbox: this.sandbox,
                baseUrl: this.baseUrl,
                hasKeys: !!(publicKey && secretKey),
                url: this.baseUrl
            });
        }
    }

    /**
     * Obtém headers padrão para requisições conforme documentação
     */
    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': this.secretKey // Conforme documentação: Authorization: <secretKey>
        };
    }

    /**
     * Testa conectividade com a API RushPay
     */
    async testConnectivity() {
        console.log('🌐 Testando conectividade com RushPay API...');
        
        try {
            // Testar com endpoint de consulta conforme documentação
            const response = await fetch(`${this.baseUrl}/transaction.getPayment?id=test`, {
                method: 'GET',
                headers: this.getHeaders(),
                mode: 'cors',
                timeout: 15000
            });
            
            console.log(`📡 RushPay API: ${response.status} ${response.statusText}`);
            
            if (response.status === 401 || response.status === 403 || response.status === 404 || response.ok) {
                console.log('✅ Conectividade RushPay OK - API acessível');
                return true;
            } else if (response.status === 400 || response.status === 500) {
                console.warn('⚠️ API acessível mas credenciais podem ser inválidas - usando modo demo');
                return 'demo_mode';
            }
            
            console.warn('⚠️ API RushPay não acessível - usando modo demonstração');
            return 'demo_mode';
            
        } catch (error) {
            console.error('❌ Erro de conectividade RushPay:', error.message);
            console.log('🔄 Ativando modo demonstração...');
            return 'demo_mode';
        }
    }

    /**
     * Cria token de cartão conforme documentação
     * Endpoint: POST /transaction.createCardToken
     */
    async createCardToken(cardData) {
        try {
            console.log('💳 Criando token de cartão...');

            const requestBody = {
                cardNumber: cardData.cardNumber,
                cardCvv: cardData.cardCvv,
                cardExpirationMonth: cardData.cardExpirationMonth,
                cardExpirationYear: cardData.cardExpirationYear,
                holderName: cardData.holderName,
                holderDocument: cardData.holderDocument
            };

            const response = await fetch(`${this.baseUrl}/transaction.createCardToken`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(requestBody),
                mode: 'cors',
                timeout: RUSHPAY_CONFIG.TIMEOUT.request
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro ao criar token: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            console.log('✅ Token de cartão criado:', data.token);
            
            return {
                success: true,
                token: data.token
            };

        } catch (error) {
            console.error('❌ Erro ao criar token de cartão:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Cria uma transação de compra conforme documentação
     * Endpoint: POST /transaction.purchase
     */
    async createTransaction(transactionData) {
        try {
            console.log('💳 Criando transação de compra...', {
                paymentMethod: transactionData.paymentMethod,
                amount: transactionData.amount
            });
            
            // Log da URL que está sendo usada
            console.log('🔍 DEBUG: URL base da API:', this.baseUrl);
            console.log('🔍 DEBUG: URL completa:', `${this.baseUrl}/transaction.purchase`);
            
            // Log detalhado para debug
            if (window.debugLog) {
                window.debugLog('🔄 RushPay: Iniciando criação de transação', 'info', {
                    paymentMethod: transactionData.paymentMethod,
                    amount: transactionData.amount,
                    customerName: transactionData.name,
                    customerEmail: transactionData.email,
                    itemsCount: transactionData.items?.length || 0
                });
            }

            // Estrutura conforme documentação
            const requestBody = {
                name: transactionData.name,
                email: transactionData.email,
                cpf: transactionData.cpf,
                phone: transactionData.phone,
                paymentMethod: transactionData.paymentMethod,
                amount: transactionData.amount, // já convertido para centavos na função processDonation
                traceable: true,
                items: transactionData.items || [
                    {
                        unitPrice: transactionData.amount, // já convertido para centavos na função processDonation
                        title: transactionData.description || 'Hot Dog Delivery - Pedido Especial',
                        quantity: 1,
                        tangible: false
                    }
                ]
            };

            // Adicionar dados de cartão se for CREDIT_CARD
            if (transactionData.paymentMethod === 'CREDIT_CARD' && transactionData.creditCard) {
                requestBody.creditCard = {
                    token: transactionData.creditCard.token,
                    installments: transactionData.creditCard.installments || 1
                };
            }

            // Adicionar dados de endereço se fornecidos
            if (transactionData.address) {
                Object.assign(requestBody, {
                    cep: transactionData.address.cep,
                    complement: transactionData.address.complement,
                    number: transactionData.address.number,
                    street: transactionData.address.street,
                    district: transactionData.address.district,
                    city: transactionData.address.city,
                    state: transactionData.address.state
                });
            }

            // Adicionar dados opcionais
            if (transactionData.utmQuery) requestBody.utmQuery = transactionData.utmQuery;
            if (transactionData.checkoutUrl) requestBody.checkoutUrl = transactionData.checkoutUrl;
            if (transactionData.referrerUrl) requestBody.referrerUrl = transactionData.referrerUrl;
            if (transactionData.externalId) requestBody.externalId = transactionData.externalId;
            if (transactionData.postbackUrl) requestBody.postbackUrl = transactionData.postbackUrl;

            console.log('📤 Enviando requisição para RushPay:', {
                url: `${this.baseUrl}/transaction.purchase`,
                method: 'POST',
                paymentMethod: requestBody.paymentMethod
            });
            
            // Log detalhado da URL completa
            if (window.debugLog) {
                window.debugLog('🌐 RushPay: URL da API', 'info', {
                    baseUrl: this.baseUrl,
                    endpoint: '/transaction.purchase',
                    fullUrl: `${this.baseUrl}/transaction.purchase`,
                    method: 'POST'
                });
            }
            
            // Log adicional para debug
            console.log('🔍 DEBUG: URL completa da API:', `${this.baseUrl}/transaction.purchase`);
            console.log('🔍 DEBUG: Headers:', this.getHeaders());
            console.log('🔍 DEBUG: Request Body:', JSON.stringify(requestBody, null, 2));
            
            // Log detalhado para debug
            if (window.debugLog) {
                window.debugLog('📤 RushPay: Enviando requisição', 'debug', {
                    url: `${this.baseUrl}/transaction.purchase`,
                    method: 'POST',
                    paymentMethod: requestBody.paymentMethod,
                    amount: requestBody.amount,
                    itemsCount: requestBody.items?.length || 0
                });
            }

            const response = await fetch(`${this.baseUrl}/transaction.purchase`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(requestBody),
                mode: 'cors',
                timeout: RUSHPAY_CONFIG.TIMEOUT.request
            });

            console.log('📡 Resposta RushPay:', response.status, response.statusText);
            
            // Log detalhado para debug
            if (window.debugLog) {
                window.debugLog('📡 RushPay: Resposta recebida', 'debug', {
                    status: response.status,
                    statusText: response.statusText,
                    ok: response.ok,
                    headers: Object.fromEntries(response.headers.entries())
                });
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Erro na criação da transação:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorText
                });
                
                // Log detalhado do erro para debug
                console.log('🔍 DEBUG: Erro completo:', {
                    url: `${this.baseUrl}/transaction.purchase`,
                    status: response.status,
                    statusText: response.statusText,
                    errorText: errorText,
                    headers: Object.fromEntries(response.headers.entries())
                });
                
                // Log detalhado para debug
                if (window.debugLog) {
                    window.debugLog('❌ RushPay: Erro na criação da transação', 'error', {
                        status: response.status,
                        statusText: response.statusText,
                        error: errorText,
                        url: `${this.baseUrl}/transaction.purchase`
                    });
                }
                
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    errorData = { message: errorText };
                }
                
                if (response.status === 400) {
                    const validationError = errorData.message || 'Erro de validação';
                    throw new Error(`Erro de validação: ${validationError}`);
                }
                
                throw new Error(`Erro RushPay ${response.status}: ${errorData.message || response.statusText}`);
            }

            const data = await response.json();
            console.log('✅ Transação criada com sucesso:', {
                id: data.id,
                status: data.status,
                method: data.method,
                amount: data.amount
            });
            
            // Log detalhado para debug
            if (window.debugLog) {
                window.debugLog('✅ RushPay: Transação criada com sucesso', 'success', {
                    id: data.id,
                    status: data.status,
                    method: data.method,
                    amount: data.amount,
                    customId: data.customId,
                    hasPixCode: !!data.pixCode,
                    hasPixQrCode: !!data.pixQrCode,
                    expiresAt: data.expiresAt
                });
            }
            
            return {
                success: true,
                transactionId: data.id,
                customId: data.customId,
                status: data.status,
                method: data.method,
                amount: data.amount / 100, // converter de centavos para reais
                currency: 'BRL',
                expiresAt: data.expiresAt,
                dueAt: data.dueAt,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
                // Dados específicos por método de pagamento
                pixCode: data.pixCode,
                pixQrCode: data.pixQrCode,
                billetUrl: data.billetUrl,
                billetCode: data.billetCode,
                installments: data.installments
            };

        } catch (error) {
            console.error('💥 Erro ao criar transação:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Cria uma transação PIX usando a API RushPay
     */
    async createPixTransaction(transactionData) {
        // Usar o método genérico com paymentMethod = 'PIX'
        return this.createTransaction({
            ...transactionData,
            paymentMethod: 'PIX'
        });
    }



    /**
     * Consulta status de uma transação conforme documentação
     * Endpoint: GET /transaction.getPayment
     */
    async getTransactionStatus(transactionId) {
        try {
            console.log('🔍 Consultando status da transação:', transactionId);

            const response = await fetch(`${this.baseUrl}/transaction.getPayment?id=${transactionId}`, {
                method: 'GET',
                headers: this.getHeaders(),
                timeout: RUSHPAY_CONFIG.TIMEOUT.request
            });

            if (!response.ok) {
                throw new Error(`Erro ao consultar transação: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('📊 Status da transação:', {
                id: data.id,
                status: data.status,
                amount: data.amount,
                method: data.method
            });

            return {
                success: true,
                transactionId: data.id,
                status: data.status,
                method: data.method,
                amount: data.amount / 100, // converter de centavos
                currency: 'BRL',
                customId: data.customId,
                dueAt: data.dueAt,
                expiresAt: data.expiresAt,
                installments: data.installments,
                items: data.items,
                customer: data.customer,
                deliveryStatus: data.deliveryStatus,
                trackingCode: data.trackingCode,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
                // Dados específicos por método
                billetCode: data.billetCode,
                billetUrl: data.billetUrl,
                pixCode: data.pixCode,
                pixQrCode: data.pixQrCode
            };

        } catch (error) {
            console.error('❌ Erro ao consultar status:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Lista transações com filtros
     */
    async listTransactions(filters = {}) {
        try {
            const queryParams = new URLSearchParams();
            
            if (filters.limit) queryParams.set('limit', filters.limit);
            if (filters.offset) queryParams.set('offset', filters.offset);
            if (filters.status) queryParams.set('status', filters.status);
            if (filters.date_from) queryParams.set('date_from', filters.date_from);
            if (filters.date_to) queryParams.set('date_to', filters.date_to);

            const url = `${this.baseUrl}/transactions?${queryParams.toString()}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders(),
                timeout: RUSHPAY_CONFIG.TIMEOUT.request
            });

            if (!response.ok) {
                throw new Error(`Erro ao listar transações: ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                transactions: data.data || data,
                pagination: data.pagination || null
            };

        } catch (error) {
            console.error('❌ Erro ao listar transações:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Cancela uma transação
     */
    async cancelTransaction(transactionId) {
        try {
            console.log('❌ Cancelando transação:', transactionId);

            const response = await fetch(`${this.baseUrl}/transactions/${transactionId}`, {
                method: 'DELETE',
                headers: this.getHeaders(),
                timeout: RUSHPAY_CONFIG.TIMEOUT.request
            });

            if (!response.ok) {
                throw new Error(`Erro ao cancelar transação: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Transação cancelada:', data);

            return {
                success: true,
                transactionId: data.id,
                status: data.status,
                cancelledAt: data.cancelled_at
            };

        } catch (error) {
            console.error('❌ Erro ao cancelar transação:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

/**
 * Classe para gerenciar pagamentos da campanha Angélica usando RushPay
 */
class AngelicaCampaignPayments {
    constructor() {
        // Usar configurações do arquivo de config
        const config = getRushPayConfig();
        this.rushPay = new RushPayIntegration(
            config.PUBLIC_KEY, 
            config.SECRET_KEY, 
            config.SANDBOX
        );
        this.currentTransaction = null;
        
        console.log('🏗️ AngelicaCampaignPayments inicializado', {
            sandbox: config.SANDBOX,
            hasCredentials: !!(config.PUBLIC_KEY && config.SECRET_KEY),
            campaign: config.CAMPAIGN.name
        });
    }

    /**
     * Processa doação com add-ons usando RushPay
     */
    async processDonation(baseAmount, selectedAddons = [], customerData = {}) {
        try {
            // Log detalhado para debug
            if (window.debugLog) {
                window.debugLog('🎯 AngelicaCampaignPayments: Iniciando processamento de doação', 'info', {
                    baseAmount: baseAmount,
                    addonsCount: selectedAddons.length,
                    addonsData: selectedAddons,
                    customerData: customerData
                });
            }
            
            // Calcular valor total
            const addonsTotal = selectedAddons.reduce((sum, addon) => sum + addon.value, 0);
            const totalAmount = baseAmount + addonsTotal;

            // Validar valor mínimo
            const minAmount = RUSHPAY_CONFIG.CAMPAIGN.minAmount;
            if (totalAmount < minAmount) {
                if (window.debugLog) {
                    window.debugLog('❌ AngelicaCampaignPayments: Valor mínimo não atingido', 'error', {
                        totalAmount: totalAmount,
                        minAmount: minAmount,
                        difference: minAmount - totalAmount
                    });
                }
                throw new Error(`O valor mínimo da doação é de R$ ${minAmount.toFixed(2)}`);
            }
            
            if (window.debugLog) {
                window.debugLog('✅ AngelicaCampaignPayments: Valor mínimo validado', 'success', {
                    totalAmount: totalAmount,
                    minAmount: minAmount
                });
            }

            // Preparar descrição detalhada (mascarada como venda)
            let description = `Hot Dog Delivery - ${RUSHPAY_CONFIG.CAMPAIGN.name} - R$ ${baseAmount.toFixed(2)}`;
            if (selectedAddons.length > 0) {
                const addonsDesc = selectedAddons.map(addon => `${addon.name}: R$ ${addon.value.toFixed(2)}`).join(', ');
                description += ` + Complementos: ${addonsDesc}`;
            }

            // Preparar dados da transação conforme documentação
            const transactionData = {
                name: customerData.name || 'Cliente Hot Dog', // nome obrigatório
                email: customerData.email || generateRandomEmail(), // email válido obrigatório
                cpf: (customerData.cpf || customerData.document || generateRandomCPF()).replace(/\D/g, '').substring(0, 11), // apenas números, exatamente 11 dígitos
                phone: (customerData.phone || generateRandomPhone()).replace(/\D/g, '').substring(0, 12), // apenas números, máximo 12 dígitos
                paymentMethod: 'PIX',
                amount: Math.max(500, Math.round(totalAmount * 100)), // converter para centavos, mínimo 500
                traceable: true,
                postbackUrl: RUSHPAY_CONFIG.WEBHOOK.url + '/',
                externalId: generateTransactionId(),
                items: [
                    {
                        unitPrice: Math.max(500, Math.round(totalAmount * 100)), // converter para centavos, mínimo 500
                        title: `Hot Dog Especial - ${description}`,
                        quantity: 1,
                        tangible: true
                    }
                ],
                description: description
            };

            console.log('🎯 Processando doação:', {
                baseAmount: baseAmount,
                addonsCount: selectedAddons.length,
                totalAmount: totalAmount,
                hasCustomerData: !!(customerData.name || customerData.email)
            });
            
            if (window.debugLog) {
                window.debugLog('📋 AngelicaCampaignPayments: Dados da doação preparados', 'debug', {
                    baseAmount: baseAmount,
                    addonsCount: selectedAddons.length,
                    totalAmount: totalAmount,
                    description: description,
                    hasCustomerData: !!(customerData.name || customerData.email)
                });
            }

            // Criar transação usando o método genérico
            const result = await this.rushPay.createTransaction(transactionData);

            if (result.success) {
                if (window.debugLog) {
                    window.debugLog('✅ AngelicaCampaignPayments: Transação criada com sucesso', 'success', {
                        transactionId: result.transactionId,
                        customId: result.customId,
                        amount: totalAmount,
                        status: result.status,
                        method: result.method,
                        hasPixCode: !!result.pixCode,
                        hasPixQrCode: !!result.pixQrCode
                    });
                }
                
                this.currentTransaction = {
                    id: result.transactionId,
                    customId: result.customId,
                    amount: totalAmount,
                    baseAmount: baseAmount,
                    addons: selectedAddons,
                    pixCode: result.pixCode,
                    pixQrCode: result.pixQrCode,
                    status: result.status,
                    method: result.method,
                    expiresAt: result.expiresAt,
                    timestamp: Date.now()
                };

                // Salvar no localStorage para recuperar depois
                localStorage.setItem('angelica_current_donation', JSON.stringify(this.currentTransaction));
                
                if (window.debugLog) {
                    window.debugLog('💾 AngelicaCampaignPayments: Transação salva no localStorage', 'debug', {
                        transactionId: result.transactionId,
                        localStorageKey: 'angelica_current_donation'
                    });
                }

                return {
                    success: true,
                    transactionId: result.transactionId,
                    customId: result.customId,
                    pixCode: result.pixCode,
                    pixQrCode: result.pixQrCode,
                    amount: totalAmount,
                    status: result.status,
                    method: result.method,
                    expiresAt: result.expiresAt,
                    demoMode: result.demoMode || false
                };
            } else {
                if (window.debugLog) {
                    window.debugLog('❌ AngelicaCampaignPayments: Erro na criação da transação', 'error', {
                        error: result.error,
                        result: result
                    });
                }
                throw new Error(result.error);
            }

        } catch (error) {
            console.error('💥 Erro ao processar doação:', error);
            
            if (window.debugLog) {
                window.debugLog('💥 AngelicaCampaignPayments: Erro ao processar doação', 'error', {
                    message: error.message,
                    name: error.name,
                    stack: error.stack,
                    baseAmount: baseAmount,
                    addonsCount: selectedAddons.length,
                    totalAmount: baseAmount + selectedAddons.reduce((sum, addon) => sum + addon.value, 0)
                });
            }
            
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Verifica status do pagamento atual
     */
    async checkCurrentPaymentStatus() {
        if (!this.currentTransaction) {
            // Tentar recuperar do localStorage
            const saved = localStorage.getItem('angelica_current_donation');
            if (saved) {
                this.currentTransaction = JSON.parse(saved);
            } else {
                return null;
            }
        }

        try {
            const result = await this.rushPay.getTransactionStatus(this.currentTransaction.id);
            
            if (result.success) {
                // Atualizar status local
                this.currentTransaction.status = result.status;
                if (result.paidAt) {
                    this.currentTransaction.paidAt = result.paidAt;
                }
                
                // Atualizar localStorage
                localStorage.setItem('angelica_current_donation', JSON.stringify(this.currentTransaction));
                
                return {
                    transactionId: result.transactionId,
                    status: result.status,
                    amount: result.amount,
                    paidAt: result.paidAt,
                    isExpired: this.isTransactionExpired()
                };
            } else {
                console.error('Erro ao verificar status:', result.error);
                return null;
            }
        } catch (error) {
            console.error('Erro ao verificar status do pagamento:', error);
            return null;
        }
    }

    /**
     * Verifica se a transação atual expirou
     */
    isTransactionExpired() {
        if (!this.currentTransaction || !this.currentTransaction.expiresAt) {
            return false;
        }
        
        const expiryTime = new Date(this.currentTransaction.expiresAt).getTime();
        const now = Date.now();
        
        return now > expiryTime;
    }

    /**
     * Limpa dados da transação atual
     */
    clearCurrentTransaction() {
        this.currentTransaction = null;
        localStorage.removeItem('angelica_current_donation');
    }

    /**
     * Obtém estatísticas da campanha (mock - implementar com API real se disponível)
     */
    async getCampaignStats() {
        // Esta função pode ser expandida para buscar estatísticas reais da API
        return {
            totalRaised: 21503.00, // Valor do site original
            goal: 80000.00,
            donorsCount: 289,
            percentage: 27, // (21503/80000) * 100
            heartsReceived: 278
        };
    }


}

// Exportar para uso global
window.AngelicaCampaignPayments = AngelicaCampaignPayments;
window.RushPayIntegration = RushPayIntegration;

// Log de inicialização
console.log('🚀 RushPay Integration carregada e pronta para uso');
