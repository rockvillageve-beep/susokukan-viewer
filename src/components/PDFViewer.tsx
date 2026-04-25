'use client';

import { useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function PDFViewer() {
  const [pdf, setPdf] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const loadPdf = async () => {
      try {
        const pdf = await pdfjsLib.getDocument('/数息観のススメ｜漫画版.pdf').promise;
        setPdf(pdf);
        setTotalPages(pdf.numPages);
        setLoading(false);
      } catch (err) {
        setError('PDFの読み込みに失敗しました');
        setLoading(false);
      }
    };

    loadPdf();
  }, []);

  useEffect(() => {
    if (pdf && canvas) {
      const renderPage = async () => {
        try {
          const page = await pdf.getPage(currentPage);
          const context = canvas.getContext('2d');

          if (!context) return;

          const viewport = page.getViewport({ scale });
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({
            canvasContext: context,
            viewport,
          }).promise;
        } catch (err) {
          setError('ページの描画に失敗しました');
        }
      };

      renderPage();
    }
  }, [pdf, currentPage, scale, canvas]);

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo(0, 0);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0 && value <= totalPages) {
      setCurrentPage(value);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">数息観のすすめ</h1>
          <p className="text-gray-600 mt-1">漫画版</p>
        </div>
      </div>

      {/* Controls */}
      {!loading && (
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400 hover:bg-blue-700 transition"
              >
                ← 前ページ
              </button>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400 hover:bg-blue-700 transition"
              >
                次ページ →
              </button>
            </div>

            <div className="flex gap-2 items-center">
              <label className="text-sm font-medium text-gray-700">
                ページ:
              </label>
              <input
                type="number"
                min="1"
                max={totalPages}
                value={currentPage}
                onChange={handlePageInputChange}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
              />
              <span className="text-sm text-gray-600">/ {totalPages}</span>
            </div>

            <div className="flex gap-2 items-center">
              <button
                onClick={() => setScale(Math.max(0.5, scale - 0.25))}
                disabled={scale <= 0.5}
                className="px-3 py-1 bg-gray-300 text-gray-800 rounded disabled:opacity-50 hover:bg-gray-400 transition"
              >
                −
              </button>
              <span className="text-sm font-medium w-12 text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={() => setScale(Math.min(3, scale + 0.25))}
                disabled={scale >= 3}
                className="px-3 py-1 bg-gray-300 text-gray-800 rounded disabled:opacity-50 hover:bg-gray-400 transition"
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Canvas */}
      <div className="flex-1 flex items-center justify-center p-4">
        {loading ? (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">PDFを読み込み中...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg">
            <canvas
              ref={setCanvas}
              className="max-w-4xl mx-auto"
            />
          </div>
        )}
      </div>

      {/* Footer */}
      {!loading && (
        <div className="bg-white border-t">
          <div className="max-w-6xl mx-auto px-4 py-4 text-center text-sm text-gray-600">
            ページ {currentPage} / {totalPages}
          </div>
        </div>
      )}
    </div>
  );
}
