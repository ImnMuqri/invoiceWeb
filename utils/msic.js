/**
 * MSIC 2008 codes (spec 05).
 *
 * MSIC is Malaysia's Standard Industrial Classification, aligned with UN ISIC
 * Rev 4. LHDN asks for a five-digit code, and nobody knows theirs by heart —
 * which is why the spec calls for a searchable picker rather than a text box.
 *
 * WHAT THIS LIST IS, AND IS NOT.
 *
 * The full official set runs to roughly 1,500 five-digit codes across 21
 * sections. This is a working subset: the sections and codes that the people
 * using this product actually bill under — software, design, consulting,
 * training, trades, retail, F&B, transport, health and education — chosen so
 * that a Malaysian freelancer or small studio finds themselves in it. It is
 * NOT the complete classification.
 *
 * That is a deliberate trade. A picker that confidently offers a wrong code is
 * worse than one that admits a gap, so anything not listed here can still be
 * typed in by hand: the field accepts free text and always has. The code is
 * stored either way.
 *
 * REPLACING IT WITH THE OFFICIAL LIST.
 *
 * DOSM publishes the full MSIC 2008 ver 1.1 reference. Drop it in as the same
 * shape — `{ code, label, section }` — and the picker gets everything with no
 * other change: search, grouping and the free-text fallback all read from this
 * array and nothing else hardcodes a code.
 */

/** Section letters, for grouping results. Not shown as a filter — too many. */
export const SECTIONS = {
  C: "Manufacturing",
  F: "Construction",
  G: "Wholesale and retail trade",
  H: "Transportation and storage",
  I: "Accommodation and food service",
  J: "Information and communication",
  K: "Financial and insurance",
  L: "Real estate",
  M: "Professional, scientific and technical",
  N: "Administrative and support services",
  P: "Education",
  Q: "Human health and social work",
  R: "Arts, entertainment and recreation",
  S: "Other service activities",
};

export const MSIC = [
  /* ── J · Information and communication ───────────────────────────────────
     The single most common section for this product's users. */
  { code: "58110", label: "Book publishing", section: "J" },
  { code: "58130", label: "Publishing of newspapers, journals and periodicals", section: "J" },
  { code: "58190", label: "Other publishing activities", section: "J" },
  { code: "58200", label: "Software publishing", section: "J" },
  { code: "59110", label: "Motion picture, video and television programme production", section: "J" },
  { code: "59120", label: "Motion picture, video and television programme post-production", section: "J" },
  { code: "59130", label: "Motion picture, video and television programme distribution", section: "J" },
  { code: "59200", label: "Sound recording and music publishing", section: "J" },
  { code: "60100", label: "Radio broadcasting", section: "J" },
  { code: "60200", label: "Television programming and broadcasting", section: "J" },
  { code: "61100", label: "Wired telecommunications activities", section: "J" },
  { code: "61200", label: "Wireless telecommunications activities", section: "J" },
  { code: "61900", label: "Other telecommunications activities", section: "J" },
  { code: "62011", label: "Computer programming activities", section: "J" },
  { code: "62012", label: "Web page designing", section: "J" },
  { code: "62019", label: "Other computer programming activities", section: "J" },
  { code: "62021", label: "Computer consultancy", section: "J" },
  { code: "62022", label: "Computer facilities management activities", section: "J" },
  { code: "62090", label: "Other information technology and computer service activities", section: "J" },
  { code: "63111", label: "Data processing and hosting activities", section: "J" },
  { code: "63120", label: "Web portals", section: "J" },
  { code: "63910", label: "News agency activities", section: "J" },
  { code: "63990", label: "Other information service activities", section: "J" },

  /* ── M · Professional, scientific and technical ───────────────────────── */
  { code: "69100", label: "Legal activities", section: "M" },
  { code: "69200", label: "Accounting, bookkeeping and auditing activities; tax consultancy", section: "M" },
  { code: "70100", label: "Activities of head offices", section: "M" },
  { code: "70200", label: "Management consultancy activities", section: "M" },
  { code: "71101", label: "Architectural activities", section: "M" },
  { code: "71102", label: "Engineering activities and related technical consultancy", section: "M" },
  { code: "71103", label: "Quantity surveying services", section: "M" },
  { code: "71200", label: "Technical testing and analysis", section: "M" },
  { code: "72100", label: "Research and experimental development on natural sciences and engineering", section: "M" },
  { code: "72200", label: "Research and experimental development on social sciences and humanities", section: "M" },
  { code: "73100", label: "Advertising", section: "M" },
  { code: "73200", label: "Market research and public opinion polling", section: "M" },
  { code: "74101", label: "Interior design services", section: "M" },
  { code: "74102", label: "Graphic design services", section: "M" },
  { code: "74103", label: "Fashion design services", section: "M" },
  { code: "74109", label: "Other specialised design activities", section: "M" },
  { code: "74200", label: "Photographic activities", section: "M" },
  { code: "74300", label: "Translation and interpretation activities", section: "M" },
  { code: "74901", label: "Business brokerage and appraising activities", section: "M" },
  { code: "74909", label: "Other professional, scientific and technical activities n.e.c.", section: "M" },
  { code: "75000", label: "Veterinary activities", section: "M" },

  /* ── N · Administrative and support services ──────────────────────────── */
  { code: "77100", label: "Renting and leasing of motor vehicles", section: "N" },
  { code: "77300", label: "Renting and leasing of other machinery and equipment", section: "N" },
  { code: "78100", label: "Activities of employment placement agencies", section: "N" },
  { code: "78200", label: "Temporary employment agency activities", section: "N" },
  { code: "79110", label: "Travel agency activities", section: "N" },
  { code: "79120", label: "Tour operator activities", section: "N" },
  { code: "80100", label: "Private security activities", section: "N" },
  { code: "81210", label: "General cleaning of buildings", section: "N" },
  { code: "81290", label: "Other building and industrial cleaning activities", section: "N" },
  { code: "81300", label: "Landscape care and maintenance service activities", section: "N" },
  { code: "82110", label: "Combined office administrative service activities", section: "N" },
  { code: "82200", label: "Activities of call centres", section: "N" },
  { code: "82301", label: "Organisation of conventions and trade shows", section: "N" },
  { code: "82302", label: "Event management activities", section: "N" },
  { code: "82910", label: "Activities of collection agencies and credit bureaus", section: "N" },
  { code: "82920", label: "Packaging activities", section: "N" },
  { code: "82990", label: "Other business support service activities n.e.c.", section: "N" },

  /* ── P · Education ────────────────────────────────────────────────────── */
  { code: "85100", label: "Pre-primary and primary education", section: "P" },
  { code: "85210", label: "General secondary education", section: "P" },
  { code: "85220", label: "Technical and vocational secondary education", section: "P" },
  { code: "85300", label: "Higher education", section: "P" },
  { code: "85410", label: "Sports and recreation education", section: "P" },
  { code: "85420", label: "Cultural education", section: "P" },
  { code: "85490", label: "Other education n.e.c.", section: "P" },
  { code: "85500", label: "Educational support services", section: "P" },

  /* ── G · Wholesale and retail trade ───────────────────────────────────── */
  { code: "46100", label: "Wholesale on a fee or contract basis", section: "G" },
  { code: "46411", label: "Wholesale of textiles, clothing and footwear", section: "G" },
  { code: "46510", label: "Wholesale of computers, peripheral equipment and software", section: "G" },
  { code: "46520", label: "Wholesale of electronic and telecommunications equipment", section: "G" },
  { code: "46900", label: "Non-specialised wholesale trade", section: "G" },
  { code: "47111", label: "Retail sale in non-specialised stores with food predominating", section: "G" },
  { code: "47190", label: "Other retail sale in non-specialised stores", section: "G" },
  { code: "47411", label: "Retail sale of computers and software in specialised stores", section: "G" },
  { code: "47420", label: "Retail sale of telecommunications equipment in specialised stores", section: "G" },
  { code: "47510", label: "Retail sale of textiles in specialised stores", section: "G" },
  { code: "47711", label: "Retail sale of clothing in specialised stores", section: "G" },
  { code: "47721", label: "Retail sale of footwear in specialised stores", section: "G" },
  { code: "47730", label: "Dispensing chemist in specialised stores", section: "G" },
  { code: "47740", label: "Retail sale of medical and orthopaedic goods in specialised stores", section: "G" },
  { code: "47750", label: "Retail sale of cosmetic and toilet articles in specialised stores", section: "G" },
  { code: "47910", label: "Retail sale via mail order houses or via Internet", section: "G" },
  { code: "47990", label: "Other retail sale not in stores, stalls or markets", section: "G" },

  /* ── I · Accommodation and food service ───────────────────────────────── */
  { code: "55101", label: "Hotels and resort hotels", section: "I" },
  { code: "55102", label: "Motels, budget hotels, homestays and guest houses", section: "I" },
  { code: "55900", label: "Other accommodation", section: "I" },
  { code: "56103", label: "Restaurants and restaurant-cum-night clubs", section: "I" },
  { code: "56104", label: "Cafeterias, fast-food outlets and food stalls", section: "I" },
  { code: "56210", label: "Event catering", section: "I" },
  { code: "56290", label: "Other food service activities", section: "I" },
  { code: "56301", label: "Coffee shops and drink outlets", section: "I" },

  /* ── F · Construction ─────────────────────────────────────────────────── */
  { code: "41001", label: "Construction of residential buildings", section: "F" },
  { code: "41002", label: "Construction of non-residential buildings", section: "F" },
  { code: "42100", label: "Construction of roads and railways", section: "F" },
  { code: "43110", label: "Demolition", section: "F" },
  { code: "43120", label: "Site preparation", section: "F" },
  { code: "43210", label: "Electrical installation", section: "F" },
  { code: "43221", label: "Plumbing and drainage installation", section: "F" },
  { code: "43222", label: "Air-conditioning and ventilation installation", section: "F" },
  { code: "43300", label: "Building completion and finishing", section: "F" },
  { code: "43900", label: "Other specialised construction activities", section: "F" },

  /* ── H · Transportation and storage ───────────────────────────────────── */
  { code: "49230", label: "Freight transport by road", section: "H" },
  { code: "49329", label: "Other taxi operation and e-hailing services", section: "H" },
  { code: "52100", label: "Warehousing and storage", section: "H" },
  { code: "52291", label: "Freight forwarding services", section: "H" },
  { code: "53100", label: "Postal activities", section: "H" },
  { code: "53200", label: "Courier activities", section: "H" },

  /* ── Q · Human health and social work ─────────────────────────────────── */
  { code: "86201", label: "General medical practice activities", section: "Q" },
  { code: "86202", label: "Specialised medical practice activities", section: "Q" },
  { code: "86203", label: "Dental practice activities", section: "Q" },
  { code: "86901", label: "Activities of medical laboratories", section: "Q" },
  { code: "86903", label: "Activities of physiotherapists and other allied health professionals", section: "Q" },
  { code: "88900", label: "Other social work activities without accommodation", section: "Q" },

  /* ── R · Arts, entertainment and recreation ───────────────────────────── */
  { code: "90001", label: "Performing arts activities", section: "R" },
  { code: "90002", label: "Support activities to performing arts", section: "R" },
  { code: "90003", label: "Artistic creation", section: "R" },
  { code: "93110", label: "Operation of sports facilities", section: "R" },
  { code: "93120", label: "Activities of sports clubs", section: "R" },
  { code: "93190", label: "Other sports activities", section: "R" },
  { code: "93290", label: "Other amusement and recreation activities", section: "R" },

  /* ── S · Other service activities ─────────────────────────────────────── */
  { code: "95110", label: "Repair of computers and peripheral equipment", section: "S" },
  { code: "95120", label: "Repair of communication equipment", section: "S" },
  { code: "95210", label: "Repair of consumer electronics", section: "S" },
  { code: "96011", label: "Laundry and dry-cleaning services", section: "S" },
  { code: "96021", label: "Hairdressing and barber shop services", section: "S" },
  { code: "96022", label: "Beauty salons and spa services", section: "S" },
  { code: "96099", label: "Other personal service activities n.e.c.", section: "S" },

  /* ── K, L, C · The rest, kept short ───────────────────────────────────── */
  { code: "64200", label: "Activities of holding companies", section: "K" },
  { code: "66190", label: "Other activities auxiliary to financial service activities", section: "K" },
  { code: "66220", label: "Activities of insurance agents and brokers", section: "K" },
  { code: "68100", label: "Real estate activities with own or leased property", section: "L" },
  { code: "68200", label: "Real estate activities on a fee or contract basis", section: "L" },
  { code: "10710", label: "Manufacture of bakery products", section: "C" },
  { code: "14101", label: "Manufacture of wearing apparel, except fur apparel", section: "C" },
  { code: "18110", label: "Printing", section: "C" },
  { code: "31001", label: "Manufacture of wooden furniture", section: "C" },
  { code: "32200", label: "Manufacture of musical instruments", section: "C" },
];

/** Fast lookup by code, built once. */
const BY_CODE = new Map(MSIC.map((m) => [m.code, m]));

/** The entry for a code, or null. Used to label a stored code on documents. */
export const findMsic = (code) => {
  if (!code) return null;
  return BY_CODE.get(String(code).trim()) || null;
};

/**
 * How a code is written on a document and in the picker's closed state.
 *
 * A code the list does not know still renders — as the bare code — because the
 * field accepts free text and an unknown code is a real answer, not an error.
 */
export const msicLabel = (code) => {
  if (!code) return "";
  const hit = findMsic(code);
  return hit ? `${hit.code} — ${hit.label}` : String(code);
};

/**
 * Search by code AND by description, per the spec's acceptance criteria.
 *
 * Digits match the code by prefix, because someone typing "62" wants the 62xxx
 * family and not every description containing "62". Words match anywhere in
 * the label, so "design" finds graphic, interior and fashion design without
 * anyone knowing they live in section M.
 */
export const searchMsic = (query, limit = 40) => {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return MSIC.slice(0, limit);

  const digits = /^\d+$/.test(q);
  const results = [];

  for (const entry of MSIC) {
    if (digits) {
      if (entry.code.startsWith(q)) results.push(entry);
    } else if (entry.label.toLowerCase().includes(q)) {
      results.push(entry);
    }
    if (results.length >= limit) break;
  }
  return results;
};
