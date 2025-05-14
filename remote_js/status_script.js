// Contenido para remote_js/status_script.js
(function() {
  // 1) Ocultar los elementos que ya tenías
  const selectores = [
    '#kt_header','#kt_toolbar','#kt_footer > div',
    '#tab_agencias > div > div > div > div > div.form > div > div.col-md-9.fv-row > div:nth-child(1) > div:nth-child(3)',
    '#tab_agencias > div > div > div > div > div.form > div > div.col-md-9.fv-row > div:nth-child(1) > div:nth-child(4)',
    '#tab_agencias > div > div > div > div > div.form > div > div.col-md-9.fv-row > div.row.mt-2 > div.col-md-3.fv-row',
    '#descargarventaexcel','#kt_footer > div','#kt_footer > div > div','#kt_footer > div > ul'
  ];
  selectores.forEach(sel => {
    const e = document.querySelector(sel);
    if (e) e.style.display = 'none';
  });

  // 2) Construir fecha “hoy” SIN desfase (hora 00:00 local)
  const ahora = new Date();
  const hoyLocal = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());

  // 3) Calcular “hace 3 meses” manteniendo día o último día del mes
  const desdeCandidate = new Date(ahora.getFullYear(), ahora.getMonth() - 2, ahora.getDate());
  const expectedMonth = (ahora.getMonth() + 12 - 3) % 12;
  let desdeLocal = desdeCandidate;
  if (desdeCandidate.getMonth() !== expectedMonth) {
    // cayó en un día inválido: ajustar al último día de ese mes
    const y2 = desdeCandidate.getFullYear();
    const lastDay = new Date(y2, expectedMonth + 1, 0).getDate();
    desdeLocal = new Date(y2, expectedMonth, lastDay);
  }

  // 4) Helper para inyectar con flatpickr
  function setFP(id, dateObj) {
    const el = document.getElementById(id);
    if (el && el._flatpickr) {
      // true = disparar change internamente y refrescar UI
      el._flatpickr.setDate(dateObj, true);
    }
  }

  setFP('desde', desdeLocal);
  setFP('hasta', hoyLocal);

  // 5) Notificar a Android
  if (typeof AndroidInterface !== 'undefined' && AndroidInterface.onActionsCompleted) {
    AndroidInterface.onActionsCompleted();
  }
})();
