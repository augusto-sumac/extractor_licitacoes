# 🔍 Buscador de Editais Culturais

Sistema web para busca e extração de editais, licitações e oportunidades culturais em Santa Catarina e Brasil, com foco em arte, escultura e cultura.

## ✨ Funcionalidades

- **Busca Inteligente**: Encontra editais culturais usando termos específicos
- **Filtros Avançados**: Por localização (SC/Nacional), tipo de oportunidade e data
- **Extração de Datas**: Identifica datas de publicação automaticamente
- **Paginação**: Navegação por páginas com controles avançados
- **Exportação**: CSV e JSON para análise posterior
- **Interface Responsiva**: Funciona em desktop e mobile

## 🚀 Instalação

### Pré-requisitos
- Node.js 16+ 
- NPM ou Yarn

### Passos
```bash
# 1. Clonar o repositório
git clone <url-do-repositorio>
cd extractor_licitacao

# 2. Instalar dependências
npm install

# 3. Iniciar servidor
npm start

# 4. Acessar no navegador
http://localhost:3000
```

## 🛠️ Tecnologias

- **Backend**: Node.js + Express + Puppeteer + Cheerio
- **Frontend**: HTML5 + CSS3 + JavaScript Vanilla
- **Scraping**: Puppeteer (headless Chrome) + Axios (fallback)
- **Parsing**: Cheerio para HTML + Regex para datas

## 📊 Fontes de Dados

### Governamentais
- Ministério da Cultura
- Funarte
- IPHAN
- Lei Rouanet
- Governo de SC
- FCC SC

### Culturais
- SESC SC
- Cultura Catarina
- Cultura em Mercado
- Prosas
- Transparência SC

### Municipais
- Balneário Piçarras
- Bombinhas
- Camboriú
- Itajaí
- Itapema
- Navegantes

## 🔍 Como Usar

### 1. Busca Básica
- Digite o termo de busca (ex: "teatro", "escultura", "arte")
- Selecione as fontes desejadas
- Clique em "Buscar"

### 2. Filtros
- **Localização**: SC ou Nacional
- **Tipo**: PDF, Web, Edital, Geral
- **Data**: Período específico ou presets

### 3. Resultados
- Visualize os resultados com relevância
- Use paginação para navegar
- Exporte dados em CSV/JSON

## 🎯 Lógica de Busca

O sistema implementa a lógica do script Python original:

1. **Termo de Busca**: Deve estar presente no conteúdo
2. **Termo de Edital**: Deve conter palavras-chave de licitação
3. **Termo Cultural**: Deve mencionar arte/cultura
4. **Localização**: Para sites .gov.br, deve mencionar SC ou ser nacional

## 📁 Estrutura do Projeto

```
extractor_licitacao/
├── index.html          # Interface principal
├── script-real.js      # Lógica do frontend
├── styles.css          # Estilos CSS
├── server.js           # Servidor principal
├── package.json        # Dependências
└── README.md           # Este arquivo
```

## 🔧 Configuração

### Variáveis de Ambiente
```bash
# Porta do servidor (padrão: 3000)
PORT=3000

# Modo de desenvolvimento
NODE_ENV=development
```

### Dependências Principais
```json
{
  "puppeteer": "^21.0.0",
  "express": "^4.18.0",
  "cheerio": "^1.0.0",
  "axios": "^1.6.0"
}
```

## 📈 Performance

- **Puppeteer**: Para sites dinâmicos e complexos
- **Axios**: Fallback para sites estáticos
- **Cache**: Resultados em memória durante sessão
- **Timeout**: 30s por fonte para evitar travamentos

## 🚨 Limitações

- **Sites Dinâmicos**: Alguns podem não funcionar sem JavaScript
- **Rate Limiting**: Alguns sites bloqueiam muitas requisições
- **Captcha**: Sites com proteção anti-bot podem falhar
- **Tamanho**: Sites muito grandes podem demorar para processar

## 🐛 Solução de Problemas

### Servidor não inicia
```bash
# Verificar Node.js
node --version

# Limpar cache
npm cache clean --force

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

### Busca não retorna resultados
- Verificar se as fontes estão ativas
- Testar com termos mais simples
- Verificar console para erros
- Testar uma fonte por vez

### Erro de Puppeteer
```bash
# Reinstalar Puppeteer
npm uninstall puppeteer
npm install puppeteer

# Verificar dependências do sistema
sudo apt-get update
sudo apt-get install -y gconf-service libasound2
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para detalhes.

## 📞 Suporte

- **Issues**: Use o GitHub Issues
- **Documentação**: Este README
- **Código**: Comentários inline no código

## 🔄 Atualizações

### Versão 2.0.0
- Parser específico para SESC SC
- Sistema de relevância inteligente
- Filtros avançados de data
- Interface responsiva melhorada

### Versão 1.0.0
- Busca básica em múltiplas fontes
- Exportação CSV/JSON
- Paginação simples

---

**🎯 Sistema funcional e robusto para busca de editais culturais!**

Desenvolvido com foco em precisão e relevância, baseado na lógica do script Python original.
