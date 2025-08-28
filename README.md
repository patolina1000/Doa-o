# 🎯 Campanha de Doações - Ajude a Angélica

Sistema de doações integrado com RushPay API para processamento de pagamentos PIX.

## 🚀 Tecnologias

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **API:** RushPay (PIX, Cartão de Crédito, Boleto)
- **Deploy:** Vercel
- **Webhooks:** Para notificações de pagamento

## 📁 Estrutura do Projeto

```
ajudconosco.site/
├── Isabela/                 # Páginas principais
│   ├── index.html          # Página inicial
│   ├── obrigado.html       # Página de doação
│   ├── js/                 # Scripts JavaScript
│   │   ├── rushpay-config.js
│   │   └── rushpay-integration.js
│   ├── css/                # Estilos
│   └── images/             # Imagens
├── webhook/                # Handlers de webhook
│   └── angelica/
│       └── index.html
├── vercel.json            # Configuração Vercel
└── README.md              # Este arquivo
```

## ⚙️ Configuração

### 1. Credenciais RushPay
Configure suas chaves API no arquivo `Isabela/js/rushpay-config.js`:

```javascript
const RUSHPAY_CONFIG = {
    PUBLIC_KEY: 'sua-public-key',
    SECRET_KEY: 'sua-secret-key',
    SANDBOX: false, // false para produção
    // ...
};
```

### 2. Webhook URL
Após o deploy no Vercel, atualize a URL do webhook:

```javascript
WEBHOOK: {
    url: 'https://seu-projeto.vercel.app/webhook/angelica',
    // ...
}
```

## 🎯 Funcionalidades

- ✅ **Doações via PIX** (valor mínimo: R$ 5,00)
- ✅ **Add-ons opcionais** (complementos)
- ✅ **Geração de QR Code** automática
- ✅ **Webhooks** para notificações
- ✅ **Dados aleatórios** para transações
- ✅ **Mascaramento** como venda de hot dog

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte o repositório no Vercel
2. Configure o diretório raiz como `ajudconosco.site`
3. Deploy automático

### URLs de Teste
```
✅ Página Principal: https://seu-projeto.vercel.app/Isabela/
✅ Página de Doação: https://seu-projeto.vercel.app/Isabela/obrigado.html
✅ Webhook: https://seu-projeto.vercel.app/webhook/angelica/
```

## 🔧 Desenvolvimento

### Teste Local
```bash
# Servir arquivos localmente
python -m http.server 8000
# ou
npx serve ajudconosco.site
```

### Teste com ngrok
```bash
ngrok http 8000
```

## 📊 Status dos Pagamentos

- **PENDING:** Aguardando pagamento
- **APPROVED:** Pagamento aprovado
- **REJECTED:** Pagamento rejeitado
- **CANCELLED:** Pagamento cancelado
- **EXPIRED:** PIX expirado

## 🛡️ Segurança

- Credenciais API protegidas
- Validação de dados de entrada
- Webhooks seguros
- CORS configurado

## 📞 Suporte

Para dúvidas ou problemas:
- Verifique os logs do console
- Teste o webhook manualmente
- Valide as credenciais da API

---

**Desenvolvido para a Campanha de Doações da Angélica** ❤️
