"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Clock,
  Target,
  Trash2,
  Eye,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface HistoryItem {
  id: string;
  targetRole: string;
  company?: string;
  atsScoreBefore: number;
  atsScoreAfter: number;
  createdAt: string;
  optimizedCV: string;
  originalCV: string;
  matchedKeywords?: string[];
  addedKeywords?: string[];
  missingSkills?: string[];
  improvements?: string[];
}

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setError(null);
      const response = await fetch("/api/history");
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login?callbackUrl=/history");
          return;
        }
        throw new Error(data.error || "Geçmiş yüklenemedi");
      }

      setHistory(data.history || []);
    } catch (err) {
      console.error("History load error:", err);
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      setDeletingId(id);
      const response = await fetch(`/api/history?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Silme işlemi başarısız");
      }

      setHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      alert(err instanceof Error ? err.message : "Silme işlemi başarısız");
    } finally {
      setDeletingId(null);
    }
  };

  const viewItem = (item: HistoryItem) => {
    sessionStorage.setItem(
      "optimizationResult",
      JSON.stringify({
        success: true,
        originalCV: item.originalCV,
        optimizedCV: item.optimizedCV,
        targetRole: item.targetRole,
        improvements: item.improvements || [],
        roleAdaptations: [],
        keywords: {
          matched: item.matchedKeywords || [],
          added: item.addedKeywords || [],
          missing: item.missingSkills || [],
        },
        atsScore: { before: item.atsScoreBefore, after: item.atsScoreAfter },
        skillGaps: [],
      })
    );
    router.push("/result");
  };

  const clearAll = async () => {
    if (!confirm("Tüm geçmişi silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      // Delete all items one by one
      for (const item of history) {
        await fetch(`/api/history?id=${item.id}`, { method: "DELETE" });
      }
      setHistory([]);
    } catch (err) {
      console.error("Clear all error:", err);
      alert("Bazı kayıtlar silinemedi");
      loadHistory(); // Reload to show current state
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
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
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Ana Sayfa
            </button>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-400" />
              <span className="font-medium text-slate-900 dark:text-slate-50">CV Optimizer</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Optimizasyon Geçmişi</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Önceki CV optimizasyonlarınız</p>
          </div>
          {history.length > 0 && (
            <button
              onClick={clearAll}
              className="btn-ghost text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Tümünü Sil
            </button>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="card-elevated border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700 dark:text-red-300">{error}</p>
              <button
                onClick={loadHistory}
                className="ml-auto text-sm text-red-600 dark:text-red-400 hover:underline"
              >
                Tekrar Dene
              </button>
            </div>
          </div>
        )}

        {/* History List */}
        {history.length === 0 ? (
          <div className="card-elevated text-center py-12">
            <Clock className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
              Henüz geçmiş yok
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              CV optimize ettiğinizde burada görünecek.
            </p>
            <button
              onClick={() => router.push("/")}
              className="btn-primary"
            >
              İlk Optimizasyonu Yap
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item.id}
                className="card-elevated hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-slate-900 dark:text-slate-50">
                        {item.targetRole || "CV Optimizasyonu"}
                      </h3>
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {item.atsScoreBefore}% →
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium ml-1">
                            {item.atsScoreAfter}%
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Clock className="w-4 h-4" />
                      {formatDate(item.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => viewItem(item)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-sm transition-colors"
                      title="Görüntüle"
                    >
                      <Eye className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-sm transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
