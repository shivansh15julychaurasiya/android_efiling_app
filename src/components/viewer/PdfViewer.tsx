import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { WebView } from 'react-native-webview';

/* =========================================================
   TYPES
========================================================= */

type PdfViewerProps = {
  pdfUri: string;
};

type PdfViewerMessage = {
  type: 'engine-loaded' | 'loaded' | 'error' | 'progress';
  message?: string;
  pages?: number;
  bookmarks?: boolean;
};

/* =========================================================
   PDF.JS ASSETS

   Keep these files in:
   src/assets/pdfjs/pdf.min.txt
   src/assets/pdfjs/pdf.worker.min.txt
========================================================= */

const PDF_JS_MODULE = require('../../assets/pdfjs/pdf.min.txt');
const PDF_WORKER_MODULE = require('../../assets/pdfjs/pdf.worker.min.txt');

/* =========================================================
   READ BUNDLED PDF.JS ASSET
========================================================= */

async function readPdfJsAsset(
  moduleId: number,
  fileName: string,
): Promise<string> {
  console.log(`[PDF VIEWER] Loading ${fileName}`);

  const asset = Asset.fromModule(moduleId);

  await asset.downloadAsync();

  const localUri = asset.localUri;

  if (!localUri) {
    throw new Error(
      `${fileName}: local asset URI is unavailable.`,
    );
  }

  const source = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  if (!source || !source.trim()) {
    throw new Error(`${fileName}: asset is empty.`);
  }

  console.log(
    `[PDF VIEWER] ${fileName} loaded: ${source.length} characters`,
  );

  return source;
}

/* =========================================================
   PDF VIEWER COMPONENT
========================================================= */

export default function PdfViewer({
  pdfUri,
}: PdfViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pdfJsSource, setPdfJsSource] = useState('');
  const [pdfWorkerSource, setPdfWorkerSource] = useState('');

  const [progressText, setProgressText] = useState(
    'Preparing PDF viewer...',
  );

  /* =======================================================
     LOAD PDF.JS AND WORKER ASSETS
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        setLoading(true);
        setError(null);

        setProgressText('Preparing PDF viewer...');

        const [library, worker] = await Promise.all([
          readPdfJsAsset(
            PDF_JS_MODULE,
            'pdf.min.txt',
          ),
          readPdfJsAsset(
            PDF_WORKER_MODULE,
            'pdf.worker.min.txt',
          ),
        ]);

        if (!mounted) {
          return;
        }

        setPdfJsSource(library);
        setPdfWorkerSource(worker);

        setProgressText('Opening document...');
      } catch (err) {
        console.error(
          '[PDF VIEWER] Initialization failed:',
          err,
        );

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to initialize PDF viewer.',
          );

          setLoading(false);
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, []);

  /* =======================================================
     CREATE PDF VIEWER HTML

     The PDF itself is loaded from pdfUri.
     It is NOT converted into Base64.
  ======================================================= */

  const html = useMemo(() => {
    if (
      !pdfUri ||
      !pdfJsSource ||
      !pdfWorkerSource
    ) {
      return '';
    }

    const safePdfUri = JSON.stringify(pdfUri);
    const safeWorkerSource = JSON.stringify(pdfWorkerSource);

    const safePdfJsSource = pdfJsSource.replace(
      /<\/script/gi,
      '<\\/script',
    );

    return `<!DOCTYPE html>
<html>
<head>

<meta
  name="viewport"
  content="width=device-width, initial-scale=1, maximum-scale=3"
/>

<style>

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100%;
  background: #e9edf3;
  font-family: Arial, sans-serif;
}

body {
  overflow-x: hidden;
}

/* TOOLBAR */

#toolbar {
  position: sticky;
  top: 0;
  z-index: 20;

  background: #071a3d;
  color: white;

  padding: 9px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 7px;

  box-shadow: 0 2px 6px #0003;
}

.toolbar-button {
  background: #d4af37;
  border: none;
  border-radius: 6px;

  padding: 9px 13px;

  font-size: 16px;
  font-weight: bold;

  color: #071a3d;
}

.toolbar-button:active {
  opacity: 0.75;
}

#bookmarkButton {
  display: none;
  font-size: 12px;
  padding: 10px 9px;
}

#pageInfo {
  font-size: 12px;
  font-weight: bold;
  text-align: center;
  flex: 1;
}

/* STATUS */

#status {
  text-align: center;
  padding: 25px 18px;

  color: #333;
  font-size: 13px;
}

/* PDF PAGES */

#pages {
  padding: 12px 0;
  width: 100%;
}

.page-wrapper {
  position: relative;

  width: 100%;

  min-height: 300px;

  margin: 0 auto 14px;

  background: #fff;

  overflow: hidden;

  scroll-margin-top: 65px;

  box-shadow: 0 2px 8px #0002;
}

.page-placeholder {
  width: 100%;
  height: 100%;
  min-height: 300px;

  display: flex;
  justify-content: center;
  align-items: center;

  color: #9aa3af;
  font-size: 12px;

  background: #fff;
}

.page-canvas {
  display: block;

  max-width: none;

  margin: 0 auto;

  background: white;
}

/* BOOKMARKS */

#bookmarkPanel {
  display: none;

  position: fixed;

  top: 58px;
  left: 9px;
  right: 9px;

  max-height: 70vh;

  z-index: 100;

  background: white;

  border-radius: 10px;

  box-shadow: 0 5px 25px #0005;

  overflow: hidden;
}

#bookmarkHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 13px 15px;

  background: #071a3d;
  color: white;

  font-weight: bold;
}

#closeBookmarks {
  background: transparent;
  color: white;
  border: none;
  font-size: 23px;
}

#bookmarkList {
  overflow-y: auto;

  max-height: calc(70vh - 48px);

  padding: 7px 0;
}

.bookmark-row {
  display: flex;
  align-items: center;

  width: 100%;
  min-height: 42px;

  border-bottom: 1px solid #edf0f4;
}

.bookmark-toggle {
  flex-shrink: 0;

  width: 34px;
  height: 40px;

  border: none;
  background: transparent;

  color: #071a3d;
}

.bookmark-toggle.empty {
  visibility: hidden;
}

.bookmark-title {
  flex: 1;

  text-align: left;

  background: transparent;
  border: none;

  padding: 10px 8px;

  color: #26364d;

  font-size: 13px;
  line-height: 19px;

  min-width: 0;
}

</style>
</head>

<body>

<div id="toolbar">

  <button
    id="bookmarkButton"
    class="toolbar-button"
    onclick="toggleBookmarks()"
  >
    ☰ Bookmarks
  </button>

  <button
    class="toolbar-button"
    onclick="changeZoom(-0.15)"
  >
    −
  </button>

  <span id="pageInfo">
    Loading PDF...
  </span>

  <button
    class="toolbar-button"
    onclick="changeZoom(0.15)"
  >
    +
  </button>

</div>

<div id="bookmarkPanel">

  <div id="bookmarkHeader">

    <span>Document Bookmarks</span>

    <button
      id="closeBookmarks"
      onclick="toggleBookmarks(false)"
    >
      ×
    </button>

  </div>

  <div id="bookmarkList">
    <div style="padding:20px;text-align:center">
      Loading bookmarks...
    </div>
  </div>

</div>

<div id="status">
  Initializing PDF viewer...
</div>

<div id="pages"></div>

<script>
${safePdfJsSource}
</script>

<script>

(function () {

  'use strict';

  /* =====================================================
     CONFIGURATION
  ===================================================== */

  const pdfUri = ${safePdfUri};

  const workerSource = ${safeWorkerSource};

  let pdfDoc = null;

  let zoom = 1;

  let observer = null;

  let workerUrl = null;

  let bookmarksAvailable = false;

  let disposed = false;

  let zoomChanging = false;

  const renderingTasks = new Map();

  const renderingJobs = new Map();

  const renderedPages = new Set();

  let pageElements = [];

  /* =====================================================
     NATIVE COMMUNICATION
  ===================================================== */

  function sendMessage(data) {
    try {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(
          JSON.stringify(data)
        );
      }
    } catch (error) {
      console.warn(
        '[PDF VIEWER] Native message error:',
        error
      );
    }
  }

  /* =====================================================
     STATUS AND ERROR
  ===================================================== */

  function setStatus(message) {
    const status = document.getElementById('status');

    if (!status) {
      return;
    }

    status.style.display = 'block';
    status.textContent = message;
  }

  function hideStatus() {
    const status = document.getElementById('status');

    if (status) {
      status.style.display = 'none';
    }
  }

  function showError(message) {
    if (disposed) {
      return;
    }

    const status = document.getElementById('status');

    if (status) {
      status.style.display = 'block';
      status.textContent = 'Unable to load PDF: ' + message;
    }

    sendMessage({
      type: 'error',
      message: message
    });
  }

  /* =====================================================
     INITIALIZE PDF.JS
  ===================================================== */

  async function initialize() {
    try {

      if (!window.pdfjsLib ||
          !window.pdfjsLib.getDocument) {

        throw new Error(
          'PDF.js library was not initialized.'
        );
      }

      if (!pdfUri) {
        throw new Error(
          'PDF file URI is missing.'
        );
      }

      if (!workerSource) {
        throw new Error(
          'PDF.js worker source is missing.'
        );
      }

      const workerBlob = new Blob(
        [workerSource],
        {
          type: 'text/javascript'
        }
      );

      workerUrl = URL.createObjectURL(workerBlob);

      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        workerUrl;

      sendMessage({
        type: 'engine-loaded'
      });

      await loadPdf();

    } catch (error) {

      console.error(
        '[PDF VIEWER] Initialization error:',
        error
      );

      showError(
        error && error.message
          ? error.message
          : String(error)
      );

    }
  }

  /* =====================================================
     LOAD PDF DOCUMENT
  ===================================================== */

  async function loadPdf() {

    try {

      setStatus('Opening PDF document...');

      console.log(
        '[PDF VIEWER] Loading local PDF:',
        pdfUri
      );

      const loadingTask =
        window.pdfjsLib.getDocument({

          url: pdfUri,

          useWorkerFetch: false,

          isEvalSupported: false,

          disableRange: true,

          disableStream: true,

          disableAutoFetch: true,

          stopAtErrors: false

        });

      loadingTask.onProgress = function (progress) {

        if (
          !progress ||
          disposed
        ) {
          return;
        }

        let message = 'Reading PDF...';

        if (progress.total > 0) {

          const percent = Math.round(
            progress.loaded / progress.total * 100
          );

          message = 'Reading PDF: ' + percent + '%';

        }

        setStatus(message);

        sendMessage({
          type: 'progress',
          message: message
        });

      };

      pdfDoc = await loadingTask.promise;

      if (disposed) {
        return;
      }

      if (!pdfDoc || !pdfDoc.numPages) {
        throw new Error(
          'The PDF document contains no pages.'
        );
      }

      document.getElementById('pageInfo').textContent =
        pdfDoc.numPages + ' Pages';

      await createPagePlaceholders();

      if (disposed) {
        return;
      }

      await loadBookmarks();

      if (disposed) {
        return;
      }

      hideStatus();

      sendMessage({
        type: 'loaded',
        pages: pdfDoc.numPages,
        bookmarks: bookmarksAvailable
      });

      console.log(
        '[PDF VIEWER] PDF loaded successfully. Pages:',
        pdfDoc.numPages
      );

    } catch (error) {

      console.error(
        '[PDF VIEWER] PDF load error:',
        error
      );

      showError(
        error && error.message
          ? error.message
          : 'Could not read the local PDF file. Check WebView file access.'
      );

    }

  }

  /* =====================================================
     CREATE LIGHTWEIGHT PAGE PLACEHOLDERS
  ===================================================== */

  async function createPagePlaceholders() {

    const container =
      document.getElementById('pages');

    if (!container || !pdfDoc) {
      return;
    }

    container.innerHTML = '';

    pageElements = [];

    for (
      let pageNumber = 1;
      pageNumber <= pdfDoc.numPages;
      pageNumber++
    ) {

      if (disposed) {
        return;
      }

      const wrapper = document.createElement('div');

      wrapper.className = 'page-wrapper';

      wrapper.id = 'page-' + pageNumber;

      wrapper.style.aspectRatio = '0.707';

      const placeholder =
        document.createElement('div');

      placeholder.className = 'page-placeholder';

      placeholder.textContent =
        'Page ' + pageNumber;

      wrapper.appendChild(placeholder);

      container.appendChild(wrapper);

      pageElements.push(wrapper);

    }

    if (observer) {
      observer.disconnect();
    }

    observer = new IntersectionObserver(

      function (entries) {

        if (disposed || zoomChanging) {
          return;
        }

        entries.forEach(function (entry) {

          const pageNumber = Number(
            entry.target.id.replace('page-', '')
          );

          if (!pageNumber) {
            return;
          }

          if (entry.isIntersecting) {

            renderPage(pageNumber);

            document.getElementById('pageInfo').textContent =
              'Page ' + pageNumber + ' / ' + pdfDoc.numPages;

          } else {

            const rect = entry.boundingClientRect;

            const farAway =
              rect.bottom < -1400 ||
              rect.top > window.innerHeight + 1400;

            if (farAway) {
              releasePage(pageNumber);
            }

          }

        });

      },

      {
        root: null,
        rootMargin: '800px 0px',
        threshold: 0.01
      }

    );

    pageElements.forEach(function (element) {
      observer.observe(element);
    });

    renderPage(1);

  }

  /* =====================================================
     RENDER ONE PAGE

     Only nearby pages are rendered.
     Rendering tasks are tracked to avoid duplicate work.
  ===================================================== */

  function renderPage(pageNumber) {

    if (
      !pdfDoc ||
      disposed ||
      zoomChanging ||
      renderedPages.has(pageNumber) ||
      renderingJobs.has(pageNumber)
    ) {
      return;
    }

    const wrapper =
      document.getElementById('page-' + pageNumber);

    if (!wrapper) {
      return;
    }

    const job = performRenderPage(pageNumber);

    renderingJobs.set(pageNumber, job);

    job.then(
      function () {
        if (renderingJobs.get(pageNumber) === job) {
          renderingJobs.delete(pageNumber);
        }
      },
      function () {
        if (renderingJobs.get(pageNumber) === job) {
          renderingJobs.delete(pageNumber);
        }
      }
    );

  }

  async function performRenderPage(pageNumber) {

    let page = null;

    let renderTask = null;

    try {

      if (disposed || !pdfDoc) {
        return;
      }

      const wrapper =
        document.getElementById('page-' + pageNumber);

      if (!wrapper) {
        return;
      }

      page = await pdfDoc.getPage(pageNumber);

      if (disposed) {
        return;
      }

      const baseViewport =
        page.getViewport({
          scale: 1
        });

      const availableWidth = Math.max(
        280,
        document.documentElement.clientWidth - 12
      );

      const fitScale =
        availableWidth / baseViewport.width;

      const scale = fitScale * zoom;

      const viewport =
        page.getViewport({
          scale: scale
        });

      wrapper.style.aspectRatio =
        viewport.width + ' / ' + viewport.height;

      wrapper.style.minHeight = '0';

      const placeholder =
        wrapper.querySelector('.page-placeholder');

      if (placeholder) {
        placeholder.remove();
      }

      const canvas =
        document.createElement('canvas');

      canvas.className = 'page-canvas';

      const pixelRatio = Math.min(
        window.devicePixelRatio || 1,
        1.5
      );

      canvas.width = Math.floor(
        viewport.width * pixelRatio
      );

      canvas.height = Math.floor(
        viewport.height * pixelRatio
      );

      canvas.style.width =
        viewport.width + 'px';

      canvas.style.height =
        viewport.height + 'px';

      const context = canvas.getContext(
        '2d',
        {
          alpha: false
        }
      );

      if (!context) {
        throw new Error(
          'Unable to create PDF canvas.'
        );
      }

      wrapper.appendChild(canvas);

      renderTask = page.render({

        canvasContext: context,

        viewport: viewport,

        transform: pixelRatio !== 1
          ? [
              pixelRatio,
              0,
              0,
              pixelRatio,
              0,
              0
            ]
          : null

      });

      renderingTasks.set(
        pageNumber,
        renderTask
      );

      await renderTask.promise;

      if (disposed) {
        canvas.width = 0;
        canvas.height = 0;
        canvas.remove();
        return;
      }

      renderedPages.add(pageNumber);

    } catch (error) {

      if (
        error &&
        error.name !== 'RenderingCancelledException' &&
        !disposed
      ) {

        console.error(
          '[PDF VIEWER] Page rendering error:',
          pageNumber,
          error
        );

        const wrapper =
          document.getElementById('page-' + pageNumber);

        if (wrapper && !wrapper.querySelector('canvas')) {

          const placeholder =
            wrapper.querySelector('.page-placeholder');

          if (placeholder) {
            placeholder.textContent =
              'Unable to render page ' + pageNumber;
          }

        }

      }

    } finally {

      if (
        renderingTasks.get(pageNumber) === renderTask
      ) {
        renderingTasks.delete(pageNumber);
      }

      if (page) {
        try {
          page.cleanup();
        } catch (error) {
          console.warn(
            '[PDF VIEWER] Page cleanup error:',
            error
          );
        }
      }

    }

  }

  /* =====================================================
     RELEASE OFF-SCREEN PAGE CANVAS
  ===================================================== */

  function releasePage(pageNumber) {

    // Do not remove a canvas while it is still rendering.
    if (renderingJobs.has(pageNumber)) {
      return;
    }

    if (!renderedPages.has(pageNumber)) {
      return;
    }

    const wrapper =
      document.getElementById('page-' + pageNumber);

    if (!wrapper) {
      renderedPages.delete(pageNumber);
      return;
    }

    const canvas =
      wrapper.querySelector('canvas');

    if (canvas) {

      // Release the canvas backing store.
      canvas.width = 0;
      canvas.height = 0;

      canvas.remove();

    }

    const placeholder =
      document.createElement('div');

    placeholder.className = 'page-placeholder';

    placeholder.textContent =
      'Page ' + pageNumber;

    wrapper.appendChild(placeholder);

    renderedPages.delete(pageNumber);

  }

  /* =====================================================
     ZOOM

     Wait for current rendering jobs before releasing
     canvases and rendering again.
  ===================================================== */

  async function changeZoom(value) {

    if (disposed || zoomChanging) {
      return;
    }

    const nextZoom = Math.max(
      0.65,
      Math.min(2.0, zoom + value)
    );

    if (nextZoom === zoom) {
      return;
    }

    zoomChanging = true;

    try {

      const activeJobs =
        Array.from(renderingJobs.values());

      await Promise.allSettled(activeJobs);

      if (disposed) {
        return;
      }

      Array.from(renderedPages).forEach(
        function (pageNumber) {
          releasePage(pageNumber);
        }
      );

      zoom = nextZoom;

      const visiblePages = [];

      pageElements.forEach(function (element) {

        const rect =
          element.getBoundingClientRect();

        if (
          rect.bottom >= -800 &&
          rect.top <= window.innerHeight + 800
        ) {

          const pageNumber = Number(
            element.id.replace('page-', '')
          );

          if (pageNumber) {
            visiblePages.push(pageNumber);
          }

        }

      });

      zoomChanging = false;

      visiblePages.forEach(function (pageNumber) {
        renderPage(pageNumber);
      });

    } catch (error) {

      console.error(
        '[PDF VIEWER] Zoom error:',
        error
      );

      zoomChanging = false;

    }

  }

  /* =====================================================
     BOOKMARKS
  ===================================================== */

  async function loadBookmarks() {

    try {

      if (!pdfDoc) {
        return;
      }

      const outline =
        await pdfDoc.getOutline();

      if (disposed) {
        return;
      }

      const button =
        document.getElementById('bookmarkButton');

      const list =
        document.getElementById('bookmarkList');

      if (!button || !list) {
        return;
      }

      list.innerHTML = '';

      if (!outline || !outline.length) {

        bookmarksAvailable = false;

        button.style.display = 'none';

        list.textContent =
          'No bookmarks available.';

        return;

      }

      bookmarksAvailable = true;

      button.style.display = 'block';

      renderOutline(
        outline,
        list,
        0
      );

    } catch (error) {

      console.warn(
        '[PDF VIEWER] Bookmark loading failed:',
        error
      );

      bookmarksAvailable = false;

      const button =
        document.getElementById('bookmarkButton');

      if (button) {
        button.style.display = 'none';
      }

    }

  }

  function renderOutline(items, parent, level) {

    items.forEach(function (item) {

      const row =
        document.createElement('div');

      row.className = 'bookmark-row';

      const hasChildren =
        item.items && item.items.length > 0;

      const toggle =
        document.createElement('button');

      toggle.className = hasChildren
        ? 'bookmark-toggle'
        : 'bookmark-toggle empty';

      toggle.textContent =
        hasChildren ? '▸' : '';

      const title =
        document.createElement('button');

      title.className = 'bookmark-title';

      title.textContent =
        item.title || 'Untitled bookmark';

      title.style.paddingLeft =
        (8 + level * 12) + 'px';

      title.onclick = function () {
        goToBookmark(item);
      };

      row.appendChild(toggle);

      row.appendChild(title);

      parent.appendChild(row);

      if (hasChildren) {

        const children =
          document.createElement('div');

        children.style.display = 'none';

        renderOutline(
          item.items,
          children,
          level + 1
        );

        parent.appendChild(children);

        toggle.onclick = function () {

          const open =
            children.style.display !== 'none';

          children.style.display =
            open ? 'none' : 'block';

          toggle.textContent =
            open ? '▸' : '▾';

        };

      }

    });

  }

  /* =====================================================
     NAVIGATE TO BOOKMARK
  ===================================================== */

  async function goToBookmark(item) {

    try {

      if (!pdfDoc || disposed) {
        return;
      }

      let destination = item.dest;

      if (typeof destination === 'string') {

        destination =
          await pdfDoc.getDestination(destination);

      }

      if (
        !Array.isArray(destination) ||
        !destination[0]
      ) {
        return;
      }

      const pageIndex =
        await pdfDoc.getPageIndex(destination[0]);

      const pageNumber = pageIndex + 1;

      const target =
        document.getElementById(
          'page-' + pageNumber
        );

      if (!target) {
        return;
      }

      toggleBookmarks(false);

      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

      renderPage(pageNumber);

    } catch (error) {

      console.warn(
        '[PDF VIEWER] Bookmark navigation failed:',
        error
      );

    }

  }

  /* =====================================================
     TOGGLE BOOKMARK PANEL
  ===================================================== */

  function toggleBookmarks(forceState) {

    const panel =
      document.getElementById('bookmarkPanel');

    if (!panel) {
      return;
    }

    const shouldOpen =
      typeof forceState === 'boolean'
        ? forceState
        : panel.style.display !== 'block';

    panel.style.display =
      shouldOpen ? 'block' : 'none';

  }

  /* =====================================================
     WINDOW FUNCTIONS
  ===================================================== */

  window.changeZoom = changeZoom;

  window.toggleBookmarks = toggleBookmarks;

  /* =====================================================
     CLEANUP
  ===================================================== */

  window.addEventListener(
    'beforeunload',
    function () {

      disposed = true;

      if (observer) {
        observer.disconnect();
        observer = null;
      }

      renderingTasks.forEach(function (task) {

        if (
          task &&
          typeof task.cancel === 'function'
        ) {

          try {
            task.cancel();
          } catch (error) {
            console.warn(
              '[PDF VIEWER] Render cancellation error:',
              error
            );
          }

        }

      });

      renderingTasks.clear();

      renderedPages.clear();

      if (pdfDoc) {

        try {
          pdfDoc.destroy();
        } catch (error) {
          console.warn(
            '[PDF VIEWER] PDF cleanup error:',
            error
          );
        }

        pdfDoc = null;

      }

      if (workerUrl) {

        try {
          URL.revokeObjectURL(workerUrl);
        } catch (error) {
          console.warn(
            '[PDF VIEWER] Worker cleanup error:',
            error
          );
        }

        workerUrl = null;

      }

    }
  );

  /* =====================================================
     START
  ===================================================== */

  initialize();

})();

</script>

</body>
</html>`;
  }, [pdfUri, pdfJsSource, pdfWorkerSource]);

  /* =======================================================
     RECEIVE WEBVIEW MESSAGES
  ======================================================= */

  const handleWebViewMessage = useCallback(
    (event: { nativeEvent: { data: string } }) => {
      try {
        const message = JSON.parse(
          event.nativeEvent.data,
        ) as PdfViewerMessage;

        switch (message.type) {
          case 'engine-loaded':
            setProgressText(
              'PDF engine ready. Reading document...',
            );
            break;

          case 'progress':
            setProgressText(
              message.message || 'Loading PDF...',
            );
            break;

          case 'loaded':
            setLoading(false);
            setError(null);

            console.log(
              '[PDF VIEWER] PDF loaded successfully. Pages:',
              message.pages,
              'Bookmarks:',
              message.bookmarks,
            );
            break;

          case 'error':
            setLoading(false);

            setError(
              message.message || 'Unable to display PDF.',
            );

            console.error(
              '[PDF VIEWER] PDF error:',
              message.message,
            );
            break;

          default:
            break;
        }
      } catch (err) {
        console.warn(
          '[PDF VIEWER] Message parsing error:',
          err,
        );
      }
    },
    [],
  );

  /* =======================================================
     WEBVIEW ERROR HANDLER
  ======================================================= */

  const handleWebViewError = useCallback(
    (event: any) => {
      const description =
        event?.nativeEvent?.description ||
        'Unable to load the PDF viewer WebView.';

      console.error(
        '[PDF VIEWER] WebView error:',
        event?.nativeEvent,
      );

      setLoading(false);
      setError(description);
    },
    [],
  );

  /* =======================================================
     ANDROID WEBVIEW RENDERER ERROR
  ======================================================= */

  const handleRenderProcessGone = useCallback(
    (event: any) => {
      console.error(
        '[PDF VIEWER] WebView renderer stopped:',
        event?.nativeEvent,
      );

      setLoading(false);

      setError(
        'The PDF viewer process stopped. The document may be too large for the available memory. Close the document and try again.',
      );
    },
    [],
  );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <View style={styles.container}>
      {!!html && !error && (
        <WebView
          source={{
            html,
            baseUrl: 'file:///',
          }}
          style={styles.webview}
          originWhitelist={['*']}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          cacheEnabled={true}
          startInLoadingState={false}
          allowFileAccess={true}
          allowFileAccessFromFileURLs={true}
          onMessage={handleWebViewMessage}
          onError={handleWebViewError}
          onRenderProcessGone={handleRenderProcessGone}
        />
      )}

      {loading && !error && (
        <View style={styles.loader}>
          <ActivityIndicator
            size="large"
            color="#071a3d"
          />

          <Text style={styles.loaderText}>
            {progressText}
          </Text>
        </View>
      )}

      {error && (
        <View style={styles.loader}>
          <Text style={styles.errorTitle}>
            PDF could not be opened
          </Text>

          <Text style={styles.errorText}>
            {error}
          </Text>
        </View>
      )}

      {!pdfJsSource && !error && (
        <View style={styles.loader}>
          <ActivityIndicator
            size="large"
            color="#071a3d"
          />

          <Text style={styles.loaderText}>
            Preparing PDF viewer...
          </Text>
        </View>
      )}
    </View>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e9edf3',
  },

  webview: {
    flex: 1,
    backgroundColor: '#e9edf3',
  },

  loader: {
    position: 'absolute',
    zIndex: 10,

    top: 0,
    bottom: 0,
    left: 0,
    right: 0,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#e9edf3',

    padding: 20,
  },

  loaderText: {
    marginTop: 12,

    color: '#071a3d',

    fontSize: 14,

    textAlign: 'center',
  },

  errorTitle: {
    color: '#071a3d',

    fontSize: 17,

    fontWeight: 'bold',

    textAlign: 'center',

    marginBottom: 10,
  },

  errorText: {
    color: '#b00020',

    fontSize: 14,

    textAlign: 'center',

    lineHeight: 21,
  },
});