"use client";

import { useState } from "react";
import styles from "./askRadar.module.css";
import Header from "@/components/layout/Header/Header";
import Button from "@/components/ui/Button/Button";

const QUICK_PROMPTS = [
  "ما هي الفيديوهات الأعلى تفاعلاً حتى الآن؟",
  "كيف يمكنني تحسين معدل استكمال المشاهدات؟",
  "ما هي التوصيات المباشرة لزيادة المبيعات؟",
  "ما هي حالة الأهداف المنفذة هذا الأسبوع؟",
];

export default function AskRadarPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSend = (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: "المستخدم",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
  };

  return (
    <div className={styles.page}>
      <Header
        title="مساعد رادار الذكي (Ask RADAR)"
        subtitle="مساعد الذكاء الاصطناعي لتحليل التسويق وإشارات النمو بالاعتماد على بياناتك الواقعية"
      />

      <div className={styles.content}>
        {/* Quick Question Chips */}
        <div className={styles.promptsSection}>
          <span className={styles.promptsLabel}>استفسارات مقترحة:</span>
          <div className={styles.chipRow}>
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                className={styles.promptChip}
                onClick={() => handleSend(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation Stream */}
        <div className={styles.conversation}>
          {messages.length === 0 ? (
            <div className={styles.emptyChat}>
              <span className={styles.emptyChatIcon}>🤖</span>
              <h4 className={styles.emptyChatTitle}>مرحباً بك في رادار</h4>
              <p className={styles.emptyChatSub}>
                اسأل عن أداء الفيديوهات، التفاعل، أو استراتيجيات النمو. يعتمد رادار على بياناتك الحقيقية لتقديم تحليلات دقيقة.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`${styles.messageBubble} ${styles.userBubble}`}
              >
                <div className={styles.messageMeta}>
                  <span className={styles.sender}>{msg.sender}</span>
                  <span className={styles.time}>{msg.time}</span>
                </div>
                <p className={styles.messageText}>{msg.text}</p>
              </div>
            ))
          )}
        </div>

        {/* Input Bar */}
        <form
          className={styles.inputContainer}
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <input
            type="text"
            className={styles.inputField}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اكتب استفسارك لرادار حول أداء التسويق والمحتوى..."
          />
          <Button variant="primary" size="md" type="submit">
            إرسال
          </Button>
        </form>
      </div>
    </div>
  );
}
