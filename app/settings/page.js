"use client";

import { useState, useEffect } from "react";
import styles from "./settings.module.css";
import Header from "@/components/layout/Header/Header";
import Card from "@/components/ui/Card/Card";
import Badge from "@/components/ui/Badge/Badge";
import Button from "@/components/ui/Button/Button";
import SystemHealth from "@/components/radar/SystemHealth/SystemHealth";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("business"); // "business" | "audience" | "offer" | "marketing"
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const [form, setForm] = useState({
    business: {
      businessName: "",
      businessDescription: "",
      productService: "",
      industry: "",
    },
    audience: {
      targetAudience: "",
      customerProblems: "",
    },
    offer: {
      mainOffer: "",
      pricing: "",
      competitiveAdvantages: "",
      primaryCta: "",
    },
    marketing: {
      mainMarketingGoal: "",
      secondaryGoals: "",
      brandTone: "",
      contentPillars: "",
      currentCampaigns: "",
      currentOffers: "",
      importantNotes: "",
    },
  });

  useEffect(() => {
    async function loadContext() {
      try {
        setLoading(true);
        const res = await fetch("/api/business-context");
        if (res.ok) {
          const data = await res.json();
          if (data.context) {
            setForm({
              business: {
                businessName: data.context.business?.businessName || "",
                businessDescription: data.context.business?.businessDescription || "",
                productService: data.context.productService || data.context.business?.productService || "",
                industry: data.context.business?.industry || "",
              },
              audience: {
                targetAudience: data.context.audience?.targetAudience || "",
                customerProblems: data.context.audience?.customerProblems || "",
              },
              offer: {
                mainOffer: data.context.offer?.mainOffer || "",
                pricing: data.context.offer?.pricing || "",
                competitiveAdvantages: data.context.offer?.competitiveAdvantages || "",
                primaryCta: data.context.offer?.primaryCta || "",
              },
              marketing: {
                mainMarketingGoal: data.context.marketing?.mainMarketingGoal || "",
                secondaryGoals: data.context.marketing?.secondaryGoals || "",
                brandTone: data.context.marketing?.brandTone || "",
                contentPillars: data.context.marketing?.contentPillars || "",
                currentCampaigns: data.context.marketing?.currentCampaigns || "",
                currentOffers: data.context.marketing?.currentOffers || "",
                importantNotes: data.context.marketing?.importantNotes || "",
              },
            });
          }
        }
      } catch (err) {
        setErrorMessage("فشل في تحميل سياق النشاط التجاري.");
      } finally {
        setLoading(false);
      }
    }

    loadContext();
  }, []);

  const handleFieldChange = (section, field, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
    setStatusMessage(null);
    setErrorMessage(null);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/business-context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMessage("تم حفظ وتحديث سياق النشاط التجاري بنجاح ✓");
      } else {
        setErrorMessage(data.error || "حدث خطأ أثناء حفظ سياق العمل.");
      }
    } catch (err) {
      setErrorMessage("تعذر الاتصال بالخادم لحفظ التعديلات.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <Header
        title="إعدادات سياق النشاط التجاري والنظام"
        subtitle="تهيئة سياق العمل، الجمهور، العروض، والأهداف التسويقية لتغذية محرك الذكاء"
      />

      <div className={styles.content}>
        {/* System Health Section */}
        <SystemHealth />

        <div className={styles.twoColumnGrid}>
          {/* Main Column: Structured Business Context Form */}
          <div className={styles.contextContainer}>
            <Card
              title="سياق النشاط التجاري (Business Context Memory)"
              subtitle="البيانات المرجعية الدقيقة التي يستند إليها رادار لتفسير الأداء التسويقي"
            >
              {/* Tabs Navigation */}
              <div className={styles.tabsNav}>
                <button
                  type="button"
                  className={`${styles.tabBtn} ${activeTab === "business" ? styles.activeTab : ""}`}
                  onClick={() => setActiveTab("business")}
                >
                  🏢 النشاط والهوية
                </button>
                <button
                  type="button"
                  className={`${styles.tabBtn} ${activeTab === "audience" ? styles.activeTab : ""}`}
                  onClick={() => setActiveTab("audience")}
                >
                  👥 الجمهور والمشكلات
                </button>
                <button
                  type="button"
                  className={`${styles.tabBtn} ${activeTab === "offer" ? styles.activeTab : ""}`}
                  onClick={() => setActiveTab("offer")}
                >
                  💎 العرض والقيمة
                </button>
                <button
                  type="button"
                  className={`${styles.tabBtn} ${activeTab === "marketing" ? styles.activeTab : ""}`}
                  onClick={() => setActiveTab("marketing")}
                >
                  🎯 الأهداف والمحتوى
                </button>
              </div>

              {loading ? (
                <div style={{ padding: "32px", textAlign: "center", color: "var(--radar-text-muted)" }}>
                  جاري تحميل سياق النشاط التجاري...
                </div>
              ) : (
                <form onSubmit={handleSave} style={{ marginTop: "16px" }}>
                  {/* Tab 1: Business Profile */}
                  {activeTab === "business" && (
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>
                          اسم النشاط التجاري / العلامة
                          <span className={styles.hint}>(Business Name)</span>
                        </label>
                        <input
                          type="text"
                          className={styles.input}
                          value={form.business.businessName}
                          onChange={(e) => handleFieldChange("business", "businessName", e.target.value)}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label}>
                          القطاع والمجال
                          <span className={styles.hint}>(Industry)</span>
                        </label>
                        <input
                          type="text"
                          className={styles.input}
                          value={form.business.industry}
                          onChange={(e) => handleFieldChange("business", "industry", e.target.value)}
                        />
                      </div>

                      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label className={styles.label}>
                          المنتج / الخدمة الأساسية
                          <span className={styles.hint}>(Product or Service)</span>
                        </label>
                        <input
                          type="text"
                          className={styles.input}
                          value={form.business.productService}
                          onChange={(e) => handleFieldChange("business", "productService", e.target.value)}
                        />
                      </div>

                      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label className={styles.label}>
                          وصف النشاط التجاري وطبيعة العمل
                          <span className={styles.hint}>(Business Description)</span>
                        </label>
                        <textarea
                          className={styles.textarea}
                          value={form.business.businessDescription}
                          onChange={(e) => handleFieldChange("business", "businessDescription", e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Audience */}
                  {activeTab === "audience" && (
                    <div className={styles.formGrid}>
                      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label className={styles.label}>
                          الجمهور والعملاء المستهدفون
                          <span className={styles.hint}>(Target Audience Persona)</span>
                        </label>
                        <textarea
                          className={styles.textarea}
                          value={form.audience.targetAudience}
                          onChange={(e) => handleFieldChange("audience", "targetAudience", e.target.value)}
                        />
                      </div>

                      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label className={styles.label}>
                          أبرز مشكلات واحتياجات العملاء
                          <span className={styles.hint}>(Customer Pain Points)</span>
                        </label>
                        <textarea
                          className={styles.textarea}
                          value={form.audience.customerProblems}
                          onChange={(e) => handleFieldChange("audience", "customerProblems", e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Tab 3: Offer & Value */}
                  {activeTab === "offer" && (
                    <div className={styles.formGrid}>
                      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label className={styles.label}>
                          العرض التسويقي الرئيسي
                          <span className={styles.hint}>(Main Offer)</span>
                        </label>
                        <input
                          type="text"
                          className={styles.input}
                          value={form.offer.mainOffer}
                          onChange={(e) => handleFieldChange("offer", "mainOffer", e.target.value)}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label}>
                          معلومات الأسعار والخطط
                          <span className={styles.hint}>(Pricing Structure)</span>
                        </label>
                        <input
                          type="text"
                          className={styles.input}
                          value={form.offer.pricing}
                          onChange={(e) => handleFieldChange("offer", "pricing", e.target.value)}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label}>
                          الدعوة الرئيسية لاتخاذ إجراء
                          <span className={styles.hint}>(Primary CTA)</span>
                        </label>
                        <input
                          type="text"
                          className={styles.input}
                          value={form.offer.primaryCta}
                          onChange={(e) => handleFieldChange("offer", "primaryCta", e.target.value)}
                        />
                      </div>

                      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label className={styles.label}>
                          الميزات التنافسية ونقاط القوة
                          <span className={styles.hint}>(Competitive Advantages)</span>
                        </label>
                        <textarea
                          className={styles.textarea}
                          value={form.offer.competitiveAdvantages}
                          onChange={(e) => handleFieldChange("offer", "competitiveAdvantages", e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Tab 4: Marketing & Goals */}
                  {activeTab === "marketing" && (
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>
                          الهدف التسويقي الرئيسي
                          <span className={styles.hint}>(Main Marketing Target)</span>
                        </label>
                        <input
                          type="text"
                          className={styles.input}
                          value={form.marketing.mainMarketingGoal}
                          onChange={(e) => handleFieldChange("marketing", "mainMarketingGoal", e.target.value)}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label}>
                          نبرة وهوية البراند
                          <span className={styles.hint}>(Brand Tone & Voice)</span>
                        </label>
                        <input
                          type="text"
                          className={styles.input}
                          value={form.marketing.brandTone}
                          onChange={(e) => handleFieldChange("marketing", "brandTone", e.target.value)}
                        />
                      </div>

                      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label className={styles.label}>
                          أهداف تسويقية فرعية
                          <span className={styles.hint}>(Secondary Goals)</span>
                        </label>
                        <textarea
                          className={styles.textarea}
                          style={{ minHeight: "60px" }}
                          value={form.marketing.secondaryGoals}
                          onChange={(e) => handleFieldChange("marketing", "secondaryGoals", e.target.value)}
                        />
                      </div>

                      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label className={styles.label}>
                          محاور وركائز المحتوى
                          <span className={styles.hint}>(Content Pillars)</span>
                        </label>
                        <textarea
                          className={styles.textarea}
                          style={{ minHeight: "60px" }}
                          value={form.marketing.contentPillars}
                          onChange={(e) => handleFieldChange("marketing", "contentPillars", e.target.value)}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label}>
                          الحملات والعروض الترويجية الحالية
                          <span className={styles.hint}>(Current Campaigns)</span>
                        </label>
                        <input
                          type="text"
                          className={styles.input}
                          value={form.marketing.currentCampaigns}
                          onChange={(e) => handleFieldChange("marketing", "currentCampaigns", e.target.value)}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label}>
                          العروض والخصومات النشطة
                          <span className={styles.hint}>(Current Offers)</span>
                        </label>
                        <input
                          type="text"
                          className={styles.input}
                          value={form.marketing.currentOffers}
                          onChange={(e) => handleFieldChange("marketing", "currentOffers", e.target.value)}
                        />
                      </div>

                      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label className={styles.label}>
                          ملاحظات استراتيجية هامة
                          <span className={styles.hint}>(Important Context Notes)</span>
                        </label>
                        <textarea
                          className={styles.textarea}
                          value={form.marketing.importantNotes}
                          onChange={(e) => handleFieldChange("marketing", "importantNotes", e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions & Alerts */}
                  <div className={styles.actionsBar}>
                    <Button variant="primary" size="md" type="submit" disabled={saving}>
                      {saving ? "جاري الحفظ..." : "حفظ سياق العمل"}
                    </Button>

                    {statusMessage && (
                      <div className={styles.saveNotice}>
                        <span>{statusMessage}</span>
                      </div>
                    )}

                    {errorMessage && (
                      <div className={styles.errorNotice}>
                        <span>⚠️ {errorMessage}</span>
                      </div>
                    )}
                  </div>
                </form>
              )}
            </Card>
          </div>

          {/* Sidebar Column: Connected Integrations */}
          <div className={styles.sidebarCard}>
            <Card
              title="التكاملات والاتصالات النشطة"
              subtitle="حالة الخدمات والمصادقة المدارة عبر الخادم"
            >
              <div className={styles.integrationList}>
                <div className={styles.integrationItem}>
                  <div className={styles.integrationInfo}>
                    <span className={styles.integrationName}>تكامل تيك توك (TikTok Sandbox)</span>
                    <span className={styles.integrationDesc}>OAuth 2.0 • إدارة وتجديد التوكنات</span>
                  </div>
                  <Badge variant="success" size="sm">مهيأ</Badge>
                </div>

                <div className={styles.integrationItem}>
                  <div className={styles.integrationInfo}>
                    <span className={styles.integrationName}>قاعدة بيانات فايربيس (Firestore)</span>
                    <span className={styles.integrationDesc}>Server Admin SDK + Client Realtime</span>
                  </div>
                  <Badge variant="accent" size="sm">متصل</Badge>
                </div>

                <div className={styles.integrationItem}>
                  <div className={styles.integrationInfo}>
                    <span className={styles.integrationName}>مزود الذكاء (OpenRouter AI)</span>
                    <span className={styles.integrationDesc}>طبقة التجريد والاتصال بالنماذج</span>
                  </div>
                  <Badge variant="purple" size="sm">جاهز</Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
