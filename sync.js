(function() {
  var GS_URL = 'https://script.google.com/macros/s/AKfycbwIpKsi9oDGWVTknFMMI7Vi8ByTLPb0Fb44qltjzq94eGYxtih_MYXMKFR03HBrW-HbEg/exec';

  function init() {
    if (typeof nutRender === 'undefined') {
      setTimeout(init, 100);
      return;
    }

    console.log('[sync.js] Iniciando...');

    window.nutLoadItems = function() {
      fetch(GS_URL + '?action=list')
        .then(function(r) { return r.json(); })
        .then(function(d) {
          console.log('[sync.js] Carregado:', d.items.length, 'itens');
          window.nutItems = d.items || [];
          window.nutRender();
        })
        .catch(function(e) { console.error('[sync.js] Erro load:', e); });
    };

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
      console.log('[sync.js] Salvando:', payload.assunto);
      return fetch(GS_URL + '?' + params.toString())
        .then(function(r) { return r.json(); })
        .then(function(d) {
          console.log('[sync.js] Salvo:', d);
          if (!d.ok) throw new Error(d.error || 'Erro ao salvar');
        });
    };

    window.nutDeleteItem = function(id) {
      return fetch(GS_URL + '?action=delete&id=' + encodeURIComponent(id))
        .then(function(r) { return r.json(); })
        .then(function(d) {
          if (!d.ok) throw new Error(d.error || 'Erro ao remover');
        });
    };

    // Sobrescreve nutSubmit para garantir que usa o novo nutSaveItem
    window.nutSubmit = function() {
      var nome      = (document.getElementById('nome') || {}).value || '';
      var supt      = (document.getElementById('supt') || {}).value || '';
      var gerencia  = (document.getElementById('gerencia') || {}).value || '';
      var tipo      = (document.getElementById('tipo') || {}).value || '';
      var assunto   = (document.getElementById('assunto') || {}).value || '';
      var desc      = (document.getElementById('desc') || {}).value || '';
      var prioridade= (document.getElementById('prioridade') || {}).value || '';

      if (!nome || !supt || !tipo || !assunto || !prioridade) {
        alert('Preencha todos os campos obrigatórios.');
        return;
      }

      window.nutSaveItem({ nome:nome, supt:supt, gerencia:gerencia, tipo:tipo, assunto:assunto, desc:desc, prioridade:prioridade })
        .then(function() {
          window.nutLoadItems();
          // Fecha modal se existir
          var modal = document.getElementById('modal');
          if (modal) modal.style.display = 'none';
          // Limpa formulário
          ['nome','supt','gerencia','tipo','assunto','desc','prioridade'].forEach(function(id) {
            var el = document.getElementById(id);
            if (el) el.value = '';
          });
        })
        .catch(function(e) {
          console.error('[sync.js] Erro ao salvar:', e);
          alert('Erro ao salvar: ' + e.message);
        });
    };

    // Religa o botão de submit ao novo nutSubmit
    var btnSubmit = document.querySelector('[onclick*="nutSubmit"]');
    if (btnSubmit) {
      btnSubmit.onclick = window.nutSubmit;
      console.log('[sync.js] Botão submit religado.');
    }

    window.nutLoadItems();
    console.log('[sync.js] Pronto!');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 300);
  }
})();
