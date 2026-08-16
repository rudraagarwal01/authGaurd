import type { Domain, DomainStatus } from "../types";

// Deterministic seeded random (Park-Miller LCG) — same output every page load.
function makeRng(seed: number) {
  let s = seed;
  return () => {
    s = Math.imul(s, 16807) % 2_147_483_647;
    return (s - 1) / 2_147_483_646;
  };
}

// ─── Chart data ───────────────────────────────────────────────────────────────

export function generateMockReports(days = 30): { date: string; count: number }[] {
  const rng = makeRng(20260816);
  const today = new Date();
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (days - 1 - i));
    const r = rng();
    const count = r < 0.25 ? 0 : r < 0.5 ? 1 : r < 0.75 ? 2 : r < 0.85 ? 3 : r < 0.95 ? 4 : 5;
    return { date: d.toISOString().slice(0, 10), count };
  });
}

// ─── Domain data ──────────────────────────────────────────────────────────────

const CLEAN_URLS = [
  "devportal.io", "myblog.net", "api-sandbox.dev", "techstartup.co", "openmetrics.io",
  "codelab.dev", "dashboard-tools.com", "static-assets.net", "cdn-images.io", "user-analytics.co",
  "webhooks.dev", "staging-env.net", "preview-build.io", "getstarted.io", "learncode.dev",
  "projecthub.co", "apidocs.dev", "datastream.io", "eventtracker.co", "notifyme.app",
  "logpipeline.dev", "authservice.io", "payments-sandbox.co", "usersync.net", "mediaplayer.io",
  "filestorage.co", "imageresizer.dev", "taskboard.app", "timesheets.io", "reportbuilder.co",
  "testenv.dev", "mockserver.io", "devdocs.net", "styleguide.co", "designsystem.io",
  "colorpalette.dev", "iconset.co", "fontloader.io", "mapwidget.dev", "chartbuilder.co",
  "formbuilder.io", "survey-tool.dev", "quiz-platform.co", "learning-hub.io", "courseplayer.dev",
  "videocontent.co", "podcasthost.io", "blogplatform.dev", "newsaggregator.co", "rssreader.io",
  "bookmarksapp.dev", "notepadapp.co", "todolistapp.io", "calendarapp.dev", "scheduler.co",
  "meetingplanner.io", "projecttracker.dev", "bugtracker.co", "issuetracker.io", "featureflag.dev",
  "abtesting.io", "heatmaptools.dev", "sessionrecorder.co", "userfeedback.io", "npssurvey.dev",
  "supportchat.co", "helpdeskapp.io", "ticketingsystem.dev", "knowledgebase.co", "changelog.dev",
];

const MODERATE_URLS = [
  "paypa1.com", "arnazon-support.net", "micros0ft-account.com", "g00gle-signin.com",
  "app1e-verify.net", "netf1ix-billing.com", "faceb00k-login.net", "chase-secure-login.com",
  "bankofamerica-verify.net", "we1lsfargo-alert.com", "citibank-update.net", "amaz0n-prime.com",
  "paypa1-checkout.net", "dr0pbox-share.com", "githublogin.net", "go0gle-drive.com",
  "microsft-office.net", "app1e-id-update.com", "linkedln-login.net", "tw1tter-verify.com",
];

const HIGH_URLS = [
  "secure-paypal-verify-account.com", "microsoft-office365-login.net",
  "amazon-package-verify-confirm.com", "apple-id-verification-required.net",
  "chase-bank-secure-login-alert.com", "wellsfargo-fraud-alert-verify.net",
  "netflix-update-billing-info.com", "facebook-account-suspended-verify.net",
  "capitalone-fraud-protection-login.com", "google-account-security-check-now.net",
];

function generateMockDomains(): Domain[] {
  const rng = makeRng(20260817);
  const dateStr = (daysAgo: number): string => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    d.setHours(12, 0, 0, 0);
    return d.toISOString();
  };

  let id = 1;
  const rows: Domain[] = [];

  const add = (
    urls: string[],
    riskMin: number,
    riskMax: number,
    statusFn: () => DomainStatus,
    maxReports: number,
  ) => {
    urls.forEach((url) => {
      const firstDaysAgo = 5 + Math.floor(rng() * 25);
      const lastDaysAgo = Math.floor(rng() * firstDaysAgo);
      rows.push({
        id: id++,
        url,
        risk_score: Math.round((rng() * (riskMax - riskMin) + riskMin) * 10) / 10,
        report_count: Math.floor(rng() * maxReports),
        first_seen: dateStr(firstDaysAgo),
        last_seen: dateStr(lastDaysAgo),
        status: statusFn(),
      });
    });
  };

  add(CLEAN_URLS,    0,  15, () => (rng() < 0.55 ? "safe" : "pending"), 3);
  add(MODERATE_URLS, 40, 70, () => "flagged",                            9);
  add(HIGH_URLS,     80, 99, () => "flagged",                            20);

  return rows;
}

export const MOCK_DOMAINS = generateMockDomains();

export const MOCK_DOMAIN_STATS = {
  totalDomains:  MOCK_DOMAINS.length,
  avgRiskScore:  Math.round((MOCK_DOMAINS.reduce((s, d) => s + d.risk_score, 0) / MOCK_DOMAINS.length) * 10) / 10,
  activeThreats: MOCK_DOMAINS.filter((d) => d.risk_score >= 60).length,
};
