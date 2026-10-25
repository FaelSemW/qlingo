import React, { useState, useEffect } from 'react';
import { 
  Search, FolderDown, HardDrive, CheckCircle2, FileText, 
  ExternalLink, Download, Filter, RefreshCw, Sparkles, Building, 
  Calendar, Award, BookOpen, AlertCircle
} from 'lucide-react';
import { fetchCatalogProvas, fetchCatalogStats } from '../services/api';

export default function ConcursosCatalog() {
  const [provas, setProvas] = useState([]);
  const [stats, setStats] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filtros
  const [search, setSearch] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedAno, setSelectedAno] = useState('all');
  const [onlyDownloaded, setOnlyDownloaded] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadProvas();
  }, [page, selectedArea, selectedAno, onlyDownloaded]);

  const loadStats = async () => {
    try {
      const data = await fetchCatalogStats();
      setStats(data);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  };

  const loadProvas = async () => {
    setIsLoading(true);
    try {
      const params = {
        page,
        limit: 15
      };
      if (search.trim()) params.q = search.trim();
      if (selectedArea !== 'all') params.area = selectedArea;
      if (selectedAno !== 'all') params.ano = selectedAno;
      if (onlyDownloaded) params.baixadas_apenas = 'true';

      const data = await fetchCatalogProvas(params);
      setProvas(data.results || []);
      setTotal(data.total || 0);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error('Erro ao carregar catálogo de provas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadProvas();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Banner de Conexão com o HD */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl mb-8 border border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Conectado ao seu HD (D:\questions)
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                Catálogo Nacional PCI Concursos
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Biblioteca & Repositório de Provas
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Navegue, pesquise e abra cadernos de provas e gabaritos oficiais diretamente do seu computador ou catalogados no acervo nacional.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-center">
              <div className="text-xs text-slate-300 font-medium">Baixadas no HD</div>
              <div className="text-xl font-bold text-emerald-400">
                {stats?.total_baixadas_hd ?? '...'} provas
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-center">
              <div className="text-xs text-slate-300 font-medium">Catalogadas</div>
              <div className="text-xl font-bold text-amber-400">
                {stats?.total ?? '...'} provas
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controles de Busca & Filtros */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-8">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por cargo, órgão ou banca (ex: Polícia Federal, Receita, CESPE, VUNESP)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Search className="w-4 h-4" />
            Buscar Provas
          </button>
        </form>

        {/* Filtros em Linha */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            {/* Botão de Toggle: Baixadas no HD */}
            <button
              onClick={() => {
                setOnlyDownloaded(!onlyDownloaded);
                setPage(1);
              }}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                onlyDownloaded
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Apenas Baixadas no meu HD</span>
              {onlyDownloaded && <CheckCircle2 className="w-3.5 h-3.5 ml-0.5" />}
            </button>

            {/* Select Área */}
            <select
              value={selectedArea}
              onChange={(e) => {
                setSelectedArea(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Todas as Carreiras</option>
              {stats?.areas?.map((a) => (
                <option key={a.area} value={a.area}>
                  {a.area} ({a.count})
                </option>
              ))}
            </select>

            {/* Select Ano */}
            <select
              value={selectedAno}
              onChange={(e) => {
                setSelectedAno(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Todos os Anos</option>
              {stats?.anos?.map((an) => (
                <option key={an.ano} value={an.ano}>
                  Ano {an.ano} ({an.count})
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Mostrando <strong>{provas.length}</strong> de <strong>{total}</strong> provas
          </div>
        </div>
      </div>

      {/* Lista de Cards de Provas */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mb-3 text-orange-500" />
          <p className="text-sm font-medium">Carregando acervo de provas do HD...</p>
        </div>
      ) : provas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">Nenhuma prova encontrada</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            {onlyDownloaded 
              ? 'Você ainda não baixou provas com esses filtros. Execute D:\\questions\\BAIXAR_PCI_CONCURSOS.bat para baixar mais cadernos!'
              : 'Tente ajustar os filtros ou a palavra-chave da sua pesquisa.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {provas.map((prova) => (
            <div
              key={prova.slug}
              className={`bg-white rounded-xl border p-5 transition-all hover:shadow-md flex flex-col justify-between ${
                prova.is_downloaded 
                  ? 'border-emerald-300 bg-gradient-to-br from-white to-emerald-50/20' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Badges do Card */}
                <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                  {prova.is_downloaded ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Baixado no HD
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                      Catalogada
                    </span>
                  )}
                  {prova.organizadora && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {prova.organizadora}
                    </span>
                  )}
                  {prova.ano && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-100">
                      {prova.ano}
                    </span>
                  )}
                  {prova.area && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-600">
                      {prova.area}
                    </span>
                  )}
                </div>

                {/* Título & Órgão */}
                <h3 className="font-bold text-slate-900 text-base line-clamp-2 leading-snug">
                  {prova.cargo}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium mt-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{prova.orgao}</span>
                </div>
              </div>

              {/* Arquivos & Ações */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                {prova.is_downloaded && prova.downloaded_files && prova.downloaded_files.length > 0 ? (
                  <div>
                    <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      Arquivos disponíveis para visualização:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {prova.downloaded_files.map((file, fIdx) => (
                        <a
                          key={fIdx}
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm"
                        >
                          <FileText className="w-3 h-3" />
                          <span className="truncate max-w-[170px]">{file.name}</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-70 ml-0.5" />
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-400">
                      Disponível para download
                    </span>
                    <a
                      href={prova.page_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      <span>Acessar no PCI</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors"
          >
            Página Anterior
          </button>
          <span className="text-xs font-medium text-slate-600 px-3">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors"
          >
            Próxima Página
          </button>
        </div>
      )}

      {/* Dica de Uso do HD */}
      <div className="mt-12 bg-amber-50 rounded-2xl border border-amber-200 p-5 text-amber-900 flex items-start gap-3">
        <HardDrive className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-amber-950">
            Como adicionar e baixar mais provas diretamente para o site:
          </p>
          <p>
            1. Para baixar novas provas em PDF: dê dois cliques no arquivo{' '}
            <strong className="underline">D:\questions\BAIXAR_PCI_CONCURSOS.bat</strong>.
          </p>
          <p>
            2. Para expandir o catálogo para todo o Brasil: dê dois cliques no arquivo{' '}
            <strong className="underline">D:\questions\INDEXAR_CATALOGO_PCI.bat</strong>.
          </p>
          <p>
            Tudo o que for baixado ou indexado no seu computador aparece aqui automaticamente nesta aba!
          </p>
        </div>
      </div>
    </div>
  );
}
