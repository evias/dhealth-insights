const path = require('path');
const fs = require('fs');
const { Resend } = require('resend');
const { createLogger } = require('../api/logger');
const { insightsDb } = require('../api/database');
const { decrypt } = require('../api/crypto');
const config = require('../api/config');
const log = createLogger('scripts/mailer');

let resendAPIKey = process.env.RESEND_API_KEY || "";
if (!resendAPIKey.length) {
  log.error("Mailer service missing API Key (resend); aborted.");
  process.exit(0);
}

if (process.argv.length < 3) {
  log.error(`❌ Missing obligatory arguments.`)
  log.error(`Usage: npm run mailer ISSUE_NUMBER`);
  process.exit(1);
}

const ISSUE_NUMBER = parseInt(process.argv[2]);
const IS_DRY_RUN = process.argv.length >= 4 && process.argv[3] === "--test";

function getMonday(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
  const diff = (day === 0 ? -6 : 1 - day); // shift Sunday back 6 days
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0); // start of day
  return d;
}

function getTemplateHTML(bulletins, fullName) {
  if (!bulletins || bulletins.length < 3) {
    throw new Error("getTemplateHTML: missing bulletins; expected 3, got: " + bulletins.length);
  }

  const templatePath = path.join(__dirname, '..', 'newsletter.html');
  let templateHtml = fs.readFileSync(templatePath, 'utf-8');

  const templateVars = {
    SUBSCRIBER_NAME: fullName,
    ISSUE_DATE: new Date().toLocaleDateString(
    'en-US', {
      weekday:'short',
      year:'numeric',
      month:'short',
      day:'numeric'
    }),
    ISSUE_NUMBER: ""+ISSUE_NUMBER,

    URL_1: `${config.web.baseUrl}/?post=${bulletins[0].id}`,
    TITLE_1: bulletins[0].title,
    SCORE_1: bulletins[0].score,
    SUMMARY_1: bulletins[0].excerpt,

    URL_2: `${config.web.baseUrl}/?post=${bulletins[1].id}`,
    TITLE_2: bulletins[1].title,
    SCORE_2: bulletins[1].score,
    SUMMARY_2: bulletins[1].excerpt,

    URL_3: `${config.web.baseUrl}/?post=${bulletins[2].id}`,
    TITLE_3: bulletins[2].title,
    SCORE_3: bulletins[2].score,
    SUMMARY_3: bulletins[2].excerpt,

    DOMAIN_NAME: `${config.web.domainName}`,
    WEBSITE_URL: `${config.web.baseUrl}`,
    UNSUBSCRIBE_URL: `${config.web.baseUrl}/?unsubscribe=1`,
  };

  return templateHtml.replace(/\{\{([A-Z0-9_]+)\}\}/g, (_, key) =>
    templateVars[key] ?? ''
  );
}

try {
  const resend = new Resend(resendAPIKey);
  const subscribers = insightsDb.getAllSubscribers(100, 0);

  const mondayTz = getMonday().valueOf() / 1000 // unixepoch()
  const bulletins = insightsDb.getAllBulletins('new', 3, 0, mondayTz);
  if (!bulletins.length || bulletins.length < 3) {
    log.error("Nothing to send; aborted.");
    process.exit(1);
  }

  log.info("Now preparing issue #" + ISSUE_NUMBER + " for " + subscribers.length + " subscribers...");

  const bulletinIdx = Math.floor(Math.random() * bulletins.length);
  const bulletinTitle = bulletins[bulletinIdx].title;
  const templateTitle = bulletinTitle;

  for (let i = 0; i < subscribers.length; i++) {
    const email = decrypt(subscribers[i].email);

    // Subscriber variables
    const actualHtml = getTemplateHTML(bulletins, subscribers[i].name);

    if (! IS_DRY_RUN) {
      resend.emails.send({
        from: 'dHealth Insights <insights@dhealth.com>',
        to: email,
        subject: templateTitle,
        html: actualHtml,
      });
      log.info("Newsletter sent to " + email);
    } else {
      log.info("[DRY-RUN] Skipping email transport #" + (i+1));
    }
  }
} catch(error) {
  const err = error instanceof Error ? `${error.name}: ${error.message}` : error;
  log.error('Error sending e-mail:', { err });
}
