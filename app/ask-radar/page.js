"use client";

import styles from "./askRadar.module.css";
import Header from "@/components/layout/Header/Header";
import Card from "@/components/ui/Card/Card";
import Badge from "@/components/ui/Badge/Badge";
import Button from "@/components/ui/Button/Button";

const QUICK_PROMPTS = [
  "Why did my leads decrease this week?",
  "Which videos should I replicate next?",
  "What is currently hurting my marketing performance?",
  "Give me this week's 3 priority marketing actions.",
  "How am I tracking against my 30 customer monthly goal?",
];

export default function AskRadarPage() {
  return (
    <div className={styles.page}>
      <Header
        title="Ask RADAR"
        subtitle="Context-Aware AI Marketing & Growth Intelligence Assistant"
      />

      <div className={styles.content}>
        {/* Quick Question Chips */}
        <div className={styles.promptsSection}>
          <span className={styles.promptsLabel}>Strategic Inquiries:</span>
          <div className={styles.chipRow}>
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button key={idx} className={styles.promptChip}>
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation Stream */}
        <div className={styles.conversation}>
          {/* User Message */}
          <div className={`${styles.messageBubble} ${styles.userBubble}`}>
            <div className={styles.messageMeta}>
              <span className={styles.sender}>Business Owner</span>
              <span className={styles.time}>10:14 AM</span>
            </div>
            <p className={styles.messageText}>
              Why did my leads decrease this week, and what should I fix immediately?
            </p>
          </div>

          {/* AI Response with Structured Evidence & Actions */}
          <div className={`${styles.messageBubble} ${styles.aiBubble}`}>
            <div className={styles.messageMeta}>
              <div className={styles.aiTag}>
                <span className={styles.aiDot} />
                <span className={styles.sender}>RADAR Intelligence</span>
              </div>
              <Badge variant="accent" size="sm">Ground Truth Data Analysis</Badge>
            </div>

            <div className={styles.aiBody}>
              <p className={styles.aiSummary}>
                Your inbound lead volume dropped <strong>22%</strong> over the past 7 days (from 18 leads to 14 leads), despite TikTok video views remaining steady (+3.4%).
              </p>

              <div className={styles.evidenceCard}>
                <span className={styles.evidenceHeader}>Data Evidence & Root Cause Analysis</span>
                <ul className={styles.evidenceList}>
                  <li>
                    <strong>Call-to-Action Shift:</strong> The last 2 videos omitted the direct &ldquo;Comment POS for WhatsApp Demo&rdquo; CTA, relying instead on generic profile links.
                  </li>
                  <li>
                    <strong>Format Change:</strong> Video length increased from 38s average to 74s, resulting in a 32% drop in 3-second completion rate.
                  </li>
                </ul>
              </div>

              <div className={styles.recommendationCard}>
                <span className={styles.recHeader}>Recommended Action Plan</span>
                <ol className={styles.recList}>
                  <li>Publish 2 short-form videos (&lt;45s) focused on grocery inventory reconciliation by Wednesday.</li>
                  <li>Restore the direct comment-keyword CTA (&ldquo;Comment POS for live demo&rdquo;).</li>
                  <li>Follow up with 4 pending leads in demo stage who have been idle for &gt;48 hours.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Input Bar */}
        <div className={styles.inputContainer}>
          <input
            type="text"
            className={styles.inputField}
            placeholder="Ask RADAR about your marketing data, leads, TikTok content, or goals..."
          />
          <Button variant="primary" size="md">
            Ask RADAR
          </Button>
        </div>
      </div>
    </div>
  );
}
