# 🚀 INSTRUÇÕES PARA COLOCAR O PROJETO NO AR

## ⚠️ AÇÕES OBRIGATÓRIAS ANTES DO DEPLOY

### 1. **CORRIGIR URL DO WEBHOOK** ✅ **CORRIGIDO**

**Arquivo:** `ajudconosco.site/Angélica/js/rushpay-config.js`
**Linha 36:**

```javascript
// ✅ CORRIGIDO PARA SUA URL:
url: 'https://angelica-angelica.vercel.app/webhook/angelica',
```

**✅ URL DO WEBHOOK JÁ ATUALIZADA CORRETAMENTE!**

### 2. **VERIFICAR CREDENCIAIS DA RUSHPAY** 🔴 **CRÍTICO**

**Arquivo:** `ajudconosco.site/Angélica/js/rushpay-config.js`
**Linhas 16-17:**

```javascript
PUBLIC_KEY: '0178994f-aea3-45d5-a081-c702de978204',
SECRET_KEY: '3a98c055-3db4-40a4-83be-f844653df074',
```

**Verificações necessárias:**
- [ ] Confirmar se essas chaves são válidas para PRODUÇÃO
- [ ] Verificar se a conta RushPay está ativa
- [ ] Testar se as chaves funcionam com a API real

### 3. **CONFIGURAR DOMÍNIO PERSONALIZADO (OPCIONAL)**

Se você quiser usar um domínio próprio:
1. Configure no painel do Vercel
2. Atualize a URL do webhook para seu domínio personalizado

## 📝 CHECKLIST PRE-DEPLOY

### ✅ **ARQUIVOS ESSENCIAIS**
- [x] `vercel.json` - Configuração do Vercel
- [x] `index.html` - Página principal
- [x] `obrigado.html` - Página de pagamento
- [x] `rushpay-config.js` - Configurações da API
- [x] `rushpay-integration.js` - Integração com RushPay
- [x] `webhook/angelica/index.html` - Endpoint do webhook

### ✅ **CONFIGURAÇÕES**
- [x] URL do webhook corrigida ✅
- [ ] Credenciais RushPay verificadas
- [x] Modo produção ativado (`SANDBOX: false`) ✅
- [x] Valor mínimo configurado (R$ 5,00) ✅

### ✅ **TESTES**
- [ ] Teste de conectividade com RushPay API
- [ ] Teste de criação de transação PIX
- [ ] Teste de geração de QR Code
- [ ] Teste do webhook

## 🚀 PASSOS PARA DEPLOY

### **Opção 1: Deploy Automático via GitHub**
1. Conecte seu repositório ao Vercel
2. Configure o diretório raiz como `ajudconosco.site`
3. Deploy automático será feito

### **Opção 2: Deploy Manual**
1. Acesse [vercel.com](https://vercel.com)
2. Faça upload da pasta `ajudconosco.site`
3. Configure as variáveis de ambiente se necessário

## 🧪 COMO TESTAR APÓS O DEPLOY

### 1. **Teste Básico**
- Acesse: `https://angelica-angelica.vercel.app/Angélica/`
- Verifique se a página carrega corretamente

### 2. **Teste de Pagamento**
- Clique em "Quero Ajudar"
- Escolha um valor
- Clique em "CONTRIBUIR"
- Verifique se gera o QR Code PIX

### 3. **Teste do Webhook**
- Acesse: `https://angelica-angelica.vercel.app/webhook/angelica/`
- Deve mostrar a página de webhook

### 4. **Teste Completo**
- Use o arquivo: `Angélica/test-rushpay-fixed.html`
- Execute todos os testes
- Verifique se não há erros

## ⚠️ PROBLEMAS COMUNS E SOLUÇÕES

### **Erro: "Cannot read properties of undefined"**
**Causa:** Estrutura de dados incorreta
**Solução:** ✅ Já corrigido no código

### **Erro: "QRCode is not defined"**
**Causa:** Biblioteca QRCode não carregada
**Solução:** ✅ Já implementado fallback automático

### **Erro: "Webhook não funciona"**
**Causa:** URL incorreta
**Solução:** Corrigir URL conforme instruções acima

### **Erro: "Transação rejeitada"**
**Causa:** Credenciais inválidas ou modo sandbox
**Solução:** Verificar credenciais e configurar SANDBOX: false

## 📞 SUPORTE

Se encontrar problemas:
1. Verifique o console do navegador (F12)
2. Use o arquivo de teste: `test-rushpay-fixed.html`
3. Consulte os logs do Vercel
4. Verifique a documentação da RushPay

## 🎯 RESUMO - O QUE PRECISA SER FEITO

### **URGENTE** 🔴
1. ✅ **URL do webhook corrigida** no arquivo `rushpay-config.js`
2. **Verificar credenciais RushPay** se são de produção
3. **Testar funcionalidade completa** após deploy

### **OPCIONAL** 🟡
1. Configurar domínio personalizado
2. Configurar analytics avançado
3. Personalizar design

---

**✅ Após seguir essas instruções, seu projeto estará pronto para funcionar em produção!**
