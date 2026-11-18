#!/usr/bin/env node

/**
 * Database Seeding Script
 * 
 * Populates database with sample data for development/testing.
 * Usage: npm run db:seed
 */

const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const { insightsDb } = require('../api/database');

const dbPath = path.join(__dirname, '..', 'insights.db');

// Check if database exists
if (!fs.existsSync(dbPath)) {
  console.error(`❌ Database not found at: ${dbPath}`);
  console.error(`   Run: npm run db:init`);
  process.exit(1);
}

console.log('🌱 Seeding database...');

try {
  // Sample bulletins
  const sampleBulletins = [
    {
      id: 'aidh_gva_gemini38flash_20261112',
      title: "AI, Acquisitions, and $3.4B Expansions: Healthcare's Big Bets in 2026",
      slug: 'ai-acquisitions-3b-expansions-healthcares-big-bets-in-2026',
      excerpt: ""
        + "Oura buys Counsel Health for $625M, Google Cloud launches Gemini for"
        + " healthcare, and BJC-St. Luke's plan a merger — the latest in AI,"
        + " cloud, and healthcare M&A.",
      content: ""
        + "The healthcare sector is seeing substantial momentum in artificial intelligence adoption, "
        + "cloud infrastructure partnerships, and strategic mergers and acquisitions. Highlighting "
        + "tech-enabled clinical expansion, smart ring maker Oura announced its planned $625 million "
        + "acquisition of virtual primary care startup Counsel Health, signaling wearables' push into "
        + "direct clinical care. Concurrently, big tech continues to expand healthcare-specific AI "
        + "ecosystems: Google Cloud rolled out Gemini for healthcare—an agentic AI platform designed "
        + "to automate clinical and administrative tasks—while Amazon Web Services (AWS) launched the "
        + "AWS Health Impact Initiative, committing $100 million in cloud and AI credits over five "
        + "years to address health equity, care access, and food insecurity. Additional AI initiatives "
        + "include CareSource's new $1 million grant program backing responsible AI and Deerfield "
        + "Management's collaboration with AWS to scale AI-native health ventures.\n\n"
        + "At the same time, provider networks and health systems are aggressively consolidating and "
        + "recalibrating their strategic footprint. Missouri-based BJC Health and St. Luke's signed a "
        + "letter of intent to merge, uniting the community provider with the state's largest health "
        + "system, while HealthSpan Partners raised its buyout offer for Surgery Partners to $6 billion "
        + "amid a competitive bidding battle. Large providers are also committing massive capital to "
        + "growth and workforce stability, with MD Anderson Cancer Center announcing a $3.4 billion campus "
        + "expansion (introducing Inspiration Tower and Prism) and Advocate Health investing $846 million "
        + "into 2027 employee compensation alongside $390 million for benefits. Financially, Kaiser "
        + "Permanente reported strong operational growth in Q3 2026, boosting operating revenues to $34.7 "
        + "billion and doubling its operating margin.",
      model: "gva/gemini-3.8-flash",
      sources: JSON.stringify([
        "https://www.healthcaredive.com",
        "https://www.fiercehealthcare.com",
        "https://thehealthcareblog.com",
      ]),
      tags: "healthcare AI, AI in healthcare, healthcare M&A, health tech, Google Cloud, Gemini for healthcare, AWS, Oura, digital health, hospital mergers",
      trending: 0,
    },
    {
      id: "aidh_gva_gemini38flash_20261113",
      title: "CMS Fraud Crackdowns, AI's Clinical Deep Dive, and $6B Hospital Bids: Health Policy Roundup",
      slug: "cms-fraud-crackdowns-ai-clinical-deep-dive-and-6b-hospital-bids-health-policy-roundup",
      excerpt: ""
        + "CMS extends its home health moratorium, Google and AWS double down on health AI, and a new "
        + "$8.39B No Surprises Act study sparks bipartisan reform — this week's key healthcare headlines.",
      content: ""
        + "Federal regulators and policymakers are sharpening their focus on enforcement, operational "
        + "modernization, and dispute reform. The Centers for Medicare & Medicaid Services (CMS) has "
        + "extended its moratorium on new Medicare enrollments for home health agencies and hospices "
        + "for an additional six months amid persistent fraud concerns across the sector. Simultaneously, "
        + "CMS and the Office of the National Coordinator for Health IT (ONC) launched a voluntary industry "
        + "initiative to test electronic prior authorization in real-world environments ahead of mandated "
        + "federal compliance in 2027. On Capitol Hill, lawmakers are preparing bipartisan legislation to "
        + "overhaul the No Surprises Act after a new study revealed that the independent dispute "
        + "resolution (IDR) process cost employer health plans an additional $8.39 billion in 2025. "
        + "Meanwhile, UnitedHealth Group released an independent audit examining its medical policy "
        + "development processes, though the review stopped short of evaluating how coverage denial "
        + "criteria are actively applied in practice.\n\n"
        + "Artificial intelligence and digital health continue to capture major strategic investments "
        + "while integrating deeper into daily clinical workflows. Tech giants expanded their footprint "
        + "with Google Cloud debuting its healthcare-specific Gemini agentic AI platform and Amazon Web "
        + "Services committing $100 million over five years to health AI and cloud initiatives. Venture "
        + "funding also surged, with Zus Health raising $33 million to construct patient data "
        + "infrastructure for AI applications, Dyania Health teaming with Nvidia to deploy on-premises "
        + "clinical reasoning within hospital networks, and wearable maker Oura announcing a $625 "
        + "million deal to acquire Counsel Health. While surveys indicate AI has become a regular "
        + "fixture for physicians conducting literature reviews and clinical decision-making, patient "
        + "confidence remains closely tied to provider involvement; a new Gallup poll confirmed that "
        + "patient comfort with AI-assisted care depends heavily on active human oversight.\n\n"
        + "Hospital systems and provider networks are navigating major consolidation, executive "
        + "turnover, and regulatory settlements. In provider transactions, Ardent Health reached an "
        + "agreement to acquire Missouri-based nonprofit Boone Health for $47 million alongside a "
        + "$200 million capital commitment, BJC Health and St. Luke's signed a letter of intent to "
        + "merge, and Bon Secours Mercy Health increased its valuation offer for a majority stake "
        + "in Surgery Partners to $6 billion. Leadership changes are underway across prominent "
        + "health systems, notably with Novant Health CEO Carl Armato retiring after more than "
        + "a decade and Chief Operating Officer John Gizdic stepping up to lead the organization. "
        + "In payer compliance, Carelon entered into two settlement agreements totaling more than "
        + "$10 million in New York to resolve state allegations involving 'ghost networks' of mental "
        + "health providers and inappropriate coverage denials.",
      model: "gva/gemini-3.8-flash",
      sources: JSON.stringify([
        "https://www.healthcaredive.com",
        "https://www.fiercehealthcare.com",
        "https://thehealthcareblog.com",
      ]),
      tags: "health policy, CMS, Medicare, No Surprises Act, healthcare regulation, health AI, prior authorization, UnitedHealth Group, hospital consolidation, weekly insights",
      trending: 0,
    },
    {
      id: "aidh_gva_gemini38flash_20261115",
      title: "Medicaid Grace Periods, CommonSpirit's $544M Loss, and AI's Clinical Push: Healthcare Weekly Roundup",
      slug: "medicaid-grace-periods-commonspirits-544m-loss-and-ais-clinical-push-healthcare-weekly-roundup",
      excerpt: ""
        + "CMS extends its home health moratorium, states get Medicaid work-requirement relief, "
        + "CommonSpirit posts a $544M loss, and Google's Gemini enters clinical workflows — this week in healthcare.",
      content: ""
        + "The healthcare sector is navigating substantial regulatory updates, administrative "
        + "enforcement delays, and ongoing scrutiny over payer practices. Notably, the Centers "
        + "for Medicare & Medicaid Services (CMS) has extended its enrollment moratorium preventing "
        + "new home health agencies and hospice facilities from entering the Medicare program for an "
        + "additional six months amid fraud concerns. In parallel, the Trump administration announced "
        + "an optional six-month grace period through June 30, 2027, for states implementing new "
        + "Medicaid work requirements, giving agencies time to upgrade eligibility infrastructure "
        + "without immediately terminating noncompliant beneficiaries. Concurrently, CMS and the Office "
        + "of the National Coordinator for Health Information Technology (ONC) launched a voluntary "
        + "testing initiative to help payers and providers pilot electronic prior authorization processes "
        + "ahead of federal deadlines, while congressional leaders prepare bipartisan legislation to "
        + "address cost and arbitration issues within the No Surprises Act's independent dispute "
        + "resolution framework.\n\n"
        + "On the financial and operational front, health systems and payers face persistent margin "
        + "pressure alongside selective consolidation. CommonSpirit Health reported a $544 million "
        + "operating loss to open its fiscal year 2027, attributing the shortfall to rising "
        + "operational costs and unfavorable payer mix despite solid patient volumes. Strategic "
        + "transactions remain active, with Ardent Health agreeing to acquire Missouri nonprofit "
        + "Boone Health for $47 million along with a $200 million capital commitment, and St. Luke's "
        + "signing a letter of intent to merge with BJC Health. In payer developments, UnitedHealth "
        + "Group published an independent audit examining its medical policy development "
        + "procedures—part of an ongoing turnaround effort—though the review stopped short of "
        + "assessing how criteria are applied in care denial decisions.\n\n"
        + "Technological adoption, particularly artificial intelligence, continues to expand "
        + "across clinical and operational workflows. New survey data indicates physicians are "
        + "increasingly leveraging AI for diagnostic support and literature reviews despite "
        + "lingering accuracy concerns, while Gallup polling highlights that patient acceptance "
        + "of clinical AI relies heavily on provider oversight. Major technology players and "
        + "investors are responding aggressively: Google Cloud rolled out a dedicated healthcare "
        + "agentic AI platform powered by Gemini, Dyania Health partnered with Nvidia to execute "
        + "on-premise clinical reasoning inside hospital networks, Zus Health secured $33 million "
        + "to develop AI data infrastructure, and smart ring maker Oura announced a $625 million "
        + "deal to acquire Counsel Health.",
      model: "gva/gemini-3.8-flash",
      sources: JSON.stringify([
        "https://www.healthcaredive.com",
        "https://www.fiercehealthcare.com",
        "https://thehealthcareblog.com",
      ]),
      tags: "health policy, CMS, Medicaid, healthcare AI, health system finances, hospital M&A, No Surprises Act, prior authorization, UnitedHealth Group, weekly roundup",
      trending: 1,
    },
    {
      id: "aidh_gva_gemini38flash_20261117",
      title: "Weekly Insights: Healthcare AI Accelerates Amid Medicaid Policy Delays and GLP-1 Cost Pressures",
      slug: "weekly-insights-healthcare-ai-accelerates-amid-medicaid-policy-delays-and-glp-1-cost-pressures",
      excerpt: ""
        + "This edition of Weekly Insights covers surging health AI adoption—including OpenAI and Apple "
        + "initiatives—alongside CMS's six-month Medicaid work requirement extension, nonprofit hospital "
        + "financial pressures, and new pricing studies surrounding GLP-1 obesity therapies.",
      content: ""
        + "The healthcare sector is experiencing an acceleration in artificial intelligence deployment "
        + "alongside significant operational hurdles. Healthcare AI expenditure more than doubled over "
        + "the past year to $3.7 million per provider organization as health systems increasingly invest "
        + "in clinical copilots, conversational AI, and front-office automation. Major industry moves "
        + "include Apple and OpenEvidence launching a 200,000-participant conversational health AI study "
        + "and app, while OpenAI is collaborating with CVS Health, Cigna, and Abridge to pilot "
        + "computer-use agents designed to navigate EHRs and payer portals. Simultaneously, Suki "
        + "introduced an agentic operating system for clinical workflows, and Dyania Health teamed "
        + "with Nvidia to run clinical reasoning on-premise. However, scaling these technologies "
        + "beyond initial pilot phases remains a challenge due to unpredictable costs and mounting "
        + "technical complexity, as highlighted in a recent Google Cloud analysis.\n\n"
        + "Policy shifts and payer-provider dynamics are equally redefining operational priorities. "
        + "The Centers for Medicare & Medicaid Services (CMS) granted states an optional six-month "
        + "enforcement delay through June 30, 2027, for new Medicaid work requirements, giving "
        + "administrations time to refine eligibility tracking without terminating coverage. On the "
        + "regulatory front, ONC is rolling out testing environments for electronic prior "
        + "authorization ahead of federal deadlines, while Medicare has extended a six-month "
        + "enrollment moratorium on new home health and hospice providers due to fraud concerns. In "
        + "the provider market, nonprofit systems face growing financial headwinds: CommonSpirit "
        + "Health posted a $544 million operating loss to open its fiscal year 2027, and a Lown "
        + "Institute report revealed that the value of tax breaks for most nonprofit hospitals "
        + "exceeded their community benefit spending.\n\n"
        + "Pharmaceutical pricing and chronic care management continue to dominate payer strategies, "
        + "specifically surrounding GLP-1 therapies. A CVS white paper indicated that GLP-1 drugs "
        + "could yield long-term net savings for employers if manufacturers price them at $350 per "
        + "month or below, placing direct pressure on drugmakers to lower rates. At the same time, "
        + "clinical findings from Calibrate and Withings showed that integrating GLP-1 medications "
        + "with comprehensive wraparound lifestyle programs boosted patient weight loss by more "
        + "than 60% compared to medication alone, emphasizing that tech-enabled clinical care "
        + "models remain critical to achieving sustainable clinical and financial outcomes.",
      model: "gva/gemini-3.8-flash",
      sources: JSON.stringify([
        "https://www.healthcaredive.com",
        "https://www.fiercehealthcare.com",
        "https://thehealthcareblog.com",
      ]),
      tags: "Healthcare AI, CMS, Medicaid, Health Tech, GLP-1, Prior Authorization, Hospital Finance, weekly insights",
      trending: 1,
    },
  ];

  let bulletinCount = 0;

  for (const bulletin of sampleBulletins) {

    insightsDb.createBulletin(bulletin)

    console.log(`  ✓ Added bulletin: ${bulletin.id}`);
    bulletinCount++;
  }

  const ctaEntries = [
    {
      id: "aidh_explore_dhealth_prevention",
      title: "🩺 Your Patients Are Changing. Is Your Practice?",
      content: ""
        + "Health systems that adopted AI-assisted prevention workflows last year are already "
        + "flagging chronic-risk patients months earlier — while others are still reacting to "
        + "symptoms. See how dHealth's prevention-first intelligence turns raw clinical signals "
        + "into early interventions, without adding a single hour to your team's week.",
      cta_text: "Explore the dHealth Prevention Platform",
      cta_url: "https://prevention.dhealth.com",
      num_clicks: Math.floor(Math.random() * 153),
    },
    {
      id: "aidh_request_early_access_aidh",
      title: "🤖 Meet AIDH: AI That Reads Health Before Disease Does 🤖",
      content: ""
        + "AIDH fuses wearables data, clinical guidelines, and population-level signals into "
        + "one continuously learning prevention engine. No black boxes — every risk score is "
        + "explainable, auditable, and clinician-approved. Join the first cohort of clinics "
        + "piloting it and shape what preventive care looks like in 2030.",
      cta_text: "Request Early Access to AIDH",
      cta_url: "https://www.dhealth.com/ai-agent",
      num_clicks: Math.floor(Math.random() * 153),
    },
    {
      id: "aidh_create_prevention_agent",
      title: "🏥 The Best Appointment Is the One You Never Need. 🏥",
      content: ""
        + "Preventive care saves systems billions — yet under 8% of adults get recommended "
        + "preventive services on time. Flip the model: continuous monitoring, proactive "
        + "alerts, and a care team that reaches out before things go wrong.",
      cta_text: "Create your Prevention Agent",
      cta_url: "https://prevention.dhealth.com",
      num_clicks: Math.floor(Math.random() * 153),
    },
    {
      id: "aidh_meet_your_nutrition_agent",
      title: "🍽️ Stop Guessing What to Eat. Ask Your Agent. 🍽️",
      content: ""
        + "Calorie apps tell you what you ate. NutriAgent tells you what to do next —"
        + " an AI nutrition agent that learns your glucose response, goals, and "
        + "preferences, then plans meals that actually move your numbers.",
      cta_text: "Meet your Nutrition Agent",
      cta_url: "https://nutriagent.dhealth.com",
      num_clicks: Math.floor(Math.random() * 153),
    },
    {
      id: "aidh_meet_your_care_partner",
      title: "🤝 You Don't Have to Navigate This Journey Alone. 🤝",
      content: ""
        + "Caring for a loved one with dementia is a path no family should walk "
        + "unprepared. dHealth brings together guidance, daily routines, and a "
        + "supportive community of families who understand — so every step feels "
        + "a little lighter.",
      cta_text: "Meet your Care Partner",
      cta_url: "https://dementia.dhealth.com",
      num_clicks: Math.floor(Math.random() * 153),
    },
  ];

  let ctaEntriesCount = 0;

  for (const entry of ctaEntries) {

    insightsDb.createCTAEntry(entry)

    console.log(`  ✓ Added CTA entry: ${entry.id}`);
    ctaEntriesCount++;
  }

  console.log(`\n✅ Database seeded successfully!`);
  console.log(`   Added ${bulletinCount} bulletins`);
  console.log(`   Added ${ctaEntriesCount} CTA entries`);

} catch (error) {
  console.error('❌ Seeding failed:', error.message);
  process.exit(1);
}
