'use client';

import { ArrowLeft, Printer } from 'lucide-react';

export function PrintToolbar() {
  const goBack = () => {
    if (window.history.length > 1) window.history.back();
    else window.close();
  };

  return <div className="print-toolbar">
    <button type="button" onClick={goBack} className="print-toolbar-button">
      <ArrowLeft size={16}/> Hanabi Studyへ戻る
    </button>
    <button type="button" onClick={() => window.print()} className="print-toolbar-button print-toolbar-primary">
      <Printer size={16}/> PDFとして保存 / 印刷
    </button>
  </div>;
}
