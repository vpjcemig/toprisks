// sync.js - cola este arquivo no repositório GitHub e adicione
// <script src="sync.js"></script> antes do </body> no index.html

(function() {
  var GS_URL = 'https://script.google.com/macros/s/AKfycbwIpKsi9oDGWVTknFMMI7Vi8ByTLPb0Fb44qltjzq94eGYxtih_MYXMKFR03HBrW-HbEg/exec';

  // Aguarda o DOM carregar
  function init() {
    // Sobrescreve as funções de storage do NUT
    if (typeof nutLoadItems === 'undefined') {
      setTimeout(init, 100);
      return;
    }

    console.log('[sync.js] Interceptando funções NUT...');

    // Sobrescreve nutLoadItems
    window.nutLoadItems = function() {
      fetch(GS_URL + '?action=list')
        .then(function(r) { return r.json(); })
        .then(function(d) {
          console.log('[sync.js] Dados carregados:', d);
          window.nutItems = d.items || [];
          window.nutRender();
        })
        .catch(function(e) {
          console.error('[sync.js] Erro ao carregar:', e);
          // fallback localStorage
          window.nutItems = JSON.parse(localStorage.getItem('nutVpjItems') || '[]');
          window.nutRender();
        });
    };

    // Sobrescreve nutSaveItem
    window.nutSaveItem = function(payload) {
      var params = new URLSearchParams({
        action: 'add',
        nome: payload.nome || '',
        supt: payload.supt || '',
        gerencia: payload.gerencia || '',
        tipo: payload.tipo || '',
        assunto: payload.assunto || '',
        desc: payload.desc || '',
        prioridade: payload.prioridade || ''
      });
      return fetch(GS_URL + '?' + params.toString())
        .then(function(r) { return r.json(); })
        .then(function(d) {
          console.log('[sync.js] Item salvo:', d);
          if (!d.ok) throw new Error(d.error || 'Erro ao salvar');
        });
    };

    // Sobrescreve nutDeleteItem
    window.nutDeleteItem = function(id) {
      return fetch(GS_URL + '?action=delete&id=' + encodeURIComponent(id))
        .then(function(r) { return r.json(); })
        .then(function(d) {
          console.log('[sync.js] Item removido:', d);
          if (!d.ok) throw new Error(d.error || 'Erro ao remover');
        });
    };

    // Carrega dados iniciais
    window.nutLoadItems();
    console.log('[sync.js] Pronto!');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 200);
  }
})();
