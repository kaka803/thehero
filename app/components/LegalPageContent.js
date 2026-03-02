"use client";

import { useLanguage } from "@/context/LanguageContext";
import LegalLayout from "./LegalLayout";

export default function LegalPageContent({ type }) {
  const { t } = useLanguage();
  const data = t(`legal_pages.${type}`);
  const lastUpdated = t("legal_pages.last_updated");
  
  if (!data) return null;
  
  return <LegalLayout title={data.title} lastUpdated={lastUpdated} sections={data.sections} />;
}
