"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Font,
  Link,
} from "@react-pdf/renderer";

// Register Open Sans font with Turkish character support
Font.register({
  family: "Open Sans",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf",
      fontWeight: 400,
    },
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf",
      fontWeight: 600,
    },
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf",
      fontWeight: 700,
    },
  ],
});

// Hyphenation callback to prevent word breaking issues
Font.registerHyphenationCallback((word) => [word]);

// Professional CV Color Palette
const colors = {
  primary: "#1a1a1a",      // Almost black - headings
  secondary: "#4a4a4a",    // Dark gray - body text
  accent: "#2563eb",       // Blue - links, highlights
  muted: "#6b7280",        // Gray - dates, secondary info
  border: "#e5e7eb",       // Light gray - dividers
  background: "#ffffff",   // White
  sectionBg: "#f8fafc",    // Very light gray - section backgrounds
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Open Sans",
    fontSize: 10,
    color: colors.secondary,
    backgroundColor: colors.background,
  },

  // Header Section - Name & Contact
  header: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  name: {
    fontSize: 24,
    fontWeight: 700,
    color: colors.primary,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
    marginTop: 8,
  },
  contactItem: {
    fontSize: 9,
    color: colors.muted,
  },
  contactLink: {
    fontSize: 9,
    color: colors.accent,
    textDecoration: "none",
  },

  // Main Content Layout
  mainContent: {
    flexDirection: "row",
    gap: 25,
  },
  leftColumn: {
    flex: 2,
  },
  rightColumn: {
    flex: 1,
    paddingLeft: 15,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },

  // Section Styles
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  // Experience & Education Items
  entryContainer: {
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 3,
  },
  entryTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: colors.primary,
    flex: 1,
  },
  entryDate: {
    fontSize: 9,
    color: colors.muted,
    textAlign: "right",
  },
  entrySubtitle: {
    fontSize: 10,
    color: colors.accent,
    marginBottom: 4,
  },
  entryDescription: {
    fontSize: 9,
    color: colors.secondary,
    lineHeight: 1.5,
    textAlign: "justify",
  },

  // Bullet Points
  bulletList: {
    marginTop: 4,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 3,
    paddingLeft: 2,
  },
  bulletDot: {
    width: 12,
    fontSize: 9,
    color: colors.accent,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    color: colors.secondary,
    lineHeight: 1.4,
  },

  // Skills Section
  skillCategory: {
    marginBottom: 8,
  },
  skillCategoryTitle: {
    fontSize: 9,
    fontWeight: 600,
    color: colors.primary,
    marginBottom: 3,
  },
  skillTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  skillTag: {
    fontSize: 8,
    color: colors.secondary,
    backgroundColor: colors.sectionBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },

  // Summary/Profile Section
  summary: {
    fontSize: 10,
    color: colors.secondary,
    lineHeight: 1.6,
    textAlign: "justify",
    marginBottom: 4,
  },

  // Simple text content
  textContent: {
    fontSize: 9,
    color: colors.secondary,
    lineHeight: 1.5,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: colors.muted,
  },
});

interface PDFDownloadButtonProps {
  content: string;
  targetRole?: string;
  atsScore?: { before: number; after: number };
  userName?: string;
}

interface CVSection {
  type: "summary" | "experience" | "education" | "skills" | "certifications" | "projects" | "languages" | "other";
  title: string;
  content: string[];
  entries?: {
    title: string;
    subtitle?: string;
    date?: string;
    description?: string;
    bullets?: string[];
  }[];
}

function parseCV(content: string): CVSection[] {
  const lines = content.split("\n").filter((line) => line.trim());
  const sections: CVSection[] = [];

  const sectionPatterns: { pattern: RegExp; type: CVSection["type"] }[] = [
    { pattern: /^(ÖZET|SUMMARY|PROFİL|PROFILE|HAKKIMDA|ABOUT)/i, type: "summary" },
    { pattern: /^(DENEYİM|EXPERIENCE|İŞ DENEYİMİ|WORK EXPERIENCE|ÇALIŞMA GEÇMİŞİ)/i, type: "experience" },
    { pattern: /^(EĞİTİM|EDUCATION|AKADEMİK|ACADEMIC)/i, type: "education" },
    { pattern: /^(BECERİLER|SKILLS|TEKNİK BECERİLER|TECHNICAL SKILLS|YETKİNLİKLER)/i, type: "skills" },
    { pattern: /^(SERTİFİKALAR|CERTIFICATIONS|SERTİFİKA)/i, type: "certifications" },
    { pattern: /^(PROJELER|PROJECTS|PROJE)/i, type: "projects" },
    { pattern: /^(DİLLER|LANGUAGES|YABANCI DİL)/i, type: "languages" },
  ];

  let currentSection: CVSection | null = null;
  let currentEntry: CVSection["entries"] extends (infer T)[] ? T : never | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const upperLine = line.toUpperCase();

    // Check if this is a section header
    let matchedType: CVSection["type"] | null = null;
    for (const { pattern, type } of sectionPatterns) {
      if (pattern.test(upperLine.replace(":", ""))) {
        matchedType = type;
        break;
      }
    }

    if (matchedType) {
      // Save previous section
      if (currentSection) {
        if (currentEntry && currentSection.entries) {
          currentSection.entries.push(currentEntry);
        }
        sections.push(currentSection);
      }

      currentSection = {
        type: matchedType,
        title: line.replace(":", "").trim(),
        content: [],
        entries: matchedType !== "summary" && matchedType !== "skills" && matchedType !== "languages" ? [] : undefined,
      };
      currentEntry = null;
    } else if (currentSection) {
      // Check if this looks like an entry title (for experience/education)
      const isEntryTitle = currentSection.entries !== undefined &&
        !line.startsWith("-") &&
        !line.startsWith("•") &&
        line.length > 0 &&
        (line.includes("|") || /\d{4}/.test(line) || /^\s*[A-ZÇĞİÖŞÜ]/.test(line));

      if (isEntryTitle && currentSection.type !== "summary" && currentSection.type !== "skills") {
        // Save previous entry
        if (currentEntry && currentSection.entries) {
          currentSection.entries.push(currentEntry);
        }

        // Parse entry with potential date
        const dateMatch = line.match(/(\d{4}\s*[-–]\s*(?:\d{4}|Günümüz|Devam|Present|Halen)|\d{4})/i);
        const parts = line.split(/\s*[|]\s*/);

        currentEntry = {
          title: parts[0]?.replace(dateMatch?.[0] || "", "").trim() || line,
          subtitle: parts[1]?.replace(dateMatch?.[0] || "", "").trim(),
          date: dateMatch?.[0],
          bullets: [],
        };
      } else if (line.startsWith("-") || line.startsWith("•")) {
        const bulletText = line.replace(/^[-•]\s*/, "").trim();
        if (currentEntry && currentEntry.bullets) {
          currentEntry.bullets.push(bulletText);
        } else {
          currentSection.content.push(bulletText);
        }
      } else {
        if (currentEntry) {
          if (!currentEntry.description) {
            currentEntry.description = line;
          } else {
            currentEntry.description += " " + line;
          }
        } else {
          currentSection.content.push(line);
        }
      }
    } else {
      // Content before first section - treat as header/contact info
      if (!sections.length && line) {
        if (!currentSection) {
          currentSection = { type: "other", title: "", content: [] };
        }
        currentSection.content.push(line);
      }
    }
  }

  // Push last section
  if (currentSection) {
    if (currentEntry && currentSection.entries) {
      currentSection.entries.push(currentEntry);
    }
    sections.push(currentSection);
  }

  return sections;
}

function CVDocument({ content, targetRole, userName }: PDFDownloadButtonProps) {
  const sections = parseCV(content);

  // Extract name from first line if not provided
  const displayName = userName || sections[0]?.content?.[0] || targetRole || "CV";

  // Separate sections for two-column layout
  const mainSections = sections.filter(s =>
    s.type === "summary" || s.type === "experience" || s.type === "education" || s.type === "projects"
  );
  const sideSections = sections.filter(s =>
    s.type === "skills" || s.type === "certifications" || s.type === "languages"
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{displayName}</Text>
          {targetRole && (
            <Text style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
              {targetRole}
            </Text>
          )}
        </View>

        {/* Two Column Layout */}
        <View style={styles.mainContent}>
          {/* Left Column - Main Content */}
          <View style={styles.leftColumn}>
            {mainSections.map((section, idx) => (
              <View key={idx} style={styles.section}>
                {section.title && (
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                )}

                {/* Summary Section */}
                {section.type === "summary" && section.content.length > 0 && (
                  <Text style={styles.summary}>
                    {section.content.join(" ")}
                  </Text>
                )}

                {/* Experience/Education/Projects with Entries */}
                {section.entries?.map((entry, entryIdx) => (
                  <View key={entryIdx} style={styles.entryContainer}>
                    <View style={styles.entryHeader}>
                      <Text style={styles.entryTitle}>{entry.title}</Text>
                      {entry.date && (
                        <Text style={styles.entryDate}>{entry.date}</Text>
                      )}
                    </View>
                    {entry.subtitle && (
                      <Text style={styles.entrySubtitle}>{entry.subtitle}</Text>
                    )}
                    {entry.description && (
                      <Text style={styles.entryDescription}>{entry.description}</Text>
                    )}
                    {entry.bullets && entry.bullets.length > 0 && (
                      <View style={styles.bulletList}>
                        {entry.bullets.map((bullet, bulletIdx) => (
                          <View key={bulletIdx} style={styles.bulletItem}>
                            <Text style={styles.bulletDot}>•</Text>
                            <Text style={styles.bulletText}>{bullet}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ))}

                {/* Content without entries */}
                {!section.entries && section.type !== "summary" && section.content.length > 0 && (
                  <View style={styles.bulletList}>
                    {section.content.map((item, itemIdx) => (
                      <View key={itemIdx} style={styles.bulletItem}>
                        <Text style={styles.bulletDot}>•</Text>
                        <Text style={styles.bulletText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Right Column - Skills, Certifications, Languages */}
          {sideSections.length > 0 && (
            <View style={styles.rightColumn}>
              {sideSections.map((section, idx) => (
                <View key={idx} style={styles.section}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>

                  {section.type === "skills" && (
                    <View style={styles.skillTags}>
                      {section.content.map((skill, skillIdx) => (
                        <Text key={skillIdx} style={styles.skillTag}>
                          {skill.replace(/^[-•]\s*/, "")}
                        </Text>
                      ))}
                    </View>
                  )}

                  {section.type !== "skills" && section.content.length > 0 && (
                    <View>
                      {section.content.map((item, itemIdx) => (
                        <Text key={itemIdx} style={styles.textContent}>
                          {item.startsWith("-") || item.startsWith("•")
                            ? item.replace(/^[-•]\s*/, "• ")
                            : item
                          }
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
          </Text>
          <Text style={styles.footerText}>
            CV Optimizer ile oluşturuldu
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export default function PDFDownloadButton({ content, targetRole, atsScore, userName }: PDFDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);

    try {
      const blob = await pdf(
        <CVDocument
          content={content}
          targetRole={targetRole}
          atsScore={atsScore}
          userName={userName}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Create filename from name or role
      const fileName = targetRole
        ? `cv-${targetRole.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`
        : `cv-optimized-${new Date().toISOString().split("T")[0]}.pdf`;

      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      className="btn-primary flex-1 flex items-center justify-center gap-2"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          PDF Oluşturuluyor...
        </>
      ) : (
        <>
          <Download className="w-5 h-5" />
          PDF Olarak İndir
        </>
      )}
    </button>
  );
}
