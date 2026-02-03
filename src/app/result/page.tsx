"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { CVComparison } from "@/components/CVComparison";
import { ArrowLeft, Download, Loader2, FileText, Target, TrendingUp, FileDown } from "lucide-react";
import type { OptimizationResult } from "@/types";

// PDF Generator'ı dynamic import ile yükle (SSR devre dışı)
const PDFDownloadButton = dynamic(
  () => import("@/components/PDFDownloadButton"),
  { ssr: false, loading: () => <Loader2 className="w-5 h-5 animate-spin" /> }
);

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("optimizationResult");
    if (stored) {
      setResult(JSON.parse(stored));
    } else {
      router.push("/");
    }
  }, [router]);

  const handleDownloadTxt = async () => {
    if (!result) return;

    setIsDownloading(true);

    try {
      const blob = new Blob([result.optimizedCV], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `optimized-cv-${new Date().toISOString().split("T")[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleNewOptimization = () => {
    sessionStorage.removeItem("optimizationResult");
    router.push("/");
  };

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleNewOptimization}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Yeni Optimizasyon
            </button>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-400" />
              <span className="font-medium text-slate-900 dark:text-slate-50">CV Optimizer</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Title & Score */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 mb-2">
            Optimizasyon Tamamlandı
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            CV&apos;niz {result.targetRole || "hedef pozisyona"} göre optimize edildi.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="card-elevated">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-sm flex items-center justify-center">
                <Target className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">ATS Skoru</p>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 line-through">{result.atsScore.before}%</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-lg">{result.atsScore.after}%</span>
                </div>
              </div>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${result.atsScore.after}%` }} />
            </div>
          </div>

          <div className="card-elevated">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-sm flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">İyileştirme</p>
                <p className="font-semibold text-slate-900 dark:text-slate-50">{result.improvements.length} değişiklik</p>
              </div>
            </div>
          </div>

          <div className="card-elevated">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-sm flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Anahtar Kelime</p>
                <p className="font-semibold text-slate-900 dark:text-slate-50">
                  {result.keywords.matched.length + result.keywords.added.length} eşleşme
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison */}
        <CVComparison
          originalCV={result.originalCV}
          optimizedCV={result.optimizedCV}
          improvements={result.improvements}
          atsScore={result.atsScore}
          keywords={result.keywords}
          roleAdaptations={result.roleAdaptations}
          skillGaps={result.skillGaps}
        />

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <PDFDownloadButton
            content={result.optimizedCV}
            targetRole={result.targetRole}
            atsScore={result.atsScore}
          />
          <button
            onClick={handleDownloadTxt}
            disabled={isDownloading}
            className="btn-secondary flex-1 flex items-center justify-center gap-2"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                İndiriliyor...
              </>
            ) : (
              <>
                <FileDown className="w-5 h-5" />
                TXT Olarak İndir
              </>
            )}
          </button>
          <button onClick={handleNewOptimization} className="btn-secondary flex-1">
            Farklı İlan İçin Optimize Et
          </button>
        </div>
      </div>
    </main>
  );
}
