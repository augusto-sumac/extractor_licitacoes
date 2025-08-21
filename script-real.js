// Configuração das fontes de busca
const SOURCES = [
    // Fontes Federais
    { id: 'rouanet', name: "Lei Rouanet", url: "https://www.gov.br/rouanet", active: true, category: "federal" },
    { id: 'fnc', name: "Fundo Nacional de Cultura", url: "https://www.gov.br/cultura/pt-br/assuntos/fnc", active: true, category: "federal" },
    { id: 'funarte', name: "FUNARTE - Artes Visuais", url: "https://www.gov.br/funarte/editais-arte-visual", active: true, category: "federal" },
    { id: 'funarte-editais', name: "FUNARTE - Editais", url: "https://www.gov.br/funarte/pt-br/editais-1", active: true, category: "federal" },
    { id: 'cultura-viva', name: "Cultura Viva", url: "https://www.gov.br/cultura/pt-br/cultura-viva", active: true, category: "federal" },
    { id: 'iphan', name: "IPHAN", url: "https://www.gov.br/iphan", active: true, category: "federal" },
    { id: 'iphan-editais', name: "IPHAN - Editais", url: "https://www.gov.br/iphan/editais", active: true, category: "federal" },
    { id: 'minc', name: "Ministério da Cultura", url: "https://www.gov.br/cultura", active: true, category: "federal" },
    { id: 'salic', name: "SALIC", url: "https://www.gov.br/cultura/pt-br/assuntos/salic", active: true, category: "federal" },
    { id: 'bndes', name: "BNDES Cultural", url: "https://www.bndes.gov.br", active: true, category: "federal" },
    
    // Fontes Estaduais SC
    { id: 'gov-sc', name: "Governo SC", url: "https://estado.sc.gov.br", active: true, category: "estadual" },
    { id: 'cultura-sc', name: "Cultura SC", url: "https://www.cultura.sc.gov.br/", active: true, category: "estadual" },
    { id: 'fcc-sc', name: "FCC SC", url: "https://www.fcc.sc.gov.br", active: true, category: "estadual" },
    { id: 'transparencia-sc', name: "Transparência SC", url: "https://www.transparencia.sc.gov.br/", active: true, category: "estadual" },
    
    // Plataformas de Editais
    { id: 'cultura-presente', name: "Cultura Presente", url: "https://culturapresente.com.br/editais-culturais/", active: true, category: "plataforma" },
    { id: 'cultura-mercado', name: "Cultura em Mercado", url: "https://culturaemercado.com.br/editais/", active: true, category: "plataforma" },
    { id: 'prosas', name: "Prosas", url: "https://prosas.com.br/editais", active: true, category: "plataforma" },
    { id: 'premio-pipa', name: "Prêmio PIPA", url: "https://www.premiopipa.com/", active: true, category: "plataforma" },
    { id: 'cultura-catarina', name: "Cultura Catarina", url: "https://culturacatarina.com.br", active: true, category: "plataforma" },
    
    // Associações Regionais
    { id: 'amfri', name: "AMFRI", url: "https://amfri.org.br", active: true, category: "regional" },
    { id: 'amfri-cultura', name: "AMFRI - Cultura", url: "https://amfri.org.br/pagina-47428/", active: true, category: "regional" },
    { id: 'amavi', name: "AMAVI", url: "https://www.amavi.org.br", active: true, category: "regional" },
    { id: 'amosc', name: "AMOSC", url: "https://www.amosc.org.br", active: true, category: "regional" },
    
    // Municípios - Fundações Culturais
    { id: 'itajai', name: "Fundação Cultural Itajaí", url: "https://fundacaocultural.itajai.sc.gov.br/", active: true, category: "municipal" },
    { id: 'camboriu', name: "Camboriú", url: "https://camboriu.sc.gov.br/", active: true, category: "municipal" },
    { id: 'bombinhas', name: "Bombinhas", url: "https://bombinhas.sc.gov.br", active: true, category: "municipal" },
    { id: 'itapema', name: "Itapema", url: "https://itapema.sc.gov.br", active: true, category: "municipal" },
    { id: 'navegantes', name: "Navegantes", url: "https://navegantes.sc.gov.br/", active: true, category: "municipal" },
    
    // SESC
    { id: 'sesc-sc', name: "SESC SC - Licitações", url: "https://sesc-sc.com.br/sobre-o-sesc/licitacoes", active: true, category: "sesc" }
];

// Palavras-chave de REFERÊNCIA para identificar conteúdo cultural (não restritivas)
const KEYWORDS_REFERENCIA = [
    // Editais e oportunidades
    "edital", "seleção", "processo seletivo", "inscrição", "prêmio", "premio", 
    "bolsa", "fomento", "incentivo", "patrocínio", "licitação", "pregão", 
    "concorrência", "credenciamento", "oportunidade", "programa", "projeto", 
    "certame", "chamada", "residência", "circuito", "festival", "mostra",
    "concurso", "apresentação de propostas", "manifestação de interesse",
    
    // Cultura e artes (incluindo escultura e artes visuais)
    "cultura", "cultural", "artes visuais", "escultura", "estatua", "estatueta",
    "relevo", "trofeu", "monumental", "monumento", "site-specific", "modelagem",
    "busto", "torso", "tridimensional", "exposição", "acervo", "bienal", 
    "3D", "arte", "artista", "curadoria", "galeria", "museu", "instalação",
    "arte tridimensional", "arte contemporânea", "arte moderna", "arte pública"
];

// NOTA: O sistema agora permite busca LIVRE por qualquer termo
// As palavras-chave acima são usadas apenas para identificar e categorizar resultados
// mas NÃO restringem a busca - o usuário pode buscar por qualquer palavra

// Estado da aplicação
let searchResults = [];
let isSearching = false;
let currentPage = 1;
const resultsPerPage = 10;

// Elementos do DOM
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const filterSC = document.getElementById('filterSC');
const filterNacional = document.getElementById('filterNacional');
const filterType = document.getElementById('filterType');
const dateFrom = document.getElementById('dateFrom');
const dateTo = document.getElementById('dateTo');
const datePreset = document.getElementById('datePreset');
const sourcesList = document.getElementById('sourcesList');
const resultsContainer = document.getElementById('resultsContainer');
const resultsCount = document.getElementById('resultsCount');
const loadingIndicator = document.getElementById('loadingIndicator');
const exportCSV = document.getElementById('exportCSV');
const exportJSON = document.getElementById('exportJSON');
const pagination = document.getElementById('pagination');
const selectAllSources = document.getElementById('selectAllSources');
const deselectAllSources = document.getElementById('deselectAllSources');

// Verificar se está rodando com servidor ou não
const IS_SERVER_MODE = window.location.protocol !== 'file:';
const API_BASE = IS_SERVER_MODE ? '' : 'http://localhost:3000';
const API_ROBUSTA = 'http://localhost:3000'; // Servidor robusto

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    renderSources();
    setupEventListeners();
    setupFilterListeners();
});

// Renderizar lista de fontes com checkboxes
function renderSources() {
    sourcesList.innerHTML = SOURCES.map(source => `
        <label class="source-item ${source.active ? 'active' : ''}">
            <input type="checkbox" 
                   id="source-${source.id}" 
                   value="${source.id}" 
                   ${source.active ? 'checked' : ''}>
            ${source.name}
        </label>
    `).join('');
}

// Configurar event listeners
function setupEventListeners() {
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    exportCSV.addEventListener('click', () => exportResults('csv'));
    exportJSON.addEventListener('click', () => exportResults('json'));
    
    // Controles de seleção de fontes
    selectAllSources.addEventListener('click', () => {
        document.querySelectorAll('#sourcesList input[type="checkbox"]').forEach(cb => {
            cb.checked = true;
            cb.parentElement.classList.add('active');
        });
    });
    
    deselectAllSources.addEventListener('click', () => {
        document.querySelectorAll('#sourcesList input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
            cb.parentElement.classList.remove('active');
        });
    });
    
    // Listener para checkboxes individuais
    sourcesList.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
            if (e.target.checked) {
                e.target.parentElement.classList.add('active');
            } else {
                e.target.parentElement.classList.remove('active');
            }
        }
    });
    
    // Listener para seletor de período
    datePreset.addEventListener('change', (e) => {
        const value = e.target.value;
        const today = new Date();
        let fromDate = new Date();
        let toDate = new Date();
        
        switch(value) {
            case 'today':
                fromDate = new Date(today);
                toDate = new Date(today);
                break;
            case 'week':
                fromDate.setDate(today.getDate() - 7);
                toDate = new Date(today);
                break;
            case 'month':
                fromDate.setDate(today.getDate() - 30);
                toDate = new Date(today);
                break;
            case 'quarter':
                fromDate.setMonth(today.getMonth() - 3);
                toDate = new Date(today);
                break;
            case 'year':
                fromDate.setFullYear(today.getFullYear() - 1);
                toDate = new Date(today);
                break;
            case 'recent':
                fromDate.setFullYear(today.getFullYear() - 5);
                toDate = new Date(today);
                break;
            case 'historic':
                fromDate = new Date('1900-01-01');
                toDate = new Date('2019-12-31');
                break;
            case 'all':
                dateFrom.value = '';
                dateTo.value = '';
                return;
            default:
                // Verificar se é um ano específico (2000, 2001, etc.)
                if (/^\d{4}$/.test(value)) {
                    const year = parseInt(value);
                    fromDate = new Date(year, 0, 1); // 1º de janeiro
                    toDate = new Date(year, 11, 31); // 31 de dezembro
                } else {
                    dateFrom.value = '';
                    dateTo.value = '';
                    return;
                }
                break;
        }
        
        // Formatar datas para input
        dateFrom.value = fromDate.toISOString().split('T')[0];
        dateTo.value = toDate.toISOString().split('T')[0];
        
        // Aplicar filtros automaticamente se houver resultados
        if (window.originalSearchResults && window.originalSearchResults.length > 0) {
            setTimeout(() => applyFiltersAndRender(), 100);
        }
    });
    
    // Trigger inicial para definir últimos 30 dias
    datePreset.dispatchEvent(new Event('change'));
    
    // Adicionar listeners dos filtros
    setupFilterListeners();
}

// Buscar em uma fonte específica
async function searchSource(source, searchTerm) {
    try {
        // Se tiver servidor rodando, usar busca robusta
        if (IS_SERVER_MODE || window.location.hostname === 'localhost') {
            try {
                console.log(`🔍 Tentando servidor robusto: ${source.name}`);
                
                const response = await fetch(`${API_ROBUSTA}/api/search`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        sources: [source],
                        searchTerm: searchTerm
                    })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log(`✅ Servidor robusto: ${data.results.length} resultados de ${source.name}`);
                    return data.results || [];
                } else {
                    console.log(`⚠️ Servidor robusto falhou (${response.status}), tentando servidor padrão`);
                }
            } catch (error) {
                console.log(`⚠️ Erro no servidor robusto: ${error.message}, tentando servidor padrão`);
            }
            
            // Fallback para servidor padrão
            try {
                const response = await fetch(`${API_BASE}/api/search`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        sources: [source],
                        searchTerm: searchTerm
                    })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log(`✅ Servidor padrão: ${data.results.length} resultados de ${source.name}`);
                    return data.results || [];
                }
            } catch (error) {
                console.log('Servidor padrão não disponível, usando busca alternativa');
            }
        }
        
        // Fallback: Busca usando proxy CORS público
        return await searchWithCORSProxy(source, searchTerm);
    } catch (error) {
        console.error(`Erro ao buscar em ${source.name}:`, error);
        return [];
    }
}

// Configurar listeners dos filtros
function setupFilterListeners() {
    // Filtros de localização
    filterSC.addEventListener('change', applyFiltersAndRender);
    filterNacional.addEventListener('change', applyFiltersAndRender);
    
    // Filtro de tipo
    filterType.addEventListener('change', applyFiltersAndRender);
    
    // Filtros de data
    dateFrom.addEventListener('change', applyFiltersAndRender);
    dateTo.addEventListener('change', applyFiltersAndRender);
}

// Aplicar filtros e re-renderizar
function applyFiltersAndRender() {
    if (window.originalSearchResults && window.originalSearchResults.length > 0) {
        // Restaurar resultados originais
        searchResults = [...window.originalSearchResults];
        
        // Aplicar filtros
        applyFilters();
        
        // Re-renderizar
        renderResults();
        renderPagination();
        
        // Atualizar contador
        updateResultsCount(searchResults.length);
        
        console.log('Filtros aplicados em tempo real');
    }
}

// Busca usando proxy CORS público - SUPER abrangente
async function searchWithCORSProxy(source, searchTerm) {
    const results = [];
    
    // Múltiplos proxies para tentar
    const proxies = [
        'https://api.allorigins.win/get?url=',
        'https://cors-anywhere.herokuapp.com/',
        'https://thingproxy.freeboard.io/fetch/',
        'https://cors.bridged.cc/',
        'https://api.codetabs.com/v1/proxy?quest='
    ];
    
    for (const proxy of proxies) {
        try {
            console.log(`Tentando proxy: ${proxy}`);
            
            let response;
            if (proxy.includes('allorigins')) {
                response = await fetch(proxy + encodeURIComponent(source.url));
                const data = await response.json();
                if (data.contents) {
                    results.push(...parseHTMLContent(data.contents, source, searchTerm));
                }
            } else if (proxy.includes('codetabs')) {
                response = await fetch(proxy + source.url);
                const html = await response.text();
                results.push(...parseHTMLContent(html, source, searchTerm));
            } else {
                response = await fetch(proxy + source.url);
                const html = await response.text();
                results.push(...parseHTMLContent(html, source, searchTerm));
            }
            
            if (results.length > 0) {
                console.log(`Encontrados ${results.length} resultados com proxy ${proxy}`);
                break;
            }
        } catch (error) {
            console.log(`Proxy ${proxy} falhou:`, error.message);
            continue;
        }
    }
    
    // Se nenhum proxy funcionou, tentar busca alternativa
    if (results.length === 0) {
        results.push(...await searchAlternative(source, searchTerm));
    }
    
    return results.slice(0, 25); // Aumentar limite para 25 resultados
}

// Parse HTML para extrair conteúdo relevante com SISTEMA DE PONTUAÇÃO
function parseHTMLContent(html, source, searchTerm) {
    const results = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Palavras-chave de REFERÊNCIA (não restritivas - apenas para categorização)
    const keywords = [
        ...KEYWORDS_REFERENCIA,
        // Adicionar mais termos culturais para melhor categorização
        'arte', 'artístico', 'artistico', 'cultural', 'criativo', 'inovação', 'inovacao',
        'tecnologia', 'digital', 'multimídia', 'multimidia', 'performance', 'interativo',
        'experimental', 'tradicional', 'popular', 'erudito', 'clássico', 'classico',
        'moderno', 'pós-moderno', 'pos-moderno', 'vanguarda', 'emergente', 'estabelecido',
        'herança', 'heranca', 'patrimônio', 'patrimonio', 'histórico', 'historico',
        'sociedade', 'comunidade', 'educação', 'educacao', 'formação', 'formacao',
        'capacitação', 'capacitacao', 'workshop', 'oficina', 'palestra', 'debate',
        'seminário', 'seminario', 'congresso', 'encontro', 'colóquio', 'coloquio',
        'simpósio', 'simposio', 'conferência', 'conferencia', 'apresentação', 'apresentacao',
        'auxílio', 'auxilio', 'apoio', 'financiamento', 'investimento'
    ];
    
    // Sistema de pontuação para relevância
    function calculateRelevanceScore(text, searchTerm, elementType = 'link') {
        let score = 0;
        const textLower = normalizeText(text);
        const searchTerms = searchTerm.toLowerCase().split(' ').filter(term => term.length > 2);
        
        // Pontuação base por tipo de elemento
        switch(elementType) {
            case 'link': score += 10; break;
            case 'heading': score += 15; break;
            case 'paragraph': score += 8; break;
            case 'list': score += 6; break;
            case 'image': score += 5; break;
        }
        
        // Pontuação por correspondência exata
        searchTerms.forEach(term => {
            if (textLower.includes(term)) {
                score += 20; // Termo encontrado
                
                // Bônus para correspondência exata
                if (textLower === term) score += 50;
                if (textLower.startsWith(term)) score += 30;
                if (textLower.endsWith(term)) score += 25;
                
                // Bônus para múltiplas ocorrências
                const occurrences = (textLower.match(new RegExp(term, 'g')) || []).length;
                score += occurrences * 5;
            }
        });
        
        // Bônus para palavras-chave culturais
        const culturalKeywords = keywords.filter(k => textLower.includes(normalizeText(k)));
        score += culturalKeywords.length * 8;
        
        // Bônus para contexto de edital/licitação
        const editalKeywords = ['edital', 'licitação', 'licitacao', 'seleção', 'selecao', 'processo', 'concurso', 'chamada', 'convocação', 'convocacao'];
        const hasEditalContext = editalKeywords.some(k => textLower.includes(k));
        if (hasEditalContext) score += 25;
        
        // Bônus para datas (indica conteúdo atual)
        const hasDate = /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/.test(text);
        if (hasDate) score += 15;
        
        // Bônus para URLs específicas (PDFs, editais)
        if (elementType === 'link') {
            if (textLower.includes('edital') || textLower.includes('licitacao') || textLower.includes('licitação')) score += 20;
            if (textLower.includes('pdf') || textLower.includes('doc')) score += 15;
        }
        
        // Penalização para texto muito curto ou muito longo
        if (text.length < 10) score -= 10;
        if (text.length > 200) score -= 5;
        
        return Math.max(0, score);
    }
    
    // Buscar em TODOS os links com pontuação
    const links = doc.querySelectorAll('a');
    links.forEach(link => {
        const text = link.textContent.trim();
        const href = link.getAttribute('href');
        
        if (text && href && text.length > 2 && text.length < 300) {
            const textLower = normalizeText(text);
            const matchesSearch = searchTerm.toLowerCase().split(' ').some(term => 
                textLower.includes(term.toLowerCase())
            );
            
            // BUSCA MAIS RIGOROSA: verificar se realmente contém o termo de busca
            if (matchesSearch) {
                // Verificar se o termo de busca está realmente presente (não apenas palavras parciais)
                const searchTerms = searchTerm.toLowerCase().split(' ').filter(term => term.length > 2);
                const hasRealMatch = searchTerms.some(term => {
                    const termLower = term.toLowerCase();
                    return textLower.includes(termLower) && 
                           (textLower.includes(termLower + ' ') || 
                            textLower.includes(' ' + termLower) || 
                            textLower.startsWith(termLower) || 
                            textLower.endsWith(termLower) ||
                            textLower.includes(termLower + '-') ||
                            textLower.includes('-' + termLower));
                });
                
                // Só aceitar se realmente contém o termo de busca
                if (hasRealMatch) {
                    const fullUrl = href.startsWith('http') ? href : 
                                   href.startsWith('/') ? `${new URL(source.url).origin}${href}` : 
                                   `${source.url}/${href}`;
                    
                    const relevanceScore = calculateRelevanceScore(text, searchTerm, 'link');
                    
                    // Tentar extrair data real do texto ou contexto
                    let extractedDate = extrairData(text);
                    if (!extractedDate) {
                        // Tentar extrair data do contexto próximo (parent element)
                        const parentText = link.parentElement ? link.parentElement.textContent : '';
                        extractedDate = extrairData(parentText);
                    }
                    
                    // Log para debug de datas
                    if (extractedDate) {
                        console.log(`📅 Data extraída para "${text.substring(0, 50)}...": ${extractedDate}`);
                    } else {
                        console.log(`⚠️ Nenhuma data encontrada para "${text.substring(0, 50)}..."`);
                    }
                    
                    results.push({
                        titulo: text,
                        link: fullUrl,
                        fonte: new URL(source.url).hostname,
                        trecho: `Link encontrado: ${text}`,
                        data: extractedDate || 'Data não encontrada',
                        tipo: href.endsWith('.pdf') ? 'pdf' : 'web',
                        palavraChave: keywords.find(k => textLower.includes(normalizeText(k))) || 'busca livre',
                        termosBusca: text,
                        relevancia: relevanceScore
                    });
                } else {
                    console.log(`🚫 Rejeitado por não conter termo real: "${text.substring(0, 50)}..." (termo: ${searchTerm})`);
                }
            }
        }
    });
    
    // Buscar em TODOS os textos com pontuação
    const textos = doc.querySelectorAll('p, li, article, section, div, span, h1, h2, h3, h4, h5, h6, .titulo, .title, .headline, .content, .text');
    textos.forEach(elemento => {
        const texto = elemento.textContent.trim();
        if (texto.length > 15 && texto.length < 800) {
            const textoLower = normalizeText(texto);
            const matchesSearch = searchTerm.toLowerCase().split(' ').some(term => 
                textoLower.includes(term.toLowerCase())
            );
            
            // BUSCA MAIS RIGOROSA: verificar se realmente contém o termo de busca
            if (matchesSearch && results.length < 40) {
                // Verificar se o termo de busca está realmente presente (não apenas palavras parciais)
                const searchTerms = searchTerm.toLowerCase().split(' ').filter(term => term.length > 2);
                const hasRealMatch = searchTerms.some(term => {
                    const termLower = term.toLowerCase();
                    return textoLower.includes(termLower) && 
                           (textoLower.includes(termLower + ' ') || 
                            textoLower.includes(' ' + termLower) || 
                            textoLower.startsWith(termLower) || 
                            textoLower.endsWith(termLower) ||
                            textoLower.includes(termLower + '-') ||
                            textoLower.includes('-' + termLower));
                });
                
                // Só aceitar se realmente contém o termo de busca
                if (hasRealMatch) {
                    // Determinar tipo de elemento para pontuação
                    let elementType = 'paragraph';
                    if (elemento.tagName && elemento.tagName.match(/^H[1-6]$/)) elementType = 'heading';
                    else if (elemento.tagName === 'LI') elementType = 'list';
                    
                    // Tentar encontrar link próximo
                    const nearbyLink = elemento.querySelector('a') || elemento.closest('a');
                    const link = nearbyLink ? nearbyLink.getAttribute('href') : source.url;
                    
                    const relevanceScore = calculateRelevanceScore(texto, searchTerm, elementType);
                    
                    // Tentar extrair data real do texto
                    const extractedDate = extrairData(texto);
                    
                    // Log para debug de datas
                    if (extractedDate) {
                        console.log(`📅 Data extraída para texto "${texto.substring(0, 50)}...": ${extractedDate}`);
                    } else {
                        console.log(`⚠️ Nenhuma data encontrada para texto "${texto.substring(0, 50)}..."`);
                    }
                    
                    results.push({
                        titulo: texto.substring(0, 150) + '...',
                        link: link.startsWith('http') ? link : `${source.url}${link}`,
                        fonte: new URL(source.url).hostname,
                        trecho: texto.substring(0, 400) + '...',
                        data: extractedDate || 'Data não encontrada',
                        tipo: 'web',
                        palavraChave: keywords.find(k => textoLower.includes(normalizeText(k))) || 'conteúdo',
                        termosBusca: searchTerm,
                        relevancia: relevanceScore
                    });
                } else {
                    console.log(`🚫 Texto rejeitado por não conter termo real: "${texto.substring(0, 50)}..." (termo: ${searchTerm})`);
                }
            }
        }
    });
    
    // Buscar em imagens (alt e title) com pontuação
    const imagens = doc.querySelectorAll('img');
    imagens.forEach(img => {
        const alt = img.getAttribute('alt') || '';
        const title = img.getAttribute('title') || '';
        const text = alt || title;
        
        if (text && text.length > 5) {
            const textLower = normalizeText(text);
            const matchesSearch = searchTerm.toLowerCase().split(' ').some(term => 
                textLower.includes(term.toLowerCase())
            );
            
            // BUSCA MAIS RIGOROSA: verificar se realmente contém o termo de busca
            if (matchesSearch) {
                // Verificar se o termo de busca está realmente presente (não apenas palavras parciais)
                const searchTerms = searchTerm.toLowerCase().split(' ').filter(term => term.length > 2);
                const hasRealMatch = searchTerms.some(term => {
                    const termLower = term.toLowerCase();
                    return textLower.includes(termLower) && 
                           (textLower.includes(termLower + ' ') || 
                            textLower.includes(' ' + termLower) || 
                            textLower.startsWith(termLower) || 
                            textLower.endsWith(termLower) ||
                            textLower.includes(termLower + '-') ||
                            textLower.includes('-' + termLower));
                });
                
                // Só aceitar se realmente contém o termo de busca
                if (hasRealMatch) {
                    // Tentar encontrar link próximo
                    const nearbyLink = img.closest('a');
                    const link = nearbyLink ? nearbyLink.getAttribute('href') : source.url;
                    
                    const relevanceScore = calculateRelevanceScore(text, searchTerm, 'image');
                    
                    // Tentar extrair data real do contexto da imagem
                    const parentText = img.parentElement ? img.parentElement.textContent : '';
                    const extractedDate = extrairData(text) || extrairData(parentText);
                    
                    // Log para debug de datas
                    if (extractedDate) {
                        console.log(`📅 Data extraída para imagem "${text.substring(0, 50)}...": ${extractedDate}`);
                    } else {
                        console.log(`⚠️ Nenhuma data encontrada para imagem "${text.substring(0, 50)}..."`);
                    }
                    
                    results.push({
                        titulo: `Imagem: ${text}`,
                        link: link.startsWith('http') ? link : `${source.url}${link}`,
                        fonte: new URL(source.url).hostname,
                        trecho: `Descrição da imagem: ${text}`,
                        data: extractedDate || 'Data não encontrada',
                        tipo: 'web',
                        palavraChave: keywords.find(k => textLower.includes(normalizeText(k))) || 'busca livre',
                        termosBusca: text,
                        relevancia: relevanceScore
                    });
                } else {
                    console.log(`🚫 Imagem rejeitada por não conter termo real: "${text.substring(0, 50)}..." (termo: ${searchTerm})`);
                }
            }
        }
    });
    
    return results;
}

// Busca alternativa SUPER inteligente quando proxies falham
async function searchAlternative(source, searchTerm) {
    const results = [];
    
    // Buscar em APIs públicas conhecidas
    try {
        // API do Prosas (se disponível)
        if (source.url.includes('prosas.com.br')) {
            const prosasResponse = await fetch('https://prosas.com.br/api/v1/opportunities?q=' + encodeURIComponent(searchTerm));
            if (prosasResponse.ok) {
                const data = await prosasResponse.json();
                data.forEach(item => {
                                    const relevanceScore = calculateRelevanceScore(item.title || 'Oportunidade no Prosas', searchTerm, 'link');
                results.push({
                    titulo: item.title || 'Oportunidade no Prosas',
                    link: `https://prosas.com.br/opportunity/${item.id}`,
                    fonte: 'prosas.com.br',
                    trecho: item.description || 'Descrição não disponível',
                    data: new Date().toLocaleDateString('pt-BR'),
                    tipo: 'web',
                    palavraChave: 'edital',
                    termosBusca: searchTerm,
                    relevancia: relevanceScore
                });
                });
            }
        }
        
        // API do Cultura em Mercado (se disponível)
        if (source.url.includes('culturaemercado.com.br')) {
            try {
                const mercadoResponse = await fetch('https://culturaemercado.com.br/api/editais?q=' + encodeURIComponent(searchTerm));
                if (mercadoResponse.ok) {
                    const data = await mercadoResponse.json();
                    data.forEach(item => {
                        results.push({
                            titulo: item.titulo || 'Edital no Cultura em Mercado',
                            link: `https://culturaemercado.com.br/edital/${item.id}`,
                            fonte: 'culturaemercado.com.br',
                            trecho: item.descricao || 'Descrição não disponível',
                            data: new Date().toLocaleDateString('pt-BR'),
                            tipo: 'web',
                            palavraChave: 'edital',
                            termosBusca: searchTerm
                        });
                    });
                }
            } catch (error) {
                console.log('API Cultura em Mercado falhou:', error.message);
            }
        }
        
        // Buscar no Google Custom Search (se configurado)
        if (window.GOOGLE_CSE_ID && window.GOOGLE_API_KEY) {
            try {
                const googleResponse = await fetch(`https://www.googleapis.com/customsearch/v1?key=${window.GOOGLE_API_KEY}&cx=${window.GOOGLE_CSE_ID}&q=${encodeURIComponent(searchTerm + ' site:' + new URL(source.url).hostname)}`);
                if (googleResponse.ok) {
                    const data = await googleResponse.json();
                    if (data.items) {
                        data.items.forEach(item => {
                            results.push({
                                titulo: item.title,
                                link: item.link,
                                fonte: new URL(source.url).hostname,
                                trecho: item.snippet,
                                data: new Date().toLocaleDateString('pt-BR'),
                                tipo: 'web',
                                palavraChave: 'google',
                                termosBusca: searchTerm
                            });
                        });
                    }
                }
            } catch (error) {
                console.log('Google Custom Search falhou:', error.message);
            }
        }
        
    } catch (error) {
        console.log('APIs alternativas falharam:', error.message);
    }
    
    // Criar resultados inteligentes baseados no tipo de fonte
    if (results.length === 0) {
        const sourceType = getSourceType(source.url);
        const suggestions = getSuggestionsForSource(sourceType, searchTerm);
        
        suggestions.forEach(suggestion => {
            results.push({
                titulo: suggestion.title,
                link: suggestion.url,
                fonte: new URL(source.url).hostname,
                trecho: suggestion.description,
                data: new Date().toLocaleDateString('pt-BR'),
                tipo: 'web',
                palavraChave: suggestion.keyword,
                termosBusca: searchTerm
            });
        });
    }
    
    // Ordenar resultados por relevância (maior pontuação primeiro)
    results.sort((a, b) => (b.relevancia || 0) - (a.relevancia || 0));
    
    // Filtrar apenas resultados com relevância mínima (eliminar ruído)
    const minRelevanceScore = 15; // Pontuação mínima para considerar relevante
    const filteredResults = results.filter(result => (result.relevancia || 0) >= minRelevanceScore);
    
    console.log(`📊 Resultados encontrados: ${results.length} | Relevantes (score >= ${minRelevanceScore}): ${filteredResults.length}`);
    
    // Estatísticas de datas
    const comData = filteredResults.filter(r => r.data && r.data !== 'Data não encontrada').length;
    const semData = filteredResults.filter(r => !r.data || r.data === 'Data não encontrada').length;
    console.log(`📅 Estatísticas de datas: ${comData} com data, ${semData} sem data`);
    
    // Mostrar exemplos de datas encontradas
    if (comData > 0) {
        console.log('📅 Exemplos de datas encontradas:');
        filteredResults.filter(r => r.data && r.data !== 'Data não encontrada').slice(0, 3).forEach((result, index) => {
            console.log(`${index + 1}. "${result.titulo.substring(0, 50)}..." → Data: ${result.data}`);
        });
    }
    
    // Mostrar top 5 resultados com suas pontuações para debug
    if (filteredResults.length > 0) {
        console.log('🏆 Top 5 resultados por relevância:');
        filteredResults.slice(0, 5).forEach((result, index) => {
            console.log(`${index + 1}. Score: ${result.relevancia} | Data: ${result.data} | "${result.titulo.substring(0, 50)}..."`);
        });
    }
    
    return filteredResults;
}

// Determinar tipo de fonte
function getSourceType(url) {
    if (url.includes('gov.br')) return 'governamental';
    if (url.includes('sc.gov.br')) return 'estadual';
    if (url.includes('.sc.gov.br')) return 'municipal';
    if (url.includes('sesc')) return 'sesc';
    if (url.includes('prosas.com.br') || url.includes('culturaemercado.com.br')) return 'plataforma';
    return 'outro';
}

// Sugestões inteligentes por tipo de fonte
function getSuggestionsForSource(sourceType, searchTerm) {
    const suggestions = [];
    
    switch (sourceType) {
        case 'governamental':
            suggestions.push(
                {
                    title: `Buscar editais federais para "${searchTerm}"`,
                    url: `https://www.gov.br/cultura/pt-br/assuntos/editais?q=${encodeURIComponent(searchTerm)}`,
                    description: `Pesquise editais federais relacionados a ${searchTerm}`,
                    keyword: 'federal'
                },
                {
                    title: `FUNARTE - Editais de Artes Visuais`,
                    url: 'https://www.gov.br/funarte/editais-arte-visual',
                    description: 'Editais específicos para artes visuais e escultura',
                    keyword: 'funarte'
                }
            );
            break;
            
        case 'estadual':
            suggestions.push(
                {
                    title: `FCC SC - Fundação Catarinense de Cultura`,
                    url: 'https://www.fcc.sc.gov.br',
                    description: 'Fundação responsável pela cultura em Santa Catarina',
                    keyword: 'fcc'
                },
                {
                    title: `Cultura SC - Secretaria de Estado`,
                    url: 'https://www.cultura.sc.gov.br',
                    description: 'Secretaria de Estado da Cultura de SC',
                    keyword: 'cultura-sc'
                }
            );
            break;
            
        case 'plataforma':
            suggestions.push(
                {
                    title: `Prosas - Plataforma de Editais`,
                    url: 'https://prosas.com.br/editais',
                    description: 'Plataforma especializada em editais culturais',
                    keyword: 'prosas'
                },
                {
                    title: `Cultura em Mercado`,
                    url: 'https://culturaemercado.com.br/editais',
                    description: 'Editais e oportunidades culturais',
                    keyword: 'cultura-mercado'
                }
            );
            break;
            
        default:
            suggestions.push(
                {
                    title: `Navegar em ${sourceType}`,
                    url: '#',
                    description: `Explore o site para encontrar conteúdo relacionado a ${searchTerm}`,
                    keyword: 'navegação'
                }
            );
    }
    
    return suggestions;
}

// Normalizar texto para comparação
function normalizeText(text) {
    if (!text) return '';
    return text.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}

// Extrair data do texto - SUPER ROBUSTA
function extrairData(texto) {
    if (!texto || typeof texto !== 'string') return null;
    
    // Log para debug
    console.log(`🔍 Tentando extrair data de: "${texto.substring(0, 100)}..."`);
    
            // Múltiplos padrões de data - SUPER AGRESSIVOS
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
            // Padrões adicionais comuns
            /(\d{1,2})\s+(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s+(\d{4})/i,
            /(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s+(\d{4})/i,
            // Padrões mais flexíveis
            /(\d{1,2})\s*[\/\-\.]\s*(\d{1,2})\s*[\/\-\.]\s*(\d{2,4})/,
            // Anos com contexto
            /(ano|em|de)\s+(\d{4})/i,
            /(\d{4})\s+(ano|anos)/i,
            // Datas em contexto de edital
            /(edital|licitação|licitacao|seleção|selecao|concurso|chamada)\s+(de|em|para)\s+(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/i,
            // Datas em contexto de evento
            /(evento|festival|mostra|exposição|exposicao|workshop|oficina)\s+(de|em|para)\s+(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/i
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
                    } else if (pattern.source.includes('ano|em|de')) {
                        // Ano com contexto
                        const result = `01/01/${match[2]}`;
                        console.log(`📅 Ano com contexto convertido: ${match[0]} → ${result}`);
                        return result;
                    } else if (pattern.source.includes('edital|licitação|licitacao|seleção|selecao|concurso|chamada')) {
                        // Data em contexto de edital
                        const result = `${match[3]}/${match[4]}/${match[5]}`;
                        console.log(`📅 Data de edital convertida: ${match[0]} → ${result}`);
                        return result;
                    } else if (pattern.source.includes('evento|festival|mostra|exposição|exposicao|workshop|oficina')) {
                        // Data em contexto de evento
                        const result = `${match[3]}/${match[4]}/${match[5]}`;
                        console.log(`📅 Data de evento convertida: ${match[0]} → ${result}`);
                        return result;
                    } else {
                        // Padrões numéricos padrão
                        console.log(`📅 Data encontrada: ${match[0]}`);
                        return match[0];
                    }
                }
            }
    
    console.log(`❌ Nenhum padrão de data encontrado`);
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

// Obter fontes selecionadas
function getSelectedSources() {
    return Array.from(document.querySelectorAll('#sourcesList input[type="checkbox"]:checked'))
        .map(cb => SOURCES.find(s => s.id === cb.value))
        .filter(Boolean);
}

// Realizar busca
async function performSearch() {
    if (isSearching) return;
    
    const searchTerm = searchInput.value.trim();
    if (!searchTerm) {
        alert('Digite qualquer termo para buscar - o sistema é livre!');
        return;
    }
    
    const selectedSources = getSelectedSources();
    if (selectedSources.length === 0) {
        alert('Por favor, selecione pelo menos uma fonte de busca');
        return;
    }
    
    isSearching = true;
    searchBtn.disabled = true;
    loadingIndicator.style.display = 'block';
    resultsContainer.innerHTML = '';
    searchResults = [];
    currentPage = 1;
    
    // Elementos de progresso
    const loadingText = document.getElementById('loadingText');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    try {
        let completedSources = 0;
        const totalSources = selectedSources.length;
        
        // Atualizar texto inicial
        loadingText.textContent = `Buscando em ${totalSources} fontes...`;
        progressText.textContent = `0 de ${totalSources} fontes pesquisadas`;
        
        // Processar fontes uma por uma para mostrar progresso
        for (const source of selectedSources) {
            loadingText.textContent = `Buscando em ${source.name}...`;
            
            const results = await searchSource(source, searchTerm);
            searchResults.push(...results);
            
            // Atualizar progresso
            completedSources++;
            const progress = (completedSources / totalSources) * 100;
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `${completedSources} de ${totalSources} fontes pesquisadas`;
            
            // Renderizar resultados parciais
            if (searchResults.length > 0) {
                updateResultsCount(searchResults.length, true);
            }
        }
        
        // Processar resultados finais
        loadingText.textContent = 'Organizando resultados...';
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Salvar resultados originais para filtros
        window.originalSearchResults = [...searchResults];
        
        // Aplicar filtros antes de renderizar
        applyFilters();
        
        // Renderizar resultados finais
        renderResults();
        renderPagination();
        
    } catch (error) {
        console.error('Erro na busca:', error);
        alert('Erro ao realizar busca. Tente novamente.');
    } finally {
        isSearching = false;
        searchBtn.disabled = false;
        loadingIndicator.style.display = 'none';
        
        // Resetar progresso
        progressFill.style.width = '0%';
        
        // Habilitar botões de exportação se houver resultados
        exportCSV.disabled = searchResults.length === 0;
        exportJSON.disabled = searchResults.length === 0;
    }
}

// Aplicar filtros aos resultados de forma inteligente
function applyFilters() {
    // Usar resultados originais se disponíveis
    let originalResults = window.originalSearchResults || [...searchResults];
    let filteredResults = [...originalResults];
    
    console.log(`Aplicando filtros em ${originalResults.length} resultados originais`);
    
    // Filtro por localização (SC/Nacional) - APENAS se ambos não estiverem marcados
    if (filterSC.checked && !filterNacional.checked) {
        // Apenas SC
        const beforeLocationFilter = filteredResults.length;
        filteredResults = filteredResults.filter(result => {
            const text = `${result.titulo} ${result.trecho}`.toLowerCase();
            return mentionsSC(text);
        });
        console.log(`Filtro SC aplicado: ${filteredResults.length} de ${beforeLocationFilter} resultados`);
    } else if (!filterSC.checked && filterNacional.checked) {
        // Apenas Nacional
        const beforeLocationFilter = filteredResults.length;
        filteredResults = filteredResults.filter(result => {
            const text = `${result.titulo} ${result.trecho}`.toLowerCase();
            return !mentionsSC(text);
        });
        console.log(`Filtro Nacional aplicado: ${filteredResults.length} de ${beforeLocationFilter} resultados`);
    }
    // Se ambos ou nenhum estiver marcado, não filtra por localização
    
    // Filtro por tipo de oportunidade - MAIS FLEXÍVEL
    if (filterType.value && filterType.value !== '') {
        const beforeTypeFilter = filteredResults.length;
        filteredResults = filteredResults.filter(result => {
            // Filtro mais flexível para tipos
            const resultType = result.tipo.toLowerCase();
            const filterTypeValue = filterType.value.toLowerCase();
            
            // Mapeamento inteligente de tipos
            if (filterTypeValue === 'edital') {
                return resultType === 'edital' || resultType === 'web' || resultType === 'documento';
            } else if (filterTypeValue === 'pdf') {
                return resultType === 'pdf' || resultType === 'documento';
            } else if (filterTypeValue === 'web') {
                return resultType === 'web' || resultType === 'edital';
            } else {
                return resultType === filterTypeValue;
            }
        });
        console.log(`Filtro tipo "${filterType.value}" aplicado: ${filteredResults.length} de ${beforeTypeFilter} resultados`);
    }
    
    // Filtro por data - MAIS FLEXÍVEL E HISTÓRICO
    if (dateFrom.value || dateTo.value) {
        const beforeDateFilter = filteredResults.length;
        let dateFilterInfo = '';
        
        if (dateFrom.value && dateTo.value) {
            dateFilterInfo = `de ${dateFrom.value} até ${dateTo.value}`;
        } else if (dateFrom.value) {
            dateFilterInfo = `a partir de ${dateFrom.value}`;
        } else if (dateTo.value) {
            dateFilterInfo = `até ${dateTo.value}`;
        }
        
        console.log(`🔍 Aplicando filtro de data: ${dateFilterInfo}`);
        
        filteredResults = filteredResults.filter(result => {
            // Se não tem data, mantém o resultado (não filtra)
            if (!result.data || result.data === '') return true;
            
            const resultDate = parseDate(result.data);
            if (!resultDate) return true; // Se não conseguiu parsear, mantém
            
            const fromDate = dateFrom.value ? new Date(dateFrom.value + 'T00:00:00') : null;
            const toDate = dateTo.value ? new Date(dateTo.value + 'T23:59:59') : null;
            
            let isInRange = true;
            
            if (fromDate && toDate) {
                isInRange = resultDate >= fromDate && resultDate <= toDate;
            } else if (fromDate) {
                isInRange = resultDate >= fromDate;
            } else if (toDate) {
                isInRange = resultDate <= toDate;
            }
            
            // Log detalhado para debug de datas
            if (resultDate && (fromDate || toDate)) {
                console.log(`📅 Resultado: "${result.titulo.substring(0, 50)}..." | Data: ${result.data} | Parseada: ${resultDate.toISOString().split('T')[0]} | No range: ${isInRange}`);
            }
            
            return isInRange;
        });
        
        console.log(`✅ Filtro data aplicado: ${filteredResults.length} de ${beforeDateFilter} resultados`);
        
        // Mostrar estatísticas de datas encontradas
        const datesFound = filteredResults.filter(r => r.data && r.data !== '').length;
        const datesParsed = filteredResults.filter(r => parseDate(r.data)).length;
        console.log(`📊 Estatísticas de data: ${datesFound} com data, ${datesParsed} parseadas corretamente`);
        
        // Verificar se o filtro está sendo muito restritivo
        if (filteredResults.length < beforeDateFilter * 0.3) { // Se menos de 30% dos resultados passaram
            console.warn(`⚠️ Filtro de data muito restritivo! Apenas ${((filteredResults.length/beforeDateFilter)*100).toFixed(1)}% dos resultados passaram.`);
            
            // Mostrar exemplos de datas que não passaram
            const rejectedResults = originalResults.filter(r => {
                if (!r.data || r.data === '') return false;
                const resultDate = parseDate(r.data);
                if (!resultDate) return false;
                
                const fromDate = dateFrom.value ? new Date(dateFrom.value + 'T00:00:00') : null;
                const toDate = dateTo.value ? new Date(dateTo.value + 'T23:59:59') : null;
                
                if (fromDate && toDate) {
                    return resultDate < fromDate || resultDate > toDate;
                } else if (fromDate) {
                    return resultDate < fromDate;
                } else if (toDate) {
                    return resultDate > toDate;
                }
                return false;
            });
            
            if (rejectedResults.length > 0) {
                console.log(`📅 Exemplos de datas rejeitadas pelo filtro:`);
                rejectedResults.slice(0, 5).forEach((result, index) => {
                    const resultDate = parseDate(result.data);
                    console.log(`${index + 1}. "${result.titulo.substring(0, 50)}..." | Data: ${result.data} | Parseada: ${resultDate.toISOString().split('T')[0]}`);
                });
            }
        }
    }
    
    // PROTEÇÃO: Se filtros eliminarem todos os resultados, mostrar mensagem
    if (filteredResults.length === 0 && originalResults.length > 0) {
        console.warn('⚠️ Filtros muito restritivos! Nenhum resultado encontrado.');
        
        // Mostrar estatísticas detalhadas
        showFilterStatistics(originalResults);
        
        // Mostrar alerta para o usuário
        alert('Os filtros aplicados são muito restritivos e eliminaram todos os resultados.\n\nTente relaxar os filtros ou usar apenas um filtro por vez.');
        
        // Restaurar resultados originais
        filteredResults = [...originalResults];
    } else if (filteredResults.length < originalResults.length * 0.3) {
        // AVISO: Filtros muito restritivos (menos de 30% dos resultados)
        console.warn(`⚠️ Filtros muito restritivos! Apenas ${((filteredResults.length/originalResults.length)*100).toFixed(1)}% dos resultados originais passaram.`);
        
        // Mostrar alerta para o usuário
        const shouldShowAlert = confirm(
            `Os filtros aplicados são muito restritivos e eliminaram ${originalResults.length - filteredResults.length} de ${originalResults.length} resultados (${((filteredResults.length/originalResults.length)*100).toFixed(1)}% restaram).\n\n` +
            'Deseja relaxar os filtros para ver mais resultados?\n\n' +
            'Clique "OK" para manter os filtros atuais ou "Cancelar" para relaxar automaticamente.'
        );
        
        if (!shouldShowAlert) {
            // Relaxar filtros automaticamente
            console.log('🔄 Relaxando filtros automaticamente...');
            
            // Manter apenas filtros essenciais
            if (filterSC.checked || filterNacional.checked) {
                // Manter filtro de localização
                filteredResults = originalResults.filter(result => {
                    const text = `${result.titulo} ${result.trecho}`.toLowerCase();
                    return (filterSC.checked && mentionsSC(text)) || 
                           (filterNacional.checked && !mentionsSC(text));
                });
            } else {
                // Restaurar todos os resultados
                filteredResults = [...originalResults];
            }
            
            console.log(`✅ Filtros relaxados: ${filteredResults.length} resultados restaurados`);
        }
    }
    
    // Atualizar resultados filtrados
    searchResults = filteredResults;
    currentPage = 1; // Voltar para primeira página
    
    console.log(`✅ Filtros aplicados: ${filteredResults.length} resultados de ${originalResults.length} originais`);
}

// Mostrar estatísticas dos filtros para debug
function showFilterStatistics(results) {
    console.log('📊 ESTATÍSTICAS DOS FILTROS:');
    console.log('Resultados originais:', results.length);
    console.log('Filtros ativos:', {
        sc: filterSC.checked,
        nacional: filterNacional.checked,
        tipo: filterType.value,
        dataFrom: dateFrom.value,
        dataTo: dateTo.value
    });
    
    // Estatísticas por tipo
    const tipos = {};
    results.forEach(result => {
        const tipo = result.tipo || 'sem tipo';
        tipos[tipo] = (tipos[tipo] || 0) + 1;
    });
    console.log('📋 Distribuição por tipo:', tipos);
    
    // Estatísticas por localização
    let scCount = 0, nacionalCount = 0;
    results.forEach(result => {
        const text = `${result.titulo} ${result.trecho}`.toLowerCase();
        if (mentionsSC(text)) {
            scCount++;
        } else {
            nacionalCount++;
        }
    });
    console.log('📍 Distribuição por localização:', { SC: scCount, Nacional: nacionalCount });
    
    // Estatísticas por data - MAIS DETALHADAS
    let comData = 0, semData = 0;
    const anosEncontrados = {};
    const datasParseadas = [];
    
    results.forEach(result => {
        if (result.data && result.data !== '') {
            comData++;
            
            const parsedDate = parseDate(result.data);
            if (parsedDate) {
                const ano = parsedDate.getFullYear();
                anosEncontrados[ano] = (anosEncontrados[ano] || 0) + 1;
                datasParseadas.push({
                    original: result.data,
                    parseada: parsedDate.toISOString().split('T')[0],
                    titulo: result.titulo.substring(0, 50)
                });
            }
        } else {
            semData++;
        }
    });
    
    console.log('📅 Distribuição por data:', { 'Com data': comData, 'Sem data': semData });
    
    if (Object.keys(anosEncontrados).length > 0) {
        console.log('📅 Anos encontrados nos resultados:', anosEncontrados);
        
        // Mostrar exemplos de datas parseadas
        if (datasParseadas.length > 0) {
            console.log('📅 Exemplos de datas parseadas:');
            datasParseadas.slice(0, 5).forEach((item, index) => {
                console.log(`${index + 1}. Original: "${item.original}" → Parseada: ${item.parseada} | "${item.titulo}..."`);
            });
        }
    }
    
    // Mostrar alguns exemplos de dados
    console.log('🔍 Exemplos de resultados:');
    results.slice(0, 3).forEach((result, index) => {
        console.log(`${index + 1}. Tipo: "${result.tipo}", Data: "${result.data}", Local: ${mentionsSC(`${result.titulo} ${result.trecho}`) ? 'SC' : 'Nacional'}`);
    });
}

// Verificar se o texto menciona Santa Catarina
function mentionsSC(text) {
    const scKeywords = [
        'santa catarina', 'sc', 'catarina', 'florianópolis', 'florianopolis', 'blumenau',
        'criciúma', 'criciuma', 'joinville', 'itajaí', 'itajai', 'palhoça', 'palhoca',
        'são josé', 'sao jose', 'tubarão', 'tubarao', 'brusque', 'navegantes', 'bombinhas',
        'camboriú', 'camboriu', 'itapema', 'penha', 'balneário', 'balneario', 'amfri',
        'amavi', 'amosc', 'amurel', 'fcc', 'fundação catarina', 'fundacao catarina'
    ];
    
    return scKeywords.some(keyword => text.includes(keyword));
}

// Parse de data SUPER melhorado e robusto
function parseDate(dateString) {
    if (!dateString || dateString === '') return null;
    
    // Limpar a string de data
    const cleanDateString = dateString.toString().trim();
    
    // Tentar diferentes formatos de data
    const dateFormats = [
        /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // dd/mm/yyyy
        /(\d{1,2})-(\d{1,2})-(\d{4})/,   // dd-mm-yyyy
        /(\d{4})-(\d{1,2})-(\d{1,2})/,   // yyyy-mm-dd
        /(\d{1,2})\/(\d{1,2})\/(\d{2})/, // dd/mm/yy
        /(\d{1,2})-(\d{1,2})-(\d{2})/,   // dd-mm-yy
        /(\d{1,2})\.(\d{1,2})\.(\d{4})/, // dd.mm.yyyy
        /(\d{1,2})\.(\d{1,2})\.(\d{2})/  // dd.mm.yy
    ];
    
    for (const format of dateFormats) {
        const match = cleanDateString.match(format);
        if (match) {
            try {
                if (match[1].length === 4) {
                    // yyyy-mm-dd
                    const date = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
                    if (!isNaN(date.getTime())) return date;
                } else if (match[3].length === 4) {
                    // dd/mm/yyyy ou dd-mm-yyyy
                    const date = new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
                    if (!isNaN(date.getTime())) return date;
                } else {
                    // dd/mm/yy ou dd-mm-yy
                    const year = parseInt(match[3]) < 50 ? 2000 + parseInt(match[3]) : 1900 + parseInt(match[3]);
                    const date = new Date(year, parseInt(match[2]) - 1, parseInt(match[1]));
                    if (!isNaN(date.getTime())) return date;
                }
            } catch (error) {
                console.log(`Erro ao parsear data "${cleanDateString}" com formato ${format}:`, error);
                continue;
            }
        }
    }
    
    // Tentar parse direto do JavaScript
    try {
        const parsed = new Date(cleanDateString);
        if (!isNaN(parsed.getTime()) && parsed.getFullYear() >= 1900 && parsed.getFullYear() <= 2100) {
            return parsed;
        }
    } catch (error) {
        console.log(`Erro ao parsear data "${cleanDateString}" diretamente:`, error);
    }
    
    // Se chegou aqui, não conseguiu parsear
    console.log(`⚠️ Não foi possível parsear a data: "${cleanDateString}"`);
    return null;
}

// Atualizar contador de resultados
function updateResultsCount(count, isPartial = false) {
    const prefix = isPartial ? 'Encontrados até agora: ' : '';
    resultsCount.textContent = `${prefix}${count} resultados`;
}

// Renderizar resultados com paginação
function renderResults() {
    const startIndex = (currentPage - 1) * resultsPerPage;
    const endIndex = startIndex + resultsPerPage;
    const pageResults = searchResults.slice(startIndex, endIndex);
    
    resultsCount.textContent = `${searchResults.length} resultados encontrados`;
    
    if (pageResults.length === 0) {
        resultsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #718096;">
                <p>Nenhum resultado encontrado.</p>
                <p style="margin-top: 10px;">Tente usar outras palavras-chave ou ajustar os filtros.</p>
            </div>
        `;
        return;
    }
    
    resultsContainer.innerHTML = pageResults.map(result => {
        const relevanceScore = result.relevancia || 0;
        const relevanceClass = relevanceScore >= 50 ? 'high-relevance' : 
                              relevanceScore >= 30 ? 'medium-relevance' : 'low-relevance';
        
        return `
        <div class="result-card ${relevanceClass}">
            <div class="result-header">
                <div>
                    <h3 class="result-title">${result.titulo}</h3>
                    <p class="result-source">${result.fonte}</p>
                    <div class="result-relevance">
                        <span class="relevance-score ${relevanceClass}">
                            ⭐ Relevância: ${relevanceScore}
                        </span>
                    </div>
                </div>
                <span class="result-type ${result.tipo}">${result.tipo.toUpperCase()}</span>
            </div>
            
            <div class="result-content">
                <div class="result-excerpt">
                    ${result.trecho}
                </div>
                <div style="margin-top: 10px;">
                    <span class="result-keyword">${result.palavraChave}</span>
                </div>
            </div>
            
            <div class="result-meta">
                ${result.data ? `<span class="result-date">📅 ${result.data}</span>` : ''}
            </div>
            
            <div class="result-actions">
                <a href="${result.link}" target="_blank" class="result-link" title="Abrir link">
                    🔗 Acessar link
                </a>
                <button class="result-link copy-btn" onclick="copyToClipboard('${result.link}', this)" title="Copiar link">
                    📋 Copiar link
                </button>
                ${isDownloadableFile(result.link) ? `
                    <button class="result-link download-btn" onclick="downloadFile('${result.link}', '${result.titulo.replace(/'/g, "\\'")}')" title="Baixar arquivo">
                        📥 Download
                    </button>
                ` : ''}
            </div>
        </div>
        `;
    }).join('');
}

// Renderizar controles de paginação melhorada
function renderPagination() {
    if (searchResults.length <= resultsPerPage) {
        pagination.innerHTML = '';
        return;
    }
    
    const totalPages = Math.ceil(searchResults.length / resultsPerPage);
    const showingFrom = ((currentPage - 1) * resultsPerPage) + 1;
    const showingTo = Math.min(currentPage * resultsPerPage, searchResults.length);
    
    let paginationHTML = `
        <div class="pagination-controls">
            <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} class="btn-page">
                ← Anterior
            </button>
            
            <div class="page-numbers">
    `;
    
    // Números das páginas com navegação inteligente
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    // Primeira página
    if (startPage > 1) {
        paginationHTML += `<button onclick="changePage(1)" class="btn-page">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span class="page-ellipsis">...</span>`;
        }
    }
    
    // Páginas do meio
    for (let i = startPage; i <= endPage; i++) {
        if (i === currentPage) {
            paginationHTML += `<span class="current-page">${i}</span>`;
        } else {
            paginationHTML += `<button onclick="changePage(${i})" class="btn-page">${i}</button>`;
        }
    }
    
    // Última página
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span class="page-ellipsis">...</span>`;
        }
        paginationHTML += `<button onclick="changePage(${totalPages})" class="btn-page">${totalPages}</button>`;
    }
    
    paginationHTML += `
            </div>
            
            <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} class="btn-page">
                Próxima →
            </button>
        </div>
        
        <div class="page-info">
            Página ${currentPage} de ${totalPages} (${showingFrom}-${showingTo} de ${searchResults.length} resultados)
        </div>
        
        <div class="page-jump">
            <span>Ir para página:</span>
            <input type="number" id="pageJumpInput" min="1" max="${totalPages}" placeholder="Página" class="page-input">
            <button onclick="jumpToPage()" class="btn-page">Ir</button>
        </div>
    `;
    
    pagination.innerHTML = paginationHTML;
    
    // Adicionar evento Enter no input de página
    const pageJumpInput = document.getElementById('pageJumpInput');
    if (pageJumpInput) {
        pageJumpInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                jumpToPage();
            }
        });
    }
}

// Mudar página
window.changePage = function(page) {
    const totalPages = Math.ceil(searchResults.length / resultsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    renderResults();
    renderPagination();
    
    // Scroll para o topo dos resultados
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// Navegar diretamente para uma página específica
window.jumpToPage = function() {
    const pageJumpInput = document.getElementById('pageJumpInput');
    if (!pageJumpInput) return;
    
    const targetPage = parseInt(pageJumpInput.value);
    const totalPages = Math.ceil(searchResults.length / resultsPerPage);
    
    if (targetPage && targetPage >= 1 && targetPage <= totalPages) {
        changePage(targetPage);
        pageJumpInput.value = ''; // Limpar input
    } else {
        alert(`Por favor, digite um número de página válido (1 a ${totalPages})`);
        pageJumpInput.focus();
    }
};

// Função para copiar texto para clipboard
window.copyToClipboard = function(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.textContent;
        button.textContent = '✅ Copiado!';
        button.style.background = '#48bb78';
        button.style.color = 'white';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
            button.style.color = '';
        }, 2000);
    }).catch(err => {
        console.error('Erro ao copiar:', err);
    });
};

// Exportar resultados
function exportResults(format) {
    if (searchResults.length === 0) return;
    
    if (format === 'csv') {
        exportToCSV();
    } else if (format === 'json') {
        exportToJSON();
    }
}

// Exportar para CSV
function exportToCSV() {
    const headers = ['Título', 'Fonte', 'Link', 'Data', 'Trecho', 'Palavra-chave', 'Tipo'];
    const csvContent = [
        headers.join(','),
        ...searchResults.map(result => [
            `"${result.titulo.replace(/"/g, '""')}"`,
            `"${result.fonte}"`,
            `"${result.link}"`,
            `"${result.data || ''}"`,
            `"${result.trecho.replace(/"/g, '""')}"`,
            `"${result.palavraChave}"`,
            `"${result.tipo}"`
        ].join(','))
    ].join('\n');
    
    downloadFile(csvContent, 'editais_culturais.csv', 'text/csv;charset=utf-8;');
}

// Exportar para JSON
function exportToJSON() {
    const jsonContent = JSON.stringify(searchResults, null, 2);
    downloadFile(jsonContent, 'editais_culturais.json', 'application/json');
}

// Verificar se é um arquivo baixável
function isDownloadableFile(url) {
    if (!url) return false;
    
    const downloadableExtensions = [
        '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
        '.txt', '.rtf', '.zip', '.rar', '.7z', '.tar', '.gz',
        '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff',
        '.mp3', '.mp4', '.avi', '.mov', '.wmv', '.flv'
    ];
    
    const urlLower = url.toLowerCase();
    return downloadableExtensions.some(ext => urlLower.includes(ext));
}

// Download de arquivo da web
window.downloadFile = function(url, filename) {
    if (!url) return;
    
    try {
        // Criar um link temporário para download
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || 'download';
        link.target = '_blank';
        
        // Adicionar ao DOM, clicar e remover
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Feedback visual
        const downloadBtn = event.target;
        const originalText = downloadBtn.textContent;
        downloadBtn.textContent = '✅ Baixando...';
        downloadBtn.style.background = '#48bb78';
        downloadBtn.style.color = 'white';
        
        setTimeout(() => {
            downloadBtn.textContent = originalText;
            downloadBtn.style.background = '';
            downloadBtn.style.color = '';
        }, 2000);
        
    } catch (error) {
        console.error('Erro ao baixar arquivo:', error);
        alert('Erro ao baixar arquivo. Tente acessar o link diretamente.');
    }
};

// Download de arquivo (para exportação)
function downloadFile(content, filename, mimeType) {
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
