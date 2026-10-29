import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaBookmark, FaChartPie, FaEnvelope, FaInfoCircle, FaNewspaper, FaQuestionCircle, FaShieldAlt, FaUserShield } from "react-icons/fa";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import API from "../services/api";
import aboutNewspaper from "../assets/about/morning-newspaper-wood-background-poster_1284-20556.avif";
import aboutFakeNews from "../assets/about/117295a9-9da5-4148-89f8-b297e9cd6be7.jpg";
import aboutNewsroom from "../assets/about/20561.jpg";
import "./UserPages.css";

const PageShell = ({ title, subtitle, icon: Icon, children }) => (
  <div className="user-info-page">
    <Navbar />
    <main className="user-info-main">
      <header className="user-info-header">
        <div className="user-info-heading-icon"><Icon /></div>
        <div><h1>{title}</h1><p>{subtitle}</p></div>
      </header>
      {children}
    </main>
    <Footer />
  </div>
);

export function UserStatistics() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { API.get("history/").then(({ data }) => setHistory(Array.isArray(data) ? data : [])).catch(() => toast.error("Unable to load statistics.")).finally(() => setLoading(false)); }, []);
  const supported = history.filter((item) => ["real", "real news", "supported"].includes(String(item.prediction).toLowerCase())).length;
  const contradicted = history.filter((item) => ["fake", "fake news", "contradicted"].includes(String(item.prediction).toLowerCase())).length;
  const average = history.length ? Math.round(history.reduce((sum, item) => sum + (Number(item.score) || 0), 0) / history.length * 100) : 0;
  return <PageShell title="My Statistics" subtitle="A personal summary of your news verification activity." icon={FaChartPie}><div className="user-stat-grid">{[
    ["Total Predictions", history.length, "#2563eb"], ["Supported News", supported, "#16a34a"], ["Contradicted News", contradicted, "#dc2626"], ["Average Confidence", `${loading ? "..." : average}%`, "#7c3aed"]
  ].map(([label, value, color]) => <article className="user-stat-card" key={label} style={{ "--stat-color": color }}><span /><strong>{loading ? "..." : value}</strong><p>{label}</p></article>)}</div><section className="user-info-card"><h2>Activity insight</h2><p>{history.length ? `You have completed ${history.length} prediction analyses. ${supported ? `${supported} result(s) were supported and ${contradicted} contradicted.` : "Start analysing articles to build your personal trend."}` : "Your prediction activity will appear here after you analyse news."}</p></section></PageShell>;
}

export function SavedPredictions() {
  const [saved, setSaved] = useState([]);
  useEffect(() => {
    const ids = JSON.parse(localStorage.getItem("savedPredictions") || "[]");
    API.get("history/").then(({ data }) => setSaved(Array.isArray(data) ? data.filter((item) => ids.includes(String(item.id))) : [])).catch(() => setSaved([]));
  }, []);
  const removeSaved = (id) => { const ids = JSON.parse(localStorage.getItem("savedPredictions") || "[]"); localStorage.setItem("savedPredictions", JSON.stringify(ids.filter((item) => item !== String(id)))); setSaved((items) => items.filter((item) => String(item.id) !== String(id))); toast.success("Removed from saved predictions."); };
  return <PageShell title="Saved Predictions" subtitle="Predictions you have bookmarked for quick access." icon={FaBookmark}>{saved.length ? <div className="saved-prediction-grid">{saved.map((item) => <article className="saved-prediction-card" key={item.id}><span className={`saved-status ${String(item.prediction).toLowerCase().includes("fake") || String(item.prediction).toLowerCase().includes("contradicted") ? "fake" : "real"}`}>{item.prediction}</span><p>{item.news}</p><button type="button" onClick={() => removeSaved(item.id)}>Remove bookmark</button></article>)}</div> : <div className="user-empty-state"><FaBookmark /><h2>No saved predictions</h2><p>Bookmark predictions from your history to find them here.</p><Link to="/#history">View prediction history</Link></div>}</PageShell>;
}

export function HowItWorks() {
  const steps = [["1", "Submit a news story", "Paste the article text or provide its source URL."], ["2", "AI analyses the content", "The system checks patterns, language, claims, and confidence signals."], ["3", "Review verification evidence", "Compare the prediction, confidence score, and available supporting evidence."], ["4", "Save or share the result", "Keep important results in your history or export them for reference."]];
  return <PageShell title="How It Works" subtitle="Understand every step of the Fake News Detector process." icon={FaInfoCircle}><div className="process-grid">{steps.map(([number, title, text]) => <article key={number}><span>{number}</span><h2>{title}</h2><p>{text}</p></article>)}</div><section className="user-info-card"><h2>Important note</h2><p>Predictions are decision-support signals, not absolute proof. Always verify serious claims with reliable primary sources.</p></section></PageShell>;
}

export function FactCheckingGuide() { return <PageShell title="Fact-Checking Guide" subtitle="Practical steps for verifying information responsibly." icon={FaShieldAlt}><div className="guide-grid">{[["Check the source", "Confirm who published the information and whether the outlet has clear editorial standards."], ["Trace the claim", "Search for the original report rather than relying only on social media reposts."], ["Find supporting evidence", "Look for primary documents, official statements, experts, and independent reporting."], ["Review context", "Check dates, images, quotations, and whether a headline accurately represents the full story."]].map(([title, text]) => <article className="guide-card" key={title}><h2>{title}</h2><p>{text}</p></article>)}</div></PageShell>; }

export function HelpFaq() { return <PageShell title="Help & FAQ" subtitle="Answers to common questions about predictions and accounts." icon={FaQuestionCircle}><div className="faq-list">{[["How accurate are predictions?", "Results depend on the article, source quality, and available verification evidence. Use confidence scores as guidance rather than certainty."], ["Why was a prediction unable to verify evidence?", "Some claims lack accessible sources or may be too new, ambiguous, or incomplete to match reliably."], ["Where is my prediction history stored?", "Saved analyses are connected to your account and can be reviewed from the Prediction History section."], ["Can I delete my prediction history?", "Yes. Use the delete control on an individual prediction or clear the full history from the history page."]].map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></PageShell>; }

export function ContactSupport() {
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setSubmitting(true);
    try {
      const { data } = await API.post("auth/support/", {
        subject: formData.get("subject"),
        email: formData.get("email"),
        message: formData.get("message"),
      });
      toast.success(data.message || "Support request sent successfully.");
      form.reset();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to send your support request.");
    } finally {
      setSubmitting(false);
    }
  };

  return <PageShell title="Contact Support" subtitle="Report an issue or share feedback with the team." icon={FaEnvelope}><form className="support-form user-info-card" onSubmit={submit}><label>Subject<input name="subject" required maxLength="200" placeholder="What can we help with?" /></label><label>Email<input name="email" type="email" required placeholder="you@example.com" /></label><label>Message<textarea name="message" required rows="6" placeholder="Describe the issue or feedback..." /></label><button type="submit" disabled={submitting}>{submitting ? "Sending..." : "Send message"}</button></form></PageShell>;
}

export function AboutUs() {
  return (
    <PageShell title="About Us" subtitle="Learn how our platform works and how we help users evaluate online information." icon={FaUserShield}>
      <section className="user-info-card about-card">
        <h2>Responsible AI for information verification</h2>
        <p>Fake News Detector combines machine-learning classification, source verification, confidence scores, and prediction history to help users examine news more critically. Results support independent judgement and should not replace professional fact-checking.</p>

        <div className="about-zigzag">
          <article className="about-story-row">
            <div className="about-story-image"><img src={aboutNewspaper} alt="Newspaper being displayed" /></div>
            <div className="about-story-content"><div className="about-section-heading"><span>01</span><h3>How it works</h3></div><p>Users submit news text or a source URL. The system analyses the content and compares available supporting evidence, then presents a prediction with a confidence score and verification result.</p></div>
          </article>

          <article className="about-story-row about-story-reverse">
            <div className="about-story-content"><div className="about-section-heading"><span>02</span><h3>Key features</h3></div><p>Article analysis, source-link verification, confidence indicators, prediction history, saved predictions, downloadable reports, personal statistics, user profiles, and administrative analytics.</p></div>
            <div className="about-story-image"><img src={aboutFakeNews} alt="Fake news warning" /></div>
          </article>

          <article className="about-story-row">
            <div className="about-story-image"><img src={aboutNewsroom} alt="News newspaper layout" /></div>
            <div className="about-story-content"><div className="about-section-heading"><span>03</span><h3>Prediction accuracy</h3></div><p>Accuracy depends on article quality, language patterns, available sources, and the freshness of online information. Confidence shows model certainty, not guaranteed truth, so important claims should always be cross-checked.</p></div>
          </article>

          <article className="about-problems">
            <div className="about-section-heading"><span>04</span><h3>Problems and solutions</h3></div>
            <p><strong>Problem:</strong> Limited, outdated, or manipulated sources can produce uncertain results.</p>
            <p><strong>Solution:</strong> Verify primary sources, review context, check multiple trustworthy outlets, and avoid publishing high-risk claims based on a single prediction.</p>
          </article>
        </div>

        <div className="about-values"><span>Transparency</span><span>Accuracy</span><span>User privacy</span><span>Media literacy</span></div>
      </section>
    </PageShell>
  );
}

export function NewsSources() { return <PageShell title="Trusted News Sources" subtitle="Reliable places to cross-check important claims." icon={FaNewspaper}><div className="source-grid">{[["Reuters", "International reporting and fact checks"], ["Associated Press", "Independent global news reporting"], ["BBC News", "International news and public-interest reporting"], ["Official government websites", "Primary sources for policies, public data, and announcements"]].map(([name, text]) => <article className="user-info-card" key={name}><h2>{name}</h2><p>{text}</p></article>)}</div></PageShell>; }

export function PrivacyPolicy() { return <PageShell title="Privacy & Terms" subtitle="Understand how account and prediction information is handled." icon={FaShieldAlt}><section className="legal-content"><h2>Privacy</h2><p>We use account and prediction information to provide authentication, analysis history, exports, and account features. Do not submit sensitive or confidential information in article text.</p><h2>Prediction limitations</h2><p>AI-generated classifications can be incorrect and should not replace professional journalism, expert review, or primary-source verification.</p><h2>Responsible use</h2><p>Use this platform to support critical evaluation—not to make medical, legal, financial, or safety decisions without qualified verification.</p></section></PageShell>; }
