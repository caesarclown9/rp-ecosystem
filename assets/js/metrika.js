/*
 * Яндекс.Метрика для приватного КП rp-kp.asystem.ai.
 *
 * НАСТРОЙКА: заменить __METRIKA_ID__ ниже на номер счётчика из metrika.yandex.ru
 * (создаётся на домен rp-kp.asystem.ai, включить Вебвизор + карту скроллинга).
 * Пока плейсхолдер не заменён — скрипт ничего не делает (ни запросов, ни ошибок).
 *
 * ИДЕНТИФИКАЦИЯ: персональная ссылка вида /?u=ceo помечает визит в Метрике
 * (params.recipient + цель view_recipient) и рисует вотермарку получателя.
 * Сам доступ к сайту защищает Caddy gate (token), а не этот скрипт.
 */
(function () {
  'use strict';

  var RAW_ID = '__METRIKA_ID__';
  if (!/^[0-9]+$/.test(RAW_ID)) { return; } // ID ещё не подставлен — выходим тихо
  var METRIKA_ID = parseInt(RAW_ID, 10);

  // --- официальный сниппет загрузки tag.js (идемпотентный) ---
  (function (m, e, t, r, i) {
    m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
    m[i].l = 1 * new Date();
    var s = e.getElementsByTagName(t)[0];
    for (var j = 0; j < e.scripts.length; j++) { if (e.scripts[j].src === r) { return; } }
    var a = e.createElement(t); a.async = 1; a.src = r;
    s.parentNode.insertBefore(a, s);
  })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');

  ym(METRIKA_ID, 'init', {
    webvisor: true,
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true
  });

  // --- идентификация получателя по ?u= ---
  var u = new URLSearchParams(location.search).get('u');
  if (!u) { return; }
  u = u.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 32); // санитизация метки
  if (!u) { return; }

  ym(METRIKA_ID, 'params', { recipient: u });
  ym(METRIKA_ID, 'reachGoal', 'view_recipient', { recipient: u });
  renderWatermark(u);

  // Тихая диагональная вотермарка: не мешает чтению, но деанонимизирует утечку копии.
  function renderWatermark(label) {
    function mount() {
      if (!document.body || document.getElementById('rp-wm')) { return; }
      var wm = document.createElement('div');
      wm.id = 'rp-wm';
      wm.setAttribute('aria-hidden', 'true');
      wm.style.cssText = [
        'position:fixed', 'inset:0', 'z-index:9998', 'pointer-events:none',
        'opacity:0.055', 'background-repeat:repeat',
        'background-image:url("' + tile(label) + '")'
      ].join(';');
      document.body.appendChild(wm);
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', mount, { once: true });
    } else {
      mount();
    }
  }

  function tile(label) {
    var text = 'Конфиденциально · для ' + label;
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="360" height="210">' +
      '<text x="10" y="110" transform="rotate(-28 180 105)" ' +
      'font-family="Onest, system-ui, sans-serif" font-size="15" fill="#777">' +
      esc(text) + '</text></svg>';
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
})();
