"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileUpload } from "@/components/FileUpload";
import { JobDescriptionInput } from "@/components/JobDescriptionInput";
import {
  FileText,
  Target,
  BarChart3,
  Mail,
  ArrowRight,
  Loader2,
  Briefcase,
  TrendingUp,
  Shield,
} from "lucide-react";

type TabType = "optimize" | "compare" | "gap" | "cover-letter";

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("optimize");
  const [cvText, setCvText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canProceed = cvText.trim().length > 0 && jobDescription.trim().length > 0;

  const handleOptimize = async () => {
    if (!canProceed) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvText, jobDescription, targetRole: targetRole || undefined }),
      });

      const data = await response.json();

      if (data.success) {
        sessionStorage.setItem("optimizationResult", JSON.stringify(data));
        router.push("/result");
      } else {
        setError(data.error || "Optimizasyon sırasında bir hata oluştu");
      }
    } catch {
      setError("Sunucuya bağlanırken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCoverLetter = async () => {
    if (!canProceed) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvText, jobDescription, tone: "professional" }),
      });

      const data = await response.json();

      if (data.success) {
        sessionStorage.setItem("coverLetterResult", JSON.stringify(data));
        router.push("/cover-letter");
      } else {
        setError(data.error || "Ön yazı oluşturulurken hata oluştu");
      }
    } catch {
      setError("Sunucuya bağlanırken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkillGap = async () => {
    if (!canProceed) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/skill-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvText, jobDescription }),
      });

      const data = await response.json();

      if (data.success) {
        sessionStorage.setItem("skillGapResult", JSON.stringify(data));
        router.push("/skill-gap");
      } else {
        setError(data.error || "Beceri analizi yapılırken hata oluştu");
      }
    } catch {
      setError("Sunucuya bağlanırken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: "optimize" as TabType, label: "CV Optimize Et", icon: Target },
    { id: "gap" as TabType, label: "Beceri Analizi", icon: BarChart3 },
    { id: "cover-letter" as TabType, label: "Ön Yazı", icon: Mail },
  ];

  const handleAction = () => {
    switch (activeTab) {
      case "optimize":
        return handleOptimize();
      case "cover-letter":
        return handleCoverLetter();
      case "gap":
        return handleSkillGap();
    }
  };

  const getActionText = () => {
    switch (activeTab) {
      case "optimize":
        return "CV'yi Optimize Et";
      case "cover-letter":
        return "Ön Yazı Oluştur";
      case "gap":
        return "Beceri Analizi Yap";
      default:
        return "Devam Et";
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Value Props */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="card flex items-start gap-3">
            <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-950/50 rounded-sm flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="font-medium text-slate-900 dark:text-slate-100 text-sm">Pozisyon Uyarlama</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                CV&apos;nizi hedef pozisyona göre şekillendirin
              </p>
            </div>
          </div>
          <div className="card flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-50 dark:bg-blue-950/50 rounded-sm flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium text-slate-900 dark:text-slate-100 text-sm">ATS Uyumluluk</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Takip sistemlerinden geçecek format
              </p>
            </div>
          </div>
          <div className="card flex items-start gap-3">
            <div className="w-8 h-8 bg-amber-50 dark:bg-amber-950/50 rounded-sm flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-medium text-slate-900 dark:text-slate-100 text-sm">Dürüstlük İlkesi</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Yalan bilgi eklenmez, deneyimler güçlendirilir
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-800 mb-6">
          <nav className="flex gap-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab-button flex items-center gap-2 ${
                    activeTab === tab.id ? "tab-button-active" : "tab-button-inactive"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Form */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - CV Upload */}
          <div className="card-elevated">
            <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4">CV Yükle</h2>
            <FileUpload onFileSelect={setCvText} isLoading={isLoading} />
            {cvText && (
              <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/50 rounded-sm">
                <p className="text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  CV yüklendi ({cvText.length.toLocaleString("tr-TR")} karakter)
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Job Description */}
          <div className="card-elevated">
            <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4">İş İlanı</h2>
            <JobDescriptionInput
              value={jobDescription}
              onChange={setJobDescription}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Target Role Input (for optimize tab) */}
        {activeTab === "optimize" && (
          <div className="card-elevated mt-6 animate-fade-in">
            <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4">
              Hedef Pozisyon (Opsiyonel)
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
              Mevcut deneyiminiz farklı bir pozisyon için mi? Örneğin Developer iken Tester pozisyonuna başvuruyorsanız belirtin.
            </p>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="Örn: QA Engineer, Product Manager, Data Analyst..."
              className="input-base"
              disabled={isLoading}
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/50 rounded-sm">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-8">
          <button
            onClick={handleAction}
            disabled={!canProceed || isLoading}
            className="btn-primary w-full flex items-center justify-center gap-2 text-base py-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                İşleniyor...
              </>
            ) : (
              <>
                {getActionText()}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-8">
          CV&apos;nizdeki bilgiler sunucuda saklanmaz. Tüm işlemler güvenli şekilde gerçekleştirilir.
        </p>
      </div>
    </main>
  );
}
