"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  BarChart3,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
} from "lucide-react";
import type { SkillGapAnalysis, DetailedSkillGap } from "@/types";

export default function SkillGapPage() {
  const router = useRouter();
  const [result, setResult] = useState<SkillGapAnalysis | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("skillGapResult");
    if (stored) {
      setResult(JSON.parse(stored));
    } else {
      router.push("/");
    }
  }, [router]);

  const handleBack = () => {
    sessionStorage.removeItem("skillGapResult");
    router.push("/");
  };

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case "critical":
        return <span className="badge badge-error">Kritik</span>;
      case "important":
        return <span className="badge badge-warning">Önemli</span>;
      default:
        return <span className="badge badge-info">İyi Olur</span>;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "technical":
        return "Teknik";
      case "soft":
        return "Soft Skill";
      case "certification":
        return "Sertifika";
      case "domain":
        return "Alan Bilgisi";
      default:
        return category;
    }
  };

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Geri Dön
            </button>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-400" />
              <span className="font-medium text-slate-900">CV Optimizer</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-slate-900 rounded-sm flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Beceri Gap Analizi
            </h1>
          </div>
          <p className="text-slate-500 ml-13">
            CV&apos;niz ile hedef pozisyon arasındaki beceri farkları analiz edildi.
          </p>
        </div>

        {/* Readiness Score */}
        <div className="card-elevated mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-slate-600" />
              <h2 className="font-medium text-slate-900">Hazırlık Skoru</h2>
            </div>
            <span className="text-2xl font-semibold text-slate-900">
              {result.overallReadiness}%
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${result.overallReadiness}%` }}
            />
          </div>
          <p className="text-sm text-slate-500 mt-3">
            Bu pozisyon için genel hazırlık durumunuz
          </p>
        </div>

        {/* Strong Points */}
        <div className="card-elevated mb-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <h2 className="font-medium text-slate-900">Güçlü Yönleriniz</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {result.strongPoints.map((point, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-sm"
              >
                <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-emerald-800">{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Skill Gaps */}
        <div className="card-elevated mb-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <h2 className="font-medium text-slate-900">
              Geliştirilmesi Gereken Beceriler ({result.gaps.length})
            </h2>
          </div>
          <div className="space-y-4">
            {result.gaps.map((gap: DetailedSkillGap, index: number) => (
              <div
                key={index}
                className="border border-slate-200 rounded-sm p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-slate-900">{gap.skill}</h3>
                    <p className="text-sm text-slate-500">
                      {getCategoryLabel(gap.category)}
                    </p>
                  </div>
                  {getImportanceBadge(gap.importance)}
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="text-sm">
                    <span className="text-slate-500">Mevcut Seviye: </span>
                    <span className="text-slate-700 capitalize">
                      {gap.currentLevel}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-slate-500">Gereken Seviye: </span>
                    <span className="text-slate-700 capitalize">
                      {gap.requiredLevel}
                    </span>
                  </div>
                </div>

                {/* Learning Path */}
                <div className="bg-slate-50 p-4 rounded-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-slate-600" />
                    <h4 className="text-sm font-medium text-slate-700">
                      Öğrenme Yolu
                    </h4>
                    <div className="flex items-center gap-1 ml-auto text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      {gap.learningPath.estimatedTime}
                    </div>
                  </div>

                  {gap.learningPath.courses.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs text-slate-500 mb-1">Önerilen Kurslar:</p>
                      <ul className="text-sm text-slate-700 list-disc list-inside">
                        {gap.learningPath.courses.slice(0, 3).map((course, i) => (
                          <li key={i}>{course}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {gap.learningPath.certifications.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs text-slate-500 mb-1">Sertifikalar:</p>
                      <div className="flex flex-wrap gap-2">
                        {gap.learningPath.certifications.map((cert, i) => (
                          <span key={i} className="badge badge-info">
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="text-xs text-slate-500 mb-1">Alternatif Strateji:</p>
                    <p className="text-sm text-slate-600">{gap.workaround}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="card-elevated">
          <h2 className="font-medium text-slate-900 mb-4">Genel Öneriler</h2>
          <ul className="space-y-2">
            {result.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                <span className="text-slate-400">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="mt-8">
          <button onClick={handleBack} className="btn-secondary w-full">
            Yeni Analiz Yap
          </button>
        </div>
      </div>
    </main>
  );
}
