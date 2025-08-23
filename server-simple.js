const express = require('express');
const cors = require('cors');
const cheerio = require('cheerio');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// --- FUNÇÕES UTILITÁRIAS ---

// Normalizar texto (remove acentos, converte para minúsculo)
function normalizar(texto) {
    if (!texto) return "";
    return texto.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}

// Verificar se menciona Santa Catarina
function mencionaSC(texto) {
    const textoNormalizado = normalizar(texto);
    
    const cidadesSC = [
        "balneário piçarras", "barra velha", "bombinhas", "camboriú",
        "ilhota", "itajai", "itapema", "luiz alves", "navegantes",
        "penha", "porto belo", "santa catarina", "sc"
    ];
    
    const termosNacionais = [
        "brasil", "nacional", "todo o país", "todo o pais", 
        "qualquer estado", "todas as regiões", "todas as regioes"
    ];
    
    if (cidadesSC.some(cidade => textoNormalizado.includes(cidade))) {
        return true;
    }
    
    if (termosNacionais.some(termo => textoNormalizado.includes(termo))) {
        return true;
    }
    
    return false;
}

// Extrair trecho relevante
function extrairTrecho(texto, keywords, termoBusca) {
    const textoNormalizado = normalizar(texto);
    const termoBuscaNormalizado = normalizar(termoBusca);
    
    for (const keyword of keywords) {
        const idx = textoNormalizado.indexOf(keyword);
        if (idx !== -1) {
            const contexto = texto.substring(Math.max(0, idx - 200), idx + 200);
            if (normalizar(contexto).includes(termoBuscaNormalizado)) {
                return contexto.replace(/\n/g, ' ').trim();
            }
        }
    }
    
    const idx = textoNormalizado.indexOf(termoBuscaNormalizado);
    if (idx !== -1) {
        return texto.substring(Math.max(0, idx - 150), idx + 150).replace(/\n/g, ' ').trim();
    }
    
    return "";
}

// Verificar se o conteúdo é relevante
function isConteudoRelevante(texto, termoBusca, url) {
    const textoNormalizado = normalizar(texto);
    const termoBuscaNormalizado = normalizar(termoBusca);
    
    // 1. DEVE conter termo de busca
    if (!textoNormalizado.includes(termoBuscaNormalizado)) {
        return false;
    }
    
    // 2. DEVE conter pelo menos um termo de edital
    const filtroEditais = [
        "seleção", "selecao", "processo seletivo", "inscrição", "inscricao",
        "prêmio", "premio", "bolsa", "fomento", "incentivo", "patrocínio",
        "licitação", "licitacao", "pregão", "pregao", "concorrência",
        "concorrencia", "tomada de preço", "tomada de preco", "inexigibilidade",
        "dispensa", "convite", "modalidade", "credenciamento",
        "oportunidade", "programa", "projeto", "rodada", "seletivo",
        "certame", "manifestação", "interesse", "cadastro", "registro",
        "salão", "salao", "mostra", "exposição", "exposicao", "bienal",
        "residência", "residencia", "circuito", "festival", "showcase",
        "ata", "contratação", "contratacao", "homologação", "homologacao"
    ];
    
    const temEdital = filtroEditais.some(termo => 
        textoNormalizado.includes(normalizar(termo))
    );
    
    if (!temEdital) {
        return false;
    }
    
    // 3. DEVE conter pelo menos um termo cultural
    const keywordsCultura = [
        "cultura", "cultural", "artes visuais", "escultura", "estatua",
        "estatueta", "relevo", "trofeu", "monumental", "monumento",
        "site-specific", "modelagem", "busto", "torso", "tridimensional", 
        "exposicao", "acervo", "mostra", "bienal", "3d", "arte"
    ];
    
    const temCultura = keywordsCultura.some(termo => 
        textoNormalizado.includes(normalizar(termo))
    );
    
    if (!temCultura) {
        return false;
    }
    
    // 4. Para sites .gov.br, deve mencionar SC ou ser nacional
    if (url.includes('.gov.br') && !mencionaSC(texto)) {
        return false;
    }
    
    return true;
}

// Extrair data robusta
function extrairDataRobusta(texto) {
    const padroes = [
        /(?:data|abertura|publicação|publicacao|lançamento|lancamento|início|inicio)\s*(?:de|em|para)?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/gi,
        /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})\s*(?:às|as|horas?|h)/gi,
        /(?:edital|licitação|licitacao|concorrência|concorrencia)\s+(?:de|em|para)\s+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/gi,
        /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/g,
        /(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/g
    ];
    
    for (const padrao of padroes) {
        const match = texto.match(padrao);
        if (match) {
            const data = match[1] || match[0];
            if (data.match(/^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}$/) || 
                data.match(/^\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}$/)) {
                return data;
            }
        }
    }
    
    return null;
}

// --- PARSERS ---

// Parser para SESC SC
function parseSescSC($, source, searchTerm) {
    const results = [];
    
    console.log(`🔍 Parsing SESC SC para termo: "${searchTerm}"`);
    
    const selectors = [
        '.licitacao-item', '[class*="licitacao"]', '.edital-item', 
        '[class*="edital"]', '.item-licitacao', '.licitacao'
    ];
    
    let encontrados = 0;
    
    for (const selector of selectors) {
        $(selector).each((index, element) => {
            const $el = $(element);
            const title = $el.find('h3, h4, .titulo, strong, .title').text().trim();
            const content = $el.text().trim();
            
            if (title && content.length > 20) {
                if (isConteudoRelevante(content, searchTerm, source.url)) {
                    const extractedDate = extrairDataRobusta(content) || 'Data não encontrada';
                    const trecho = extrairTrecho(content, ['licitação', 'edital', 'concorrência'], searchTerm);
                    
                    if (trecho) {
                        console.log(`✅ Licitação SESC encontrada: "${title.substring(0, 50)}..." | Data: ${extractedDate}`);
                        
                        results.push({
                            titulo: title,
                            link: source.url,
                            fonte: new URL(source.url).hostname,
                            trecho: trecho + '...',
                            data: extractedDate,
                            tipo: 'web',
                            palavraChave: searchTerm,
                            relevancia: 85
                        });
                        
                        encontrados++;
                    }
                }
            }
        });
        
        if (encontrados > 0) break;
    }
    
    if (encontrados === 0) {
        console.log(`🔄 Fallback: busca genérica no SESC SC`);
        
        $('a[href*="licitacao"], a[href*="edital"], a[href*="concorrencia"]').each((index, element) => {
            const $el = $(element);
            const title = $el.text().trim();
            const href = $el.attr('href');
            
            if (title && href && title.length > 10) {
                const content = $el.parent().text().trim() + ' ' + title;
                
                if (isConteudoRelevante(content, searchTerm, source.url)) {
                    const extractedDate = extrairDataRobusta(content) || 'Data não encontrada';
                    const trecho = extrairTrecho(content, ['licitação', 'edital'], searchTerm);
                    
                    if (trecho) {
                        const fullUrl = href.startsWith('http') ? href : new URL(href, source.url).href;
                        
                        results.push({
                            titulo: title,
                            link: fullUrl,
                            fonte: new URL(source.url).hostname,
                            trecho: trecho + '...',
                            data: extractedDate,
                            tipo: 'web',
                            palavraChave: searchTerm,
                            relevancia: 70
                        });
                        
                        encontrados++;
                    }
                }
            }
        });
    }
    
    console.log(`📊 Total de resultados SESC SC: ${encontrados}`);
    return results.slice(0, 25);
}

// Parser genérico
function parseGenerico($, source, searchTerm) {
    const results = [];
    
    console.log(`🔍 Parsing genérico para: ${source.name} | Termo: "${searchTerm}"`);
    
    const relevantSelectors = [
        'a[href*="licitacao"]', 'a[href*="edital"]', 'a[href*="concorrencia"]',
        'a[href*="selecao"]', 'a[href*="premio"]', 'a[href*="bolsa"]',
        'a[href*="fomento"]', 'a[href*="inscricao"]', 'a[href*="concurso"]'
    ];
    
    let encontrados = 0;
    
    for (const selector of relevantSelectors) {
        $(selector).each((index, element) => {
            const $el = $(element);
            const title = $el.text().trim();
            const href = $el.attr('href');
            
            if (title && href && title.length > 10) {
                const $parent = $el.parent();
                const context = $parent.text().trim() + ' ' + $parent.parent().text().trim();
                const fullContent = context + ' ' + title;
                
                if (isConteudoRelevante(fullContent, searchTerm, source.url)) {
                    const extractedDate = extrairDataRobusta(fullContent) || 'Data não encontrada';
                    const trecho = extrairTrecho(fullContent, ['licitação', 'edital', 'concorrência'], searchTerm);
                    
                    if (trecho) {
                        const fullUrl = href.startsWith('http') ? href : new URL(href, source.url).href;
                        
                        results.push({
                            titulo: title,
                            link: fullUrl,
                            fonte: new URL(source.url).hostname,
                            trecho: trecho + '...',
                            data: extractedDate,
                            tipo: 'web',
                            palavraChave: searchTerm,
                            relevancia: 60
                        });
                        
                        encontrados++;
                    }
                }
            }
        });
        
        if (encontrados >= 10) break;
    }
    
    if (encontrados < 5) {
        $('p, div, span, h1, h2, h3, h4, h5, h6').each((index, element) => {
            const $el = $(element);
            const text = $el.text().trim();
            
            if (text.length > 50 && text.length < 2000) {
                if (isConteudoRelevante(text, searchTerm, source.url)) {
                    const extractedDate = extrairDataRobusta(text) || 'Data não encontrada';
                    const trecho = extrairTrecho(text, ['licitação', 'edital', 'concorrência'], searchTerm);
                    
                    if (trecho) {
                        const $link = $el.find('a').first();
                        const link = $link.attr('href') || source.url;
                        const title = $link.text().trim() || text.substring(0, 100);
                        
                        const fullUrl = link.startsWith('http') ? link : new URL(link, source.url).href;
                        
                        results.push({
                            titulo: title,
                            link: fullUrl,
                            fonte: new URL(source.url).hostname,
                            trecho: trecho + '...',
                            data: extractedDate,
                            tipo: 'web',
                            palavraChave: searchTerm,
                            relevancia: 50
                        });
                        
                        encontrados++;
                    }
                }
            }
        });
    }
    
    console.log(`📊 Total de resultados genéricos: ${encontrados}`);
    return results.slice(0, 25);
}

// --- FUNÇÃO PRINCIPAL ---

// Buscar fonte com Axios
async function searchSource(source, searchTerm) {
    try {
        console.log(`🌐 Axios: ${source.url}`);
        
        const response = await axios.get(source.url, {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        const $ = cheerio.load(response.data);
        
        let results = [];
        
        if (source.url.includes('sesc-sc.com.br')) {
            results = parseSescSC($, source, searchTerm);
        } else {
            results = parseGenerico($, source, searchTerm);
        }
        
        console.log(`✅ Axios: ${results.length} resultados de ${source.name}`);
        return results;
        
    } catch (error) {
        console.error(`❌ Erro Axios em ${source.name}:`, error.message);
        return [];
    }
}

// --- ENDPOINTS ---

// Endpoint principal de busca
app.post('/api/search', async (req, res) => {
    try {
        const { sources, searchTerm } = req.body;
        
        if (!sources || !searchTerm) {
            return res.status(400).json({ error: 'Parâmetros inválidos' });
        }
        
        console.log(`🔍 Busca iniciada: "${searchTerm}" em ${sources.length} fontes`);
        
        const allResults = [];
        
        for (const source of sources) {
            if (!source.active) continue;
            
            console.log(`\n📡 Processando: ${source.name} (${source.url})`);
            
            const results = await searchSource(source, searchTerm);
            allResults.push(...results);
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        const uniqueResults = allResults.filter((result, index, self) => 
            index === self.findIndex(r => r.link === result.link)
        );
        
        uniqueResults.sort((a, b) => (b.relevancia || 0) - (a.relevancia || 0));
        
        console.log(`\n🎯 Busca concluída: ${uniqueResults.length} resultados únicos`);
        
        res.json({
            success: true,
            results: uniqueResults,
            total: uniqueResults.length,
            searchTerm: searchTerm
        });
        
    } catch (error) {
        console.error('❌ Erro na busca:', error);
        res.status(500).json({ 
            error: 'Erro interno do servidor',
            details: error.message 
        });
    }
});

// Endpoint de status
app.get('/api/status', (req, res) => {
    res.json({ 
        status: 'online', 
        platform: 'railway',
        timestamp: new Date().toISOString(),
        version: '2.0.0-simple'
    });
});

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor simplificado rodando em http://localhost:${PORT}`);
    console.log(`📊 Status: http://localhost:${PORT}/api/status`);
    console.log(`🔍 API: http://localhost:${PORT}/api/search`);
});
