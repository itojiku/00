/* PDF.js provides custom controls on HTTP; use the browser PDF viewer for file:// previews. */
(() => {
  const canvas = document.querySelector('.pdf-canvas');
  if (!canvas) return;

  if (location.protocol === 'file:') {
    document.body.classList.add('file-pdf-fallback');
    document.querySelector('[data-pdf-status]').hidden = true;
    return;
  }

import('../vendor/pdfjs/pdf.mjs').then(({ getDocument, GlobalWorkerOptions }) => {
  canvas.hidden = false;
  document.querySelector('.pdf-native-frame').hidden = true;

  GlobalWorkerOptions.workerSrc = '../vendor/pdfjs/pdf.worker.mjs';
  const pageInput = document.querySelector('#page-number');
  const pageCount = document.querySelector('[data-page-count]');
  const status = document.querySelector('[data-pdf-status]');
  const context = canvas.getContext('2d', { alpha: false });
  let page = 1;
  let scale = 1;
  let pdf;
  let renderTask;

  const render = async () => {
    if (!pdf) return;
    if (renderTask) renderTask.cancel();
    const pdfPage = await pdf.getPage(page);
    const baseViewport = pdfPage.getViewport({ scale: 1 });
    const availableWidth = document.querySelector('.pdf-stage').clientWidth - 42;
    const effectiveScale = scale === 'fit' ? Math.min(1.65, availableWidth / baseViewport.width) : scale;
    const viewport = pdfPage.getViewport({ scale: effectiveScale });
    const outputScale = window.devicePixelRatio || 1;
    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;
    renderTask = pdfPage.render({ canvasContext: context, viewport, transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null });
    try {
      await renderTask.promise;
      status.hidden = true;
    } catch (error) {
      if (error?.name !== 'RenderingCancelledException') throw error;
    }
    pageInput.value = String(page);
  };

  const setPage = (value) => {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed) || parsed < 1) return;
    page = Math.min(parsed, pdf.numPages);
    render();
  };

  pageInput.addEventListener('change', () => setPage(pageInput.value));
  document.querySelector('[data-page-prev]').addEventListener('click', () => setPage(page - 1));
  document.querySelector('[data-page-next]').addEventListener('click', () => setPage(page + 1));
  document.querySelector('[data-zoom-in]').addEventListener('click', () => { scale = Math.min((scale === 'fit' ? 1 : scale) + .15, 2.5); render(); });
  document.querySelector('[data-zoom-out]').addEventListener('click', () => { scale = Math.max((scale === 'fit' ? 1 : scale) - .15, .5); render(); });
  document.querySelector('[data-fit-width]').addEventListener('click', () => { scale = 'fit'; render(); });
  document.querySelector('.pdf-stage').addEventListener('contextmenu', (event) => event.preventDefault());
  window.addEventListener('resize', () => { if (scale === 'fit') render(); });

  getDocument({ url: '../assets/computer-systems-and-representations.pdf' }).promise
    .then((document) => {
      pdf = document;
      pageCount.textContent = String(pdf.numPages);
      status.textContent = '';
      scale = 'fit';
      render();
    })
    .catch(() => { status.textContent = 'This document could not be loaded. Please refresh the page.'; });
}).catch(() => {
  document.body.classList.add('file-pdf-fallback');
  canvas.hidden = true;
  const status = document.querySelector('[data-pdf-status]');
  status.hidden = true;
});
})();
