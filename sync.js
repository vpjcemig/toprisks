(function() {
  var GS_URL = 'https://script.google.com/macros/s/AKfycbwIpKsi9oDGWVTknFMMI7Vi8ByTLPb0Fb44qltjzq94eGYxtih_MYXMKFR03HBrW-HbEg/exec';

  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function init() {
    if (typeof nutRender === 'undefined') {
      setTimeout(init, 100);
      return;
    }

    // Carrega itens do Sheets
    window.nutLoadItems = function() {
      fetch(GS_URL + '?action=list')
        .then(function(r) { return r.json(); })
        .then(function(d) {
          window.nutItems = d.items || [];
          window.nutRender();
          console.log('[sync] carregado', window.nutItems.length, 'itens');
        })
        .catch(function(e) { console.error('[sync] erro load', e); });
    };

    // Intercepta o botão submit diretamente
    var btn = document.querySelector('button.btn-submit');
    if (btn) {
      // Clona para remover listeners antigos
      var novo = btn.cloneNode(true);
      btn.parentNode.replaceChild(novo, btn);

      novo.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        var nome       = val('nome');
        var supt       = val('supt');
        var gerencia   = val('gerencia');
        var tipo       = val('tipo');
        var assunto    = val('assunto');
        var desc       = val('desc');
        var prioridade = val('prioridade');

        console.log('[sync] tentando salvar:', assunto);

        if (!nome || !supt || !tipo || !assunto || !prioridade) {
          alert('Preencha todos os campos obrigatórios.');
          return;
        }

        var params = new URLSearchParams({
          action: 'add', nome: nome, supt: supt, gerencia: gerencia,
          tipo: tipo, assunto: assunto, desc: desc, prioridade: prioridade
        });

        fetch(GS_URL + '?' + params.toString())
          .then(function(r) { return r.json(); })
          .then(function(d) {
            console.log('[sync] salvo:', d);
            if (!d.ok) throw new Error(d.error);
            window.nutLoadItems();
            // Tenta fechar modal / limpar form como o código original faria
            if (typeof nutCloseModal === 'function') nutCloseModal();
            ['nome','supt','gerencia','tipo','assunto','desc','prioridade'].forEach(function(id) {
              var el = document.getElementById(id);
              if (el) el.value = '';
            });
          })
          .catch(function(e) { console.error('[sync] erro save', e); alert('Erro: ' + e.message); });
      }, true);

      console.log('[sync] botão interceptado');
    } else {
      console.warn('[sync] botão não encontrado');
    }

    // Intercepta também o form caso exista
    var form = document.querySelector('form');
    if (form) {
      form.addEventListener('submit', function(e) { e.preventDefault(); }, true);
    }

    window.nutLoadItems();
    console.log('[sync] pronto');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 300);
  }
})();
