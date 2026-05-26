export const STATE_TIMEZONES: Record<string, string> = {
  AL: "America/Chicago",
  AK: "America/Anchorage",
  AZ: "America/Phoenix",
  AR: "America/Chicago",
  CA: "America/Los_Angeles",
  CO: "America/Denver",
  CT: "America/New_York",
  DE: "America/New_York",
  FL: "America/New_York",
  GA: "America/New_York",
  HI: "Pacific/Honolulu",
  ID: "America/Boise",
  IL: "America/Chicago",
  IN: "America/Indiana/Indianapolis",
  IA: "America/Chicago",
  KS: "America/Chicago",
  KY: "America/New_York",
  LA: "America/Chicago",
  ME: "America/New_York",
  MD: "America/New_York",
  MA: "America/New_York",
  MI: "America/New_York",
  MN: "America/Chicago",
  MS: "America/Chicago",
  MO: "America/Chicago",
  MT: "America/Denver",
  NE: "America/Chicago",
  NV: "America/Los_Angeles",
  NH: "America/New_York",
  NJ: "America/New_York",
  NM: "America/Denver",
  NY: "America/New_York",
  NC: "America/New_York",
  ND: "America/Chicago",
  OH: "America/New_York",
  OK: "America/Chicago",
  OR: "America/Los_Angeles",
  PA: "America/New_York",
  RI: "America/New_York",
  SC: "America/New_York",
  SD: "America/Chicago",
  TN: "America/Chicago",
  TX: "America/Chicago",
  UT: "America/Denver",
  VT: "America/New_York",
  VA: "America/New_York",
  WA: "America/Los_Angeles",
  WV: "America/New_York",
  WI: "America/Chicago",
  WY: "America/Denver",
  DC: "America/New_York",
};

export const TIMEZONE_LABELS: Record<string, string> = {
  "America/New_York": "ET",
  "America/Chicago": "CT",
  "America/Denver": "MT",
  "America/Phoenix": "MT",
  "America/Los_Angeles": "PT",
  "America/Anchorage": "AKT",
  "Pacific/Honolulu": "HT",
};

export const TEMPLATE_KEYS = {
  INTRO: [
    { subject: "email_template_intro_v1_subject", body: "email_template_intro_v1_body" },
    { subject: "email_template_intro_v2_subject", body: "email_template_intro_v2_body" },
    { subject: "email_template_intro_v3_subject", body: "email_template_intro_v3_body" },
  ],
  SHOWREELS: [
    { subject: "email_template_showreels_v1_subject", body: "email_template_showreels_v1_body" },
    { subject: "email_template_showreels_v2_subject", body: "email_template_showreels_v2_body" },
    { subject: "email_template_showreels_v3_subject", body: "email_template_showreels_v3_body" },
  ],
  CURTAIN_CALL: [
    { subject: "email_template_curtain_call_v1_subject", body: "email_template_curtain_call_v1_body" },
    { subject: "email_template_curtain_call_v2_subject", body: "email_template_curtain_call_v2_body" },
    { subject: "email_template_curtain_call_v3_subject", body: "email_template_curtain_call_v3_body" },
  ],
  SIGNATURES: {
    indigo: "email_signature_indigo",
    rose: "email_signature_rose",
  }
};

export const DEFAULT_TEMPLATES = {
  INTRO: [
    { 
      subject: "Introducing HuddleCard — Group greeting cards on autopilot", 
      body: "I'd love to introduce HuddleCard. We make group greeting cards that your whole team signs together, with video, voice notes, and photos. We also put birthdays and work anniversaries on autopilot." 
    },
    { 
      subject: "Quick intro: HuddleCard for Teams", 
      body: "Came across your company and wanted to introduce HuddleCard. We help teams stay connected and celebrate milestones effortlessly through interactive group cards." 
    },
    { 
      subject: "Boost team culture with HuddleCard?", 
      body: "I'm reaching out from HuddleCard. We help remote and hybrid teams celebrate birthdays, anniversaries, and milestones with personal group cards. Thought we'd be a good fit for your team!" 
    },
  ],
  SHOWREELS: [
    { 
      subject: "HuddleCard — A look at how it works", 
      body: "I thought you might appreciate a quick look at how HuddleCard works and how easily your team can collaborate on group cards." 
    },
    { 
      subject: "Interactive group cards for your team", 
      body: "Wanted to share a quick preview of what modern team celebrations look like with HuddleCard. You can add video, voice notes, and threads directly." 
    },
    { 
      subject: "Putting team birthdays on autopilot", 
      body: "Here is a quick look at how you can automate team birthdays and work anniversaries so nobody ever gets forgotten." 
    },
  ],
  CURTAIN_CALL: [
    { 
      subject: "One last thought from HuddleCard", 
      body: "Just checking in one last time to see if you had any thoughts on our previous notes. Would love to help your team get started with a free trial." 
    },
    { 
      subject: "Checking in: HuddleCard", 
      body: "Hope you're having a great week. Just wanted to follow up one last time before I take this off my list. Would love to chat if the timing is right." 
    },
    { 
      subject: "Final follow up / HuddleCard", 
      body: "Wanted to send one last note to see if there's any interest in a quick intro call or setting up your team. If not, no worries at all!" 
    },
  ],
  SIGNATURES: {
    indigo: "\nWerner Burger\nFounder, HuddleCard\n\n+27 73 252 8362\nwww.huddlecard.com\n\n---\nThis email and any attachments are confidential and intended solely for the use of the individual or entity to whom it is addressed. If you have received this email in error, please notify HuddleCard and delete this message from your system.",
    rose: "\nMartin\nHuddleCard\n\nwww.huddlecard.com\n\n---\nThis email and any attachments are confidential and intended solely for the use of the individual or entity to whom it is addressed. If you have received this email in error, please notify HuddleCard and delete this message from your system.",
  }
};
