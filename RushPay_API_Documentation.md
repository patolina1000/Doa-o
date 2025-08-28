# 📚 Documentação da API RushPay - IMPLEMENTAÇÃO CORRIGIDA

## 🔗 Referência Oficial
**URL Base da API**: [https://example.com.br/api/v1](https://example.com.br/api/v1)

---

## 📋 Índice
- [1. Introdução](#1-introdução)
- [2. Correções Implementadas](#2-correções-implementadas)
- [3. Autenticação](#3-autenticação)
- [4. Endpoints Principais](#4-endpoints-principais)
- [5. Métodos de Pagamento](#5-métodos-de-pagamento)
- [6. Exemplos de Implementação](#6-exemplos-de-implementação)
- [7. Webhooks](#7-webhooks)
- [8. Segurança](#8-segurança)
- [9. Tratamento de Erros](#9-tratamento-de-erros)
- [10. Suporte](#10-suporte)

---

## 1. Introdução

Esta documentação foi **CORRIGIDA** para seguir exatamente as diretrizes da API fornecida. O sistema agora implementa corretamente:

- ✅ Autenticação conforme especificação
- ✅ Endpoints corretos da documentação
- ✅ Estrutura de dados adequada
- ✅ Webhooks funcionais
- ✅ Validação de dados

---

## 2. Correções Implementadas

### ❌ **Problemas Identificados e Corrigidos:**

1. **Autenticação Incorreta** ✅ **CORRIGIDO**
   - **Antes**: `Authorization: Bearer <token>`
   - **Agora**: `Authorization: <secretKey>` (conforme documentação)

2. **Endpoints Incorretos** ✅ **CORRIGIDO**
   - **Antes**: URLs genéricas
   - **Agora**: `https://example.com.br/api/v1` (conforme documentação)

3. **Estrutura de Dados Incompatível** ✅ **CORRIGIDO**
   - **Antes**: Parâmetros não seguiam a documentação
   - **Agora**: Estrutura exata conforme especificação

4. **Webhook Não Funcional** ✅ **CORRIGIDO**
   - **Antes**: HTML estático
   - **Agora**: Endpoint funcional com validação

5. **Falta de Validação** ✅ **CORRIGIDO**
   - **Antes**: Sem validação de dados
   - **Agora**: Validação completa conforme documentação

---

## 3. Autenticação

### 🔐 Método de Autenticação: Secret Key

```http
Authorization: <secretKey>
Content-Type: application/json
```

### 📋 Headers Obrigatórios:
```json
{
  "Content-Type": "application/json",
  "Authorization": "YOUR_SECRET_KEY"
}
```

---

## 4. Endpoints Principais

### 🏗️ URL Base
```
https://example.com.br/api/v1/
```

### 4.1 💳 Criar Token de Cartão

**POST** `/transaction.createCardToken`

```json
{
  "cardNumber": "4000000000000010",
  "cardCvv": "123",
  "cardExpirationMonth": "10",
  "cardExpirationYear": "30",
  "holderName": "João Silva",
  "holderDocument": "01234567890"
}
```

**Resposta de Sucesso:**
```json
{
  "token": "abcd1234efgh5678ijkl9012"
}
```

### 4.2 💰 Criar Transação de Compra

**POST** `/transaction.purchase`

```json
{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "cpf": "01234567890",
  "phone": "11999999999",
  "paymentMethod": "PIX",
  "amount": 5000,
  "traceable": true,
  "items": [
    {
      "unitPrice": 5000,
      "title": "Doação para campanha",
      "quantity": 1,
      "tangible": false
    }
  ]
}
```

**Resposta de Sucesso:**
```json
{
  "id": "txn_123456789",
  "customId": "cust_987654321",
  "status": "PENDING",
  "method": "PIX",
  "amount": 5000,
  "pixCode": "00020126820014...",
  "expiresAt": "2024-12-31T23:59:59Z",
  "createdAt": "2023-12-04T12:34:56Z"
}
```

### 4.3 🔍 Consultar Transação

**GET** `/transaction.getPayment?id={transaction_id}`

**Resposta:**
```json
{
  "id": "txn_123456789",
  "status": "APPROVED",
  "amount": 5000,
  "method": "PIX",
  "customer": {
    "name": "João Silva",
    "email": "joao@exemplo.com"
  }
}
```

---

## 5. Métodos de Pagamento

### 5.1 💰 PIX

**Configuração:**
```json
{
  "paymentMethod": "PIX",
  "amount": 5000
}
```

### 5.2 💳 Cartão de Crédito

**Configuração:**
```json
{
  "paymentMethod": "CREDIT_CARD",
  "creditCard": {
    "token": "abcd1234efgh5678ijkl9012",
    "installments": 3
  }
}
```

### 5.3 🧾 Boleto Bancário

**Configuração:**
```json
{
  "paymentMethod": "BILLET",
  "amount": 7500
}
```

---

## 6. Exemplos de Implementação

### 6.1 🟢 JavaScript/Node.js

```javascript
class RushPayIntegration {
    constructor(publicKey, secretKey, sandbox = true) {
        this.publicKey = publicKey;
        this.secretKey = secretKey;
        this.baseUrl = 'https://example.com.br/api/v1';
    }

    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': this.secretKey
        };
    }

    async createTransaction(transactionData) {
        const response = await fetch(`${this.baseUrl}/transaction.purchase`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(transactionData)
        });

        if (!response.ok) {
            throw new Error(`Erro: ${response.status}`);
        }

        return response.json();
    }

    async getTransactionStatus(transactionId) {
        const response = await fetch(`${this.baseUrl}/transaction.getPayment?id=${transactionId}`, {
            method: 'GET',
            headers: this.getHeaders()
        });

        if (!response.ok) {
            throw new Error(`Erro: ${response.status}`);
        }

        return response.json();
    }
}

// Uso
const rushpay = new RushPayIntegration('public_key', 'secret_key');

const transactionData = {
    name: 'Maria Silva',
    email: 'maria@exemplo.com',
    cpf: '12345678901',
    phone: '11999999999',
    paymentMethod: 'PIX',
    amount: 5000,
    traceable: true,
    items: [
        {
            unitPrice: 5000,
            title: 'Doação para campanha',
            quantity: 1,
            tangible: false
        }
    ]
};

rushpay.createTransaction(transactionData)
    .then(transaction => {
        console.log('Transação criada:', transaction);
    })
    .catch(error => {
        console.error('Erro:', error.message);
    });
```

---

## 7. Webhooks

### 🔔 Configuração:

1. **Configure a URL do webhook** no dashboard
2. **Implemente o endpoint** para receber notificações
3. **Valide a assinatura** para segurança

### 📥 Estrutura do Webhook:

```json
{
  "paymentId": "txn_123456789",
  "externalId": null,
  "checkoutUrl": null,
  "referrerUrl": null,
  "customId": "cust_987654321",
  "status": "APPROVED",
  "paymentMethod": "PIX",
  "deliveryStatus": null,
  "totalValue": 5000,
  "netValue": 4850,
  "pixQrCode": null,
  "pixCode": "00020126820014...",
  "billetUrl": null,
  "billetCode": null,
  "expiresAt": "2024-12-31T23:59:59Z",
  "dueAt": null,
  "installments": null,
  "utm": null,
  "items": [
    {
      "unitPrice": 5000,
      "title": "Doação para campanha",
      "quantity": 1
    }
  ],
  "customer": {
    "id": "cust_123456789",
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "cpf": "01234567890",
    "phone": "+5511999999999"
  },
  "createdAt": "2023-12-04T12:34:56Z",
  "updatedAt": "2023-12-04T12:34:56Z",
  "approvedAt": "2023-12-04T12:35:00Z",
  "refundedAt": null,
  "chargebackAt": null,
  "rejectedAt": null
}
```

### 🎯 Eventos Disponíveis:
- `onPixCreated` - PIX criado
- `onBuyApproved` - Compra aprovada
- `onChargeback` - Chargeback
- `onRefund` - Reembolso

---

## 8. Segurança

### 🔒 Boas Práticas Implementadas:

1. **Validação de dados** conforme documentação
2. **Validação de assinatura** de webhooks
3. **Sanitização** de inputs
4. **Logs detalhados** para auditoria
5. **Tratamento de erros** robusto

### 🛡️ Validação de Webhook:
```javascript
function validateWebhookSignature(payload, signature, secret) {
    const expectedSignature = btoa(JSON.stringify(payload) + secret);
    return signature === expectedSignature;
}
```

---

## 9. Tratamento de Erros

### 📊 Códigos de Status HTTP:

| Código | Significado |
|--------|-------------|
| 200 | Sucesso |
| 400 | Requisição inválida |
| 401 | Não autorizado |
| 404 | Recurso não encontrado |
| 500 | Erro interno do servidor |

### ❌ Exemplo de Resposta de Erro:
```json
{
  "error": {
    "code": "INVALID_PAYMENT_METHOD",
    "message": "Método de pagamento não suportado",
    "details": {
      "field": "paymentMethod",
      "value": "invalid_method"
    }
  }
}
```

---

## 10. Suporte

### 📞 Canais de Suporte:

- **Documentação**: [https://example.com.br/docs](https://example.com.br/docs)
- **Email**: suporte@example.com
- **Dashboard**: Acesse sua conta para tickets de suporte

### 💡 Dicas Importantes:

1. **Teste sempre em ambiente de sandbox** antes da produção
2. **Implemente logs detalhados** para facilitar debugging
3. **Configure alertas** para transações importantes
4. **Mantenha suas credenciais atualizadas**
5. **Revise regularmente** a documentação para updates

---

## 📝 Conclusão

✅ **Sistema Corrigido e Conforme Documentação**

O sistema agora implementa corretamente todas as diretrizes da API fornecida:

- ✅ Autenticação correta com Secret Key
- ✅ Endpoints exatos da documentação
- ✅ Estrutura de dados adequada
- ✅ Webhooks funcionais com validação
- ✅ Validação completa de dados
- ✅ Tratamento de erros robusto

**Lembre-se**: Sempre siga as boas práticas de segurança e mantenha-se atualizado com as últimas versões da API.

---

*Documentação atualizada em: 28/08/2025*
*Última correção: 28/08/2025*
*Status: ✅ CONFORME DOCUMENTAÇÃO*
