(function() {
  var GS_URL = 'https://script.google.com/macros/s/AKfycbwIpKsi9oDGWVTknFMMI7Vi8ByTLPb0Fb44qltjzq94eGYxtih_MYXMKFR03HBrW-HbEg/exec';

  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function radioVal(name) {
    var el = document.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : '';
  }

  function init() {
    if (typeof nutRender === 'undefined') {
      setTimeout(init, 100);
      return;
    }

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

    var btn = document.querySelector('button.btn-submit');
    if (btn) {
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
        var desc       = val('descricao');
        var prioridade = radioVal('prioridade');

        console.log('[sync] salvando:', {nome, supt, tipo, assunto, prioridade});

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
            if (typeof nutCloseModal === 'function') nutCloseModal();
            ['nome','assunto','descricao'].forEach(function(id) {
              var el = document.getElementById(id);
              if (el) el.value = '';
            });
            document.querySelectorAll('input[name="prioridade"]').forEach(function(el) {
              el.checked = false;
            });
            var sel = document.getElementById('supt');
            if (sel) sel.selectedIndex = 0;
            var sel2 = document.getElementById('gerencia');
            if (sel2) sel2.selectedIndex = 0;
            var sel3 = document.getElementById('tipo');
            if (sel3) sel3.selectedIndex = 0;
          })
          .catch(function(e) { console.error('[sync] erro save', e); alert('Erro: ' + e.message); });
      }, true);

      console.log('[sync] botão interceptado');
    }

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
