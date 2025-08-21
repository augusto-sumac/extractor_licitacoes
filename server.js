const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3000;

// Configurações do Puppeteer
let browser;
let isBrowserReady = false;

// Inicializar browser Puppeteer
async function initBrowser() {
    try {
        console.log('🚀 Iniciando browser Puppeteer...');
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding'
            ]
        });
        isBrowserReady = true;
        console.log('✅ Browser Puppeteer iniciado com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao iniciar browser:', error);
        isBrowserReady = false;
    }
}

// Função para extrair data do texto - SUPER ROBUSTA
function extractDateFromText(texto) {
    if (!texto || typeof texto !== 'string') return null;
    
    // Múltiplos padrões de data - SUPER ROBUSTOS
    const datePatterns = [
        // dd/mm/yyyy ou dd-mm-yyyy
        /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
        // dd/mm/yy ou dd-mm-yy
        /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})/,
        // yyyy-mm-dd
        /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
        // dd.mm.yyyy
        /(\d{1,2})\.(\d{1,2})\.(\d{4})/,
        // dd.mm.yy
        /(\d{1,2})\.(\d{1,2})\.(\d{2})/,
        // yyyy.mm.dd
        /(\d{4})\.(\d{1,2})\.(\d{1,2})/,
        // dd de mês de yyyy (português)
        /(\d{1,2})\s+de\s+(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s+de\s+(\d{4})/i,
        // mês de yyyy
        /(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s+de\s+(\d{4})/i,
        // apenas ano (quando isolado)
        /\b(19[0-9]{2}|20[0-9]{2})\b/,
        // Padrões específicos do SESC
        /Data abertura:\s*(\d{2}\/\d{2}\/\d{4})/i,
        /Data atualização:\s*(\d{2}\/\d{2}\/\d{4})/i,
        /adicionado em\s*(\d{2}\/\d{2}\/\d{4})/i,
        /(\d{2}\/\d{2}\/\d{4})\s*às\s*\d{2}:\d{2}/i,
        // Padrões de licitação
        /(licitação|edital|concorrência|pregão)\s+(de|em|para)\s+(\d{2}\/\d{2}\/\d{4})/i
    ];
    
    for (let i = 0; i < datePatterns.length; i++) {
        const pattern = datePatterns[i];
        const match = texto.match(pattern);
        if (match) {
            console.log(`✅ Padrão ${i + 1} encontrado:`, match[0]);
            
            // Para padrões com mês por extenso, converter para formato padrão
            if (pattern.source.includes('janeiro|fevereiro')) {
                if (match.length === 4) {
                    // dd de mês de yyyy
                    const mes = getMonthNumber(match[2]);
                    const result = `${match[1]}/${mes}/${match[3]}`;
                    console.log(`📅 Data convertida: ${match[0]} → ${result}`);
                    return result;
                } else if (match.length === 3) {
                    // mês de yyyy
                    const mes = getMonthNumber(match[1]);
                    const result = `01/${mes}/${match[2]}`;
                    console.log(`📅 Data convertida: ${match[0]} → ${result}`);
                    return result;
                }
            } else if (pattern.source.includes('19[0-9]{2}|20[0-9]{2}')) {
                // Apenas ano encontrado
                const result = `01/01/${match[1]}`;
                console.log(`📅 Ano convertido: ${match[1]} → ${result}`);
                return result;
            } else if (pattern.source.includes('Data abertura|Data atualização|adicionado em')) {
                // Padrões específicos do SESC
                const result = match[1];
                console.log(`📅 Data SESC encontrada: ${match[0]} → ${result}`);
                return result;
            } else if (pattern.source.includes('às')) {
                // Data com horário
                const result = match[1];
                console.log(`📅 Data com horário encontrada: ${match[0]} → ${result}`);
                return result;
            } else if (pattern.source.includes('licitação|edital|concorrência|pregão')) {
                // Data em contexto de licitação
                const result = match[3];
                console.log(`📅 Data de licitação encontrada: ${match[0]} → ${result}`);
                return result;
            } else {
                // Padrões numéricos padrão
                console.log(`📅 Data encontrada: ${match[0]}`);
                return match[0];
            }
        }
    }
    
    return null;
}

// Função auxiliar para converter nome do mês para número
function getMonthNumber(monthName) {
    const months = {
        'janeiro': '01', 'fevereiro': '02', 'março': '03', 'abril': '04',
        'maio': '05', 'junho': '06', 'julho': '07', 'agosto': '08',
        'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12'
    };
    return months[monthName.toLowerCase()] || '01';
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Cache simples em memória
const cache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos

// Inicializar browser ao iniciar servidor
initBrowser();

// Endpoint para buscar editais
app.post('/api/search', async (req, res) => {
    const { sources, searchTerm } = req.body;
    const results = [];
    
    if (!isBrowserReady) {
        console.log('⚠️ Browser não está pronto, tentando reinicializar...');
        await initBrowser();
    }
    
    for (const source of sources) {
        try {
            console.log(`🔍 Buscando em: ${source.name} (${source.url})`);
            const sourceResults = await searchSourceWithPuppeteer(source, searchTerm);
            results.push(...sourceResults);
            console.log(`✅ ${sourceResults.length} resultados encontrados em ${source.name}`);
        } catch (error) {
            console.error(`❌ Erro ao buscar em ${source.name}:`, error.message);
            // Tentar busca alternativa com axios
            try {
                const fallbackResults = await searchSourceWithAxios(source, searchTerm);
                results.push(...fallbackResults);
                console.log(`🔄 Fallback: ${fallbackResults.length} resultados com axios`);
            } catch (fallbackError) {
                console.error(`❌ Fallback também falhou para ${source.name}:`, fallbackError.message);
            }
        }
    }
    
    console.log(`🎯 Total de resultados: ${results.length}`);
    res.json({ results });
});

// Função principal de busca com Puppeteer
async function searchSourceWithPuppeteer(source, searchTerm) {
    const cacheKey = `${source.url}-${searchTerm}`;
    
    // Verificar cache
    if (cache.has(cacheKey)) {
        const cached = cache.get(cacheKey);
        if (Date.now() - cached.timestamp < CACHE_DURATION) {
            console.log(`📋 Usando cache para ${source.name}`);
            return cached.data;
        }
    }
    
    const results = [];
    let page;
    
    try {
        // Criar nova página
        page = await browser.newPage();
        
        // Configurar viewport e user agent
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        // Configurar timeout e interceptar requests desnecessários
        await page.setDefaultTimeout(30000);
        await page.setRequestInterception(true);
        
        page.on('request', (req) => {
            if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });
        
        console.log(`🌐 Navegando para: ${source.url}`);
        
        // Navegar para a página
        await page.goto(source.url, { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        
        // Aguardar carregamento da página
        await page.waitForTimeout(2000);
        
        // Extrair conteúdo da página
        const pageContent = await page.evaluate(() => {
            return {
                title: document.title,
                html: document.documentElement.outerHTML,
                url: window.location.href
            };
        });
        
        // Usar Cheerio para parsear o HTML
        const $ = cheerio.load(pageContent.html);
        
        // Aplicar estratégias de busca específicas por site
        if (source.url.includes('culturaemercado.com.br')) {
            results.push(...parseCulturaEmMercado($, source, searchTerm));
        } else if (source.url.includes('prosas.com.br')) {
            results.push(...parseProsas($, source, searchTerm));
        } else if (source.url.includes('gov.br')) {
            results.push(...parseGovBr($, source, searchTerm));
        } else if (source.url.includes('fcc.sc.gov.br')) {
            results.push(...parseFCC($, source, searchTerm));
        } else if (source.url.includes('cultura.sc.gov.br')) {
            results.push(...parseCulturaSC($, source, searchTerm));
        } else if (source.url.includes('amfri.org.br')) {
            results.push(...parseAMFRI($, source, searchTerm));
        } else if (source.url.includes('sesc-sc.com.br')) {
            results.push(...parseSescSC($, source, searchTerm));
        } else {
            results.push(...parseGeneric($, source, searchTerm));
        }
        
        // Salvar no cache
        cache.set(cacheKey, {
            data: results,
            timestamp: Date.now()
        });
        
    } catch (error) {
        console.error(`❌ Erro no Puppeteer para ${source.name}:`, error.message);
        throw error;
    } finally {
        if (page) {
            await page.close();
        }
    }
    
    return results;
}

// Função de fallback com axios
async function searchSourceWithAxios(source, searchTerm) {
    console.log(`🔄 Tentando fallback com axios para ${source.name}`);
    
    try {
        const response = await axios.get(source.url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            },
            timeout: 15000
        });
        
        const $ = cheerio.load(response.data);
        
        // Aplicar estratégias de busca específicas por site
        if (source.url.includes('culturaemercado.com.br')) {
            return parseCulturaEmMercado($, source, searchTerm);
        } else if (source.url.includes('prosas.com.br')) {
            return parseProsas($, source, searchTerm);
        } else if (source.url.includes('gov.br')) {
            return parseGovBr($, source, searchTerm);
        } else if (source.url.includes('fcc.sc.gov.br')) {
            return parseFCC($, source, searchTerm);
        } else if (source.url.includes('cultura.sc.gov.br')) {
            return parseCulturaSC($, source, searchTerm);
        } else if (source.url.includes('amfri.org.br')) {
            return parseAMFRI($, source, searchTerm);
        } else if (source.url.includes('sesc-sc.com.br')) {
            return parseSescSC($, source, searchTerm);
        } else {
            return parseGeneric($, source, searchTerm);
        }
        
    } catch (error) {
        console.error(`❌ Fallback axios falhou para ${source.name}:`, error.message);
        return [];
    }
}

// Parser para Cultura em Mercado
function parseCulturaEmMercado($, source, searchTerm) {
    const results = [];
    const keywords = ['escultura', 'arte', 'visual', 'cultura', 'edital', 'exposição'];
    
    $('.post-item, .edital-item, article').each((index, element) => {
        const $el = $(element);
        const title = $el.find('h2, h3, .title').text().trim();
        const link = $el.find('a').attr('href');
        const excerpt = $el.find('.excerpt, .content, p').text().trim();
        const date = $el.find('.date, time').text().trim();
        
        const fullText = `${title} ${excerpt}`.toLowerCase();
        const hasKeyword = keywords.some(k => fullText.includes(k));
        const matchesSearch = searchTerm.split(' ').some(term => 
            fullText.includes(term.toLowerCase())
        );
        
        // BUSCA LIVRE: aceitar qualquer texto que contenha o termo de busca
        if (matchesSearch && link) {
            results.push({
                titulo: title || 'Edital sem título',
                link: link.startsWith('http') ? link : `${source.url}${link}`,
                fonte: new URL(source.url).hostname,
                trecho: excerpt.substring(0, 300) + '...',
                data: parseDate(date),
                tipo: 'web',
                palavraChave: keywords.find(k => fullText.includes(k)) || searchTerm
            });
        }
    });
    
    return results;
}

// Parser para Prosas
function parseProsas($, source, searchTerm) {
    const results = [];
    
    // Buscar editais na API do Prosas
    const apiUrl = 'https://prosas.com.br/api/v1/editais';
    
    $('.opportunity-card, .edital-card').each((index, element) => {
        const $el = $(element);
        const title = $el.find('.title, h3').text().trim();
        const link = $el.find('a').attr('href');
        const deadline = $el.find('.deadline').text().trim();
        const description = $el.find('.description').text().trim();
        
        if (title.toLowerCase().includes(searchTerm.toLowerCase())) {
            results.push({
                titulo: title,
                link: `https://prosas.com.br${link}`,
                fonte: 'prosas.com.br',
                trecho: description.substring(0, 300) + '...',
                data: deadline,
                tipo: 'web',
                palavraChave: 'edital'
            });
        }
    });
    
    return results;
}

// Parser para sites Gov.br - SUPER abrangente
function parseGovBr($, source, searchTerm) {
    const results = [];
    const searchLower = searchTerm.toLowerCase();
    
    // Lista expandida de palavras-chave para governo
    const govKeywords = [
        'edital', 'seleção', 'inscrição', 'cultura', 'arte', 'chamada', 'pública', 'publica', 'licitação', 
        'pregão', 'concorrência', 'concorrencia', 'credenciamento', 'oportunidade', 'programa', 'projeto', 
        'certame', 'residência', 'residencia', 'circuito', 'festival', 'mostra', 'exposição', 'exposicao', 
        'bienal', 'instalação', 'instalacao', 'escultura', 'visual', 'contemporânea', 'contemporanea', 
        'artístico', 'artistico', 'cultural', 'museu', 'galeria', 'curadoria', 'artista', 'criativo', 
        'inovação', 'inovacao', 'tecnologia', 'digital', 'multimídia', 'multimidia', 'performance', 
        'interativo', 'experimental', 'tradicional', 'popular', 'erudito', 'clássico', 'classico', 
        'moderno', 'pós-moderno', 'pos-moderno', 'vanguarda', 'emergente', 'estabelecido', 'herança', 
        'heranca', 'patrimônio', 'patrimonio', 'histórico', 'historico', 'sociedade', 'comunidade', 
        'educação', 'educacao', 'formação', 'formacao', 'capacitação', 'capacitacao', 'workshop', 
        'oficina', 'palestra', 'debate', 'seminário', 'seminario', 'congresso', 'encontro', 'colóquio', 
        'coloquio', 'simpósio', 'simposio', 'conferência', 'conferencia', 'apresentação', 'apresentacao',
        'fomento', 'incentivo', 'patrocínio', 'patrocinio', 'bolsa', 'prêmio', 'premio', 'auxílio', 'auxilio'
    ];
    
    // Buscar em TODOS os links (mais abrangente)
    $('a').each((index, element) => {
        const $el = $(element);
        const text = $el.text().trim();
        const href = $el.attr('href');
        
        if (text && href && text.length > 2 && text.length < 300) {
            const textLower = text.toLowerCase();
            
            // Verificar se contém termo de busca OU palavras-chave governamentais
            const matchesSearch = textLower.includes(searchLower);
            const hasGovKeyword = govKeywords.some(k => textLower.includes(k));
            
            // BUSCA LIVRE: aceitar qualquer texto que contenha o termo de busca
            if (matchesSearch) {
                const fullUrl = href.startsWith('http') ? href : 
                               href.startsWith('/') ? `${new URL(source.url).origin}${href}` : 
                               `${source.url}/${href}`;
                
                // Tentar extrair data real do texto
                const extractedDate = extractDateFromText(text);
                
                results.push({
                    titulo: text,
                    link: fullUrl,
                    fonte: new URL(source.url).hostname,
                    trecho: `Link encontrado: ${text}`,
                    data: extractedDate || 'Data não encontrada',
                    tipo: href.endsWith('.pdf') ? 'pdf' : 'web',
                    palavraChave: hasGovKeyword ? 'governamental' : searchTerm
                });
            }
        }
    });
    
    // Buscar em TODOS os textos (mais abrangente)
    $('p, li, article, section, div, span, h1, h2, h3, h4, h5, h6, .titulo, .title, .headline, .content, .text, .noticia, .news-item').each((index, element) => {
        const $el = $(element);
        const text = $el.text().trim();
        
        if (text.length > 15 && text.length < 800) {
            const textLower = text.toLowerCase();
            const matchesSearch = textLower.includes(searchLower);
            const hasGovKeyword = govKeywords.some(k => textLower.includes(k));
            
            if (matchesSearch || hasGovKeyword) {
                // Tentar encontrar link próximo
                const nearbyLink = $el.find('a').first() || $el.closest('a');
                const link = nearbyLink.length > 0 ? nearbyLink.attr('href') : source.url;
                
                // Tentar extrair data real do texto
                const extractedDate = extractDateFromText(text);
                
                results.push({
                    titulo: text.substring(0, 150) + '...',
                    link: link.startsWith('http') ? link : `${source.url}${link}`,
                    fonte: new URL(source.url).hostname,
                    trecho: text.substring(0, 400) + '...',
                    data: extractedDate || 'Data não encontrada',
                    tipo: 'web',
                    palavraChave: hasGovKeyword ? 'governamental' : searchTerm
                });
            }
        }
    });
    
    // Buscar em documentos e arquivos
    $('a[href*=".pdf"], a[href*=".doc"], a[href*=".docx"]').each((index, element) => {
        const $el = $(element);
        const text = $el.text().trim();
        const href = $el.attr('href');
        
        if (text && href) {
            const textLower = text.toLowerCase();
            const matchesSearch = textLower.includes(searchLower);
            const hasGovKeyword = govKeywords.some(k => textLower.includes(k));
            
            if (matchesSearch || hasGovKeyword) {
                const fullUrl = href.startsWith('http') ? href : 
                               href.startsWith('/') ? `${new URL(source.url).origin}${href}` : 
                               `${source.url}/${href}`;
                
                const fileType = href.toLowerCase().includes('.pdf') ? 'pdf' : 
                               href.toLowerCase().includes('.doc') ? 'doc' : 'web';
                
                // Tentar extrair data real do texto
                const extractedDate = extractDateFromText(text);
                
                results.push({
                    titulo: `Documento: ${text}`,
                    link: fullUrl,
                    fonte: new URL(source.url).hostname,
                    trecho: `Documento encontrado: ${text}`,
                    data: extractedDate || 'Data não encontrada',
                    tipo: fileType,
                    palavraChave: hasGovKeyword ? 'documento' : searchTerm
                });
            }
        }
    });
    
    return results.slice(0, 35); // Aumentar muito o limite
}

// Parser para FCC SC - Busca mais abrangente
function parseFCC($, source, searchTerm) {
    const results = [];
    const searchLower = searchTerm.toLowerCase();
    
    // Buscar em TODOS os links que contenham o termo de busca
    $('a').each((index, element) => {
        const $el = $(element);
        const text = $el.text().trim();
        const href = $el.attr('href');
        
        if (text && href && text.length > 3 && text.length < 200) {
            const textLower = text.toLowerCase();
            
            // Verificar se contém termo de busca OU palavras-chave culturais
            const matchesSearch = textLower.includes(searchLower);
            const hasCulturalKeyword = ['cultura', 'arte', 'edital', 'seleção', 'chamada', 'prêmio', 'bolsa', 'fomento', 'incentivo', 'patrocínio', 'licitação', 'pregão', 'concorrência', 'credenciamento', 'oportunidade', 'programa', 'projeto', 'certame', 'residência', 'circuito', 'festival', 'mostra', 'exposição', 'bienal', 'instalação', 'escultura', 'visual', 'contemporânea', 'contemporanea'].some(k => textLower.includes(k));
            
            if (matchesSearch || hasCulturalKeyword) {
                const fullUrl = href.startsWith('http') ? href : 
                               href.startsWith('/') ? `${new URL(source.url).origin}${href}` : 
                               `${source.url}/${href}`;
                
                // Tentar extrair data real do texto
                const extractedDate = extractDateFromText(text);
                
                results.push({
                    titulo: text,
                    link: fullUrl,
                    fonte: new URL(source.url).hostname,
                    trecho: `Link encontrado: ${text}`,
                    data: extractedDate || 'Data não encontrada',
                    tipo: href.endsWith('.pdf') ? 'pdf' : 'web',
                    palavraChave: hasCulturalKeyword ? 'cultural' : searchTerm
                });
            }
        }
    });
    
    // Buscar em textos e parágrafos
    $('p, li, article, section, div, span').each((index, element) => {
        const $el = $(element);
        const text = $el.text().trim();
        
        if (text.length > 20 && text.length < 1000) {
            const textLower = text.toLowerCase();
            const matchesSearch = textLower.includes(searchLower);
            const hasCulturalKeyword = ['cultura', 'arte', 'edital', 'seleção', 'chamada', 'prêmio', 'bolsa', 'fomento', 'incentivo', 'patrocínio', 'licitação', 'pregão', 'concorrência', 'credenciamento', 'oportunidade', 'programa', 'projeto', 'certame', 'residência', 'circuito', 'festival', 'mostra', 'exposição', 'bienal', 'instalação', 'escultura', 'visual', 'contemporânea', 'contemporanea'].some(k => textLower.includes(k));
            
            if (matchesSearch || hasCulturalKeyword) {
                // Tentar encontrar link próximo
                const nearbyLink = $el.find('a').first() || $el.closest('a');
                const link = nearbyLink.length > 0 ? nearbyLink.attr('href') : source.url;
                
                // Tentar extrair data real do texto
                const extractedDate = extractDateFromText(text);
                
                results.push({
                    titulo: text.substring(0, 120) + '...',
                    link: link.startsWith('http') ? link : `${source.url}${link}`,
                    fonte: new URL(source.url).hostname,
                    trecho: text.substring(0, 300) + '...',
                    data: extractedDate || 'Data não encontrada',
                    tipo: 'web',
                    palavraChave: hasCulturalKeyword ? 'cultural' : searchTerm
                });
            }
        }
    });
    
    // Buscar em títulos e cabeçalhos
    $('h1, h2, h3, h4, h5, h6, .titulo, .title, .headline').each((index, element) => {
        const $el = $(element);
        const text = $el.text().trim();
        
        if (text.length > 5 && text.length < 200) {
            const textLower = text.toLowerCase();
            const matchesSearch = textLower.includes(searchLower);
            const hasCulturalKeyword = ['cultura', 'arte', 'edital', 'seleção', 'chamada', 'prêmio', 'bolsa', 'fomento', 'incentivo', 'patrocínio', 'licitação', 'pregão', 'concorrência', 'credenciamento', 'oportunidade', 'programa', 'projeto', 'certame', 'residência', 'circuito', 'festival', 'mostra', 'exposição', 'bienal', 'instalação', 'escultura', 'visual', 'contemporânea', 'contemporanea'].some(k => textLower.includes(k));
            
            if (matchesSearch || hasCulturalKeyword) {
                // Tentar encontrar link próximo
                const nearbyLink = $el.find('a').first() || $el.closest('a');
                const link = nearbyLink.length > 0 ? nearbyLink.attr('href') : source.url;
                
                // Tentar extrair data real do texto
                const extractedDate = extractDateFromText(text);
                
                results.push({
                    titulo: text,
                    link: link.startsWith('http') ? link : `${source.url}${link}`,
                    fonte: new URL(source.url).hostname,
                    trecho: `Título encontrado: ${text}`,
                    data: extractedDate || 'Data não encontrada',
                    tipo: 'web',
                    palavraChave: hasCulturalKeyword ? 'cultural' : searchTerm
                });
            }
        }
    });
    
    return results.slice(0, 25); // Aumentar limite
}

// Parser para Cultura SC
function parseCulturaSC($, source, searchTerm) {
    const results = [];
    
    // Buscar em editais e oportunidades
    $('.edital, .oportunidade, .chamada, [class*="edital"]').each((index, element) => {
        const $el = $(element);
        const title = $el.find('h2, h3, .titulo').text().trim();
        const link = $el.find('a').attr('href');
        const content = $el.text().trim();
        
        if (title && link) {
            // Tentar extrair data real do conteúdo
            const extractedDate = extractDateFromText(content);
            
            results.push({
                titulo: title,
                link: link.startsWith('http') ? link : `${source.url}${link}`,
                fonte: new URL(source.url).hostname,
                trecho: content.substring(0, 300) + '...',
                data: extractedDate || 'Data não encontrada',
                tipo: 'web',
                palavraChave: 'edital'
            });
        }
    });
    
    return results.slice(0, 15);
}

// Parser para AMFRI
function parseAMFRI($, source, searchTerm) {
    const results = [];
    
    // Buscar em páginas de cultura
    $('.pagina-47428, [class*="cultura"], [class*="edital"]').each((index, element) => {
        const $el = $(element);
        const title = $el.find('h1, h2, h3, .titulo').text().trim();
        const content = $el.text().trim();
        
        if (title && content.length > 50) {
            // Tentar extrair data real do conteúdo
            const extractedDate = extractDateFromText(content);
            
            results.push({
                titulo: title,
                link: source.url,
                fonte: new URL(source.url).hostname,
                trecho: content.substring(0, 300) + '...',
                data: extractedDate || 'Data não encontrada',
                tipo: 'web',
                palavraChave: 'cultura'
            });
        }
    });
    
    return results.slice(0, 10);
}

// Parser específico para SESC SC - SUPER PRECISO
function parseSescSC($, source, searchTerm) {
    const results = [];
    const searchLower = searchTerm.toLowerCase();
    
    console.log(`🔍 Parsing SESC SC para termo: "${searchTerm}"`);
    
    // Buscar especificamente em licitações
    $('.licitacao-item, [class*="licitacao"], .edital-item, [class*="edital"]').each((index, element) => {
        const $el = $(element);
        const title = $el.find('h3, h4, .titulo, strong').text().trim();
        const content = $el.text().trim();
        
        if (title && content.length > 20) {
            // Verificar se realmente contém o termo de busca
            const contentLower = content.toLowerCase();
            const hasSearchTerm = searchLower.split(' ').some(term => 
                term.length > 2 && contentLower.includes(term.toLowerCase())
            );
            
            if (hasSearchTerm) {
                // Extrair data específica do SESC
                let extractedDate = null;
                
                // Padrões específicos do SESC
                const datePatterns = [
                    /Data abertura:\s*(\d{2}\/\d{2}\/\d{4})/i,
                    /Data atualização:\s*(\d{2}\/\d{2}\/\d{4})/i,
                    /adicionado em\s*(\d{2}\/\d{2}\/\d{4})/i,
                    /(\d{2}\/\d{2}\/\d{4})\s*às\s*\d{2}:\d{2}/i
                ];
                
                for (const pattern of datePatterns) {
                    const match = content.match(pattern);
                    if (match) {
                        extractedDate = match[1];
                        console.log(`📅 Data SESC encontrada: ${extractedDate}`);
                        break;
                    }
                }
                
                // Se não encontrou data específica, tentar extrair do texto
                if (!extractedDate) {
                    extractedDate = extractDateFromText(content);
                }
                
                console.log(`✅ Licitação SESC encontrada: "${title.substring(0, 50)}..." | Data: ${extractedDate || 'não encontrada'}`);
                
                results.push({
                    titulo: title,
                    link: source.url,
                    fonte: new URL(source.url).hostname,
                    trecho: content.substring(0, 400) + '...',
                    data: extractedDate || 'Data não encontrada',
                    tipo: 'web',
                    palavraChave: 'licitação'
                });
            }
        }
    });
    
    // Se não encontrou licitações específicas, buscar em todo o conteúdo
    if (results.length === 0) {
        console.log(`⚠️ Nenhuma licitação específica encontrada, buscando em todo o conteúdo`);
        
        $('p, div, span').each((index, element) => {
            const $el = $(element);
            const text = $el.text().trim();
            
            if (text.length > 30 && text.length < 800) {
                const textLower = text.toLowerCase();
                const hasSearchTerm = searchLower.split(' ').some(term => 
                    term.length > 2 && textLower.includes(term.toLowerCase())
                );
                
                if (hasSearchTerm) {
                    // Extrair data
                    const extractedDate = extractDateFromText(text);
                    
                    results.push({
                        titulo: text.substring(0, 100) + '...',
                        link: source.url,
                        fonte: new URL(source.url).hostname,
                        trecho: text.substring(0, 300) + '...',
                        data: extractedDate || 'Data não encontrada',
                        tipo: 'web',
                        palavraChave: 'conteúdo'
                    });
                }
            }
        });
    }
    
    console.log(`📊 Total de resultados SESC SC: ${results.length}`);
    return results.slice(0, 25);
}

// Busca alternativa quando scraping falha
async function searchAlternative(source, searchTerm) {
    const results = [];
    
    // Criar resultado genérico para navegação
    results.push({
        titulo: `Navegar em ${source.name}`,
        link: source.url,
        fonte: new URL(source.url).hostname,
        trecho: `Acesse o site para buscar editais relacionados a "${searchTerm}"`,
        data: 'Data não encontrada',
        tipo: 'web',
        palavraChave: 'navegação'
    });
    
    return results;
}

// Parser genérico SUPER abrangente
function parseGeneric($, source, searchTerm) {
    const results = [];
    const searchLower = searchTerm.toLowerCase();
    
    // Lista expandida de palavras-chave culturais
    const culturalKeywords = [
        'edital', 'cultura', 'arte', 'seleção', 'inscrição', 'chamada', 'prêmio', 'bolsa', 'fomento', 
        'incentivo', 'patrocínio', 'licitação', 'pregão', 'concorrência', 'credenciamento', 'oportunidade', 
        'programa', 'projeto', 'certame', 'residência', 'circuito', 'festival', 'mostra', 'exposição', 
        'bienal', 'instalação', 'escultura', 'visual', 'contemporânea', 'contemporanea', 'artístico', 
        'artistico', 'cultural', 'museu', 'galeria', 'curadoria', 'artista', 'criativo', 'inovação', 
        'inovacao', 'tecnologia', 'digital', 'multimídia', 'multimidia', 'performance', 'interativo', 
        'interativo', 'experimental', 'tradicional', 'popular', 'erudito', 'clássico', 'classico', 
        'moderno', 'pós-moderno', 'pos-moderno', 'vanguarda', 'emergente', 'estabelecido', 'herança', 
        'heranca', 'patrimônio', 'patrimonio', 'histórico', 'historico', 'sociedade', 'comunidade', 
        'educação', 'educacao', 'formação', 'formacao', 'capacitação', 'capacitacao', 'workshop', 
        'oficina', 'palestra', 'debate', 'seminário', 'seminario', 'congresso', 'encontro', 'colóquio', 
        'coloquio', 'simpósio', 'simposio', 'conferência', 'conferencia', 'apresentação', 'apresentacao'
    ];
    
    // Buscar em TODOS os links (mais abrangente)
    $('a').each((index, element) => {
        const $el = $(element);
        const text = $el.text().trim();
        const href = $el.attr('href');
        
        if (text && href && text.length > 2 && text.length < 300) {
            const textLower = text.toLowerCase();
            
            // BUSCA LIVRE: aceitar qualquer texto que contenha o termo de busca
            const matchesSearch = textLower.includes(searchLower);
            const hasCulturalKeyword = culturalKeywords.some(k => textLower.includes(k));
            
            if (matchesSearch) {
                const fullUrl = href.startsWith('http') ? href : 
                               href.startsWith('/') ? `${new URL(source.url).origin}${href}` : 
                               `${source.url}/${href}`;
                
                // Tentar extrair data real do texto
                const extractedDate = extractDateFromText(text);
                
                results.push({
                    titulo: text,
                    link: fullUrl,
                    fonte: new URL(source.url).hostname,
                    trecho: `Link encontrado: ${text}`,
                    data: extractedDate || 'Data não encontrada',
                    tipo: href.endsWith('.pdf') ? 'pdf' : 'web',
                    palavraChave: hasCulturalKeyword ? 'cultural' : searchTerm
                });
            }
        }
    });
    
    // Buscar em TODOS os textos (mais abrangente)
    $('p, li, article, section, div, span, h1, h2, h3, h4, h5, h6, .titulo, .title, .headline, .content, .text').each((index, element) => {
        const $el = $(element);
        const text = $el.text().trim();
        
        if (text.length > 15 && text.length < 800) {
            const textLower = text.toLowerCase();
            const matchesSearch = textLower.includes(searchLower);
            const hasCulturalKeyword = culturalKeywords.some(k => textLower.includes(k));
            
            if (matchesSearch || hasCulturalKeyword) {
                // Tentar encontrar link próximo
                const nearbyLink = $el.find('a').first() || $el.closest('a');
                const link = nearbyLink.length > 0 ? nearbyLink.attr('href') : source.url;
                
                // Tentar extrair data real do texto
                const extractedDate = extractDateFromText(text);
                
                results.push({
                    titulo: text.substring(0, 150) + '...',
                    link: link.startsWith('http') ? link : `${source.url}${link}`,
                    fonte: new URL(source.url).hostname,
                    trecho: text.substring(0, 400) + '...',
                    data: extractedDate || 'Data não encontrada',
                    tipo: 'web',
                    palavraChave: hasCulturalKeyword ? 'cultural' : searchTerm
                });
            }
        }
    });
    
    // Buscar em atributos alt e title das imagens
    $('img').each((index, element) => {
        const $el = $(element);
        const alt = $el.attr('alt') || '';
        const title = $el.attr('title') || '';
        const text = alt || title;
        
        if (text && text.length > 5) {
            const textLower = text.toLowerCase();
            const matchesSearch = textLower.includes(searchLower);
            const hasCulturalKeyword = culturalKeywords.some(k => textLower.includes(k));
            
            if (matchesSearch || hasCulturalKeyword) {
                // Tentar encontrar link próximo
                const nearbyLink = $el.closest('a');
                const link = nearbyLink.length > 0 ? nearbyLink.attr('href') : source.url;
                
                // Tentar extrair data real do contexto da imagem
                const parentText = $el.parent().text();
                const extractedDate = extractDateFromText(text) || extractDateFromText(parentText);
                
                results.push({
                    titulo: `Imagem: ${text}`,
                    link: link.startsWith('http') ? link : `${source.url}${link}`,
                    fonte: new URL(source.url).hostname,
                    trecho: `Descrição da imagem: ${text}`,
                    data: extractedDate || 'Data não encontrada',
                    tipo: 'web',
                    palavraChave: hasCulturalKeyword ? 'cultural' : searchTerm
                });
            }
        }
    });
    
    return results.slice(0, 30); // Aumentar muito o limite
}

// Função auxiliar para parse de datas
function parseDate(dateStr) {
    if (!dateStr) return 'Data não encontrada';
    
    // Tentar diferentes formatos de data
    const formats = [
        /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
        /(\d{1,2})-(\d{1,2})-(\d{4})/,
        /(\d{4})-(\d{1,2})-(\d{1,2})/
    ];
    
    for (const format of formats) {
        const match = dateStr.match(format);
        if (match) {
            return dateStr;
        }
    }
    
    return dateStr;
}

// Endpoint para buscar em APIs específicas
app.get('/api/search-apis', async (req, res) => {
    const { term } = req.query;
    const results = [];
    
    // API do Portal da Transparência (exemplo)
    try {
        // Aqui você pode adicionar chamadas para APIs reais
        // Por exemplo: API do DOU, API de portais de transparência, etc.
    } catch (error) {
        console.error('Erro ao buscar em APIs:', error);
    }
    
    res.json({ results });
});

// Servir a aplicação
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log('Acesse a aplicação e faça buscas reais por editais!');
});
