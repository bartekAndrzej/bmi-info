(function () {
  'use strict';

  var lang = document.documentElement.lang === 'pl' ? 'pl' : 'en';

  var STR = {
    pl: {
      cats: ['Niedowaga', 'Prawidłowa masa ciała', 'Nadwaga', 'Otyłość I stopnia', 'Otyłość II stopnia', 'Otyłość III stopnia'],
      idealPrefix: 'Prawidłowa masa ciała przy tym wzroście to ok.',
      idealTo: 'do',
      invalid: 'Sprawdź wpisany wzrost i wagę. Wartości muszą być realistyczne.',
      empty: 'Wpisz wzrost i wagę, a wynik pojawi się od razu.',
      kg: 'kg',
      lb: 'lb',
      dec: ','
    },
    en: {
      cats: ['Underweight', 'Healthy weight', 'Overweight', 'Obesity class I', 'Obesity class II', 'Obesity class III'],
      idealPrefix: 'A healthy weight range for this height is about',
      idealTo: 'to',
      invalid: 'Check your height and weight. Values must be realistic.',
      empty: 'Enter your height and weight to see your result instantly.',
      kg: 'kg',
      lb: 'lb',
      dec: '.'
    }
  };
  var T = STR[lang];

  var form = document.getElementById('bmi-form');
  if (!form) return;

  var sysInputs = form.querySelectorAll('input[name="system"]');
  var fMetric = document.getElementById('f-h-m');
  var fImp = document.getElementById('f-h-i');
  var hCm = document.getElementById('h-cm');
  var hFt = document.getElementById('h-ft');
  var hIn = document.getElementById('h-in');
  var wIn = document.getElementById('w');
  var wLabel = document.getElementById('w-label');
  var wUnit = document.getElementById('w-unit');
  var errBox = document.getElementById('error');

  var out = document.getElementById('out');
  var empty = document.getElementById('empty');
  var bmiEl = document.getElementById('bmi');
  var catEl = document.getElementById('cat');
  var idealEl = document.getElementById('ideal');
  var marker = document.getElementById('marker');

  var system = 'metric';

  function fmt(n, digits) {
    return n.toFixed(digits).replace('.', T.dec);
  }

  function numOf(el) {
    var v = parseFloat(String(el.value).replace(',', '.'));
    return isNaN(v) ? NaN : v;
  }

  function convertInputs(toSystem) {
    if (toSystem === 'imperial') {
      var cm = numOf(hCm);
      if (!isNaN(cm)) {
        var totalIn = cm / 2.54;
        var ft = Math.floor(totalIn / 12);
        var inch = Math.round((totalIn - ft * 12) * 10) / 10;
        hFt.value = ft;
        hIn.value = inch;
      }
      var kg = numOf(wIn);
      if (!isNaN(kg)) wIn.value = Math.round(kg * 2.20462 * 10) / 10;
    } else {
      var ftV = numOf(hFt) || 0;
      var inV = numOf(hIn) || 0;
      if (hFt.value !== '' || hIn.value !== '') {
        hCm.value = Math.round((ftV * 12 + inV) * 2.54 * 10) / 10;
      }
      var lb = numOf(wIn);
      if (!isNaN(lb)) wIn.value = Math.round((lb / 2.20462) * 10) / 10;
    }
  }

  function applySystem(newSystem) {
    if (newSystem === system) return;
    convertInputs(newSystem);
    system = newSystem;
    var metric = system === 'metric';
    fMetric.hidden = !metric;
    fImp.hidden = metric;
    wLabel.textContent = metric ? wLabel.getAttribute('data-kg') : wLabel.getAttribute('data-lb');
    wUnit.textContent = metric ? T.kg : T.lb;
    compute();
  }

  function read() {
    var h, kg;
    if (system === 'metric') {
      h = numOf(hCm) / 100;
      kg = numOf(wIn);
    } else {
      var ft = numOf(hFt);
      var inch = numOf(hIn);
      if (isNaN(ft) && isNaN(inch)) return null;
      var totalIn = (isNaN(ft) ? 0 : ft) * 12 + (isNaN(inch) ? 0 : inch);
      h = totalIn * 0.0254;
      kg = numOf(wIn) * 0.45359237;
    }
    if (isNaN(h) || isNaN(kg)) return null;
    return { h: h, kg: kg };
  }

  function categoryIndex(bmi) {
    if (bmi < 18.5) return 0;
    if (bmi < 25) return 1;
    if (bmi < 30) return 2;
    if (bmi < 35) return 3;
    if (bmi < 40) return 4;
    return 5;
  }

  var CLASSES = ['c-under', 'c-normal', 'c-over', 'c-ob', 'c-ob', 'c-ob'];

  function compute() {
    var v = read();
    errBox.textContent = '';

    if (!v) {
      out.hidden = true;
      empty.hidden = false;
      return;
    }

    if (v.h < 0.5 || v.h > 2.72 || v.kg < 2 || v.kg > 500) {
      out.hidden = true;
      empty.hidden = true;
      errBox.textContent = T.invalid;
      return;
    }

    var bmi = v.kg / (v.h * v.h);
    var idx = categoryIndex(bmi);

    var loKg = 18.5 * v.h * v.h;
    var hiKg = 24.9 * v.h * v.h;
    var lo, hi, unit;
    if (system === 'metric') {
      lo = fmt(Math.round(loKg * 10) / 10, 1);
      hi = fmt(Math.round(hiKg * 10) / 10, 1);
      unit = T.kg;
    } else {
      lo = Math.round(loKg * 2.20462).toString();
      hi = Math.round(hiKg * 2.20462).toString();
      unit = T.lb;
    }

    bmiEl.textContent = fmt(bmi, 1);
    catEl.textContent = T.cats[idx];
    catEl.className = 'cat ' + CLASSES[idx];
    idealEl.textContent = T.idealPrefix + ' ' + lo + '–' + hi + ' ' + unit + '.';

    var clamped = Math.min(Math.max(bmi, 15), 40);
    marker.style.left = ((clamped - 15) / 25 * 100) + '%';
    marker.hidden = false;

    empty.hidden = true;
    out.hidden = false;
  }

  sysInputs.forEach(function (r) {
    r.addEventListener('change', function () {
      if (r.checked) applySystem(r.value);
    });
  });

  form.addEventListener('input', compute);
  form.addEventListener('submit', function (e) { e.preventDefault(); });

  // Initial state: empty result until the user types something
  compute();
})();
