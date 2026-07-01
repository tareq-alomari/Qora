# US DV Lottery (E-DV) Website - Complete Technical Analysis

> **Date:** 2026-07-01
> **Purpose:** Reference document for the Qor3a lottery management system's assisted registration service
> **Target Clients:** Yemeni nationals (Yemen is eligible for DV-2026+)

---

## A. Website Pages & Sections

### 1. Main Official Information Site
**Base URL:** `https://travel.state.gov/content/travel/en/us-visas/immigrate/diversity-visa-program-entry.html`

| Page | URL Path | Content |
|------|----------|---------|
| DV Program Home | `/content/travel/en/us-visas/immigrate/diversity-visa-program-entry.html` | Overview, eligibility summary, steps overview |
| Submit an Entry (Step 1) | `/diversity-visa-submit-entry1.html` | How to apply, link to E-DV site |
| Selection of Applicants (Step 2) | `/diversity-visa-submit-entry1/diversity-visa-selection-of-applicants.html` | Random selection process, Entrant Status Check info |
| If Selected (Step 3) | `/diversity-visa-if-you-are-selected.html` | Instructions for selectees |
| Confirm Qualifications (Step 4) | `/diversity-visa-if-you-are-selected/diversity-visa-confirm-your-qualifications.html` | Education/work requirements |
| Submit DS-260 (Step 5) | `/diversity-visa-if-you-are-selected/diversity-visa-submit-your-iv-and-alien-registration-application.html` | Online visa application |
| Prepare Documents (Step 6) | `/diversity-visa-if-you-are-selected/diversity-visa-prepare-supporting-documents.html` | Civil documents checklist |
| Interview (Step 7) | `/diversity-visa-interview.html` | Interview process info |
| Prepare for Interview (Step 8) | `/diversity-visa-interview/diversity-visa-prepare-for-interview.html` | Interview preparation |
| Applicant Interview (Step 9) | `/diversity-visa-interview/diversity-visa-applicant-interview.html` | What to expect at interview |
| After Interview (Step 10) | `/diversity-visa-interview/diversity-visa-after-the-interview.html` | Post-interview process |
| DV Instructions | `/diversity-visa-instructions.html` | Links to PDF instructions for each year |
| DV Statistics | `/diversity-visa-program-statistics.html` | Historical selection statistics |
| Photo Requirements | `/content/travel/en/us-visas/visa-information-resources/photos.html` | General visa photo requirements |
| Digital Image Requirements | `/photos/digital-image-requirements.html` | DV-specific digital photo specs |
| Photo Examples | `/photos/photo-examples.html` | Acceptable/unacceptable photo examples |
| Photo Composition Template | `/photos/photo-composition-template.html` | Head size/position template |
| Kentucky Consular Center Info | `/kentucky-consular-center-information.html` | KCC contact and role info |

### 2. E-DV Application Website
**Base URL:** `https://dvprogram.state.gov/`

This site is **only active during the registration period** (typically Oct 2 - Nov 7 each year). Outside this window, it displays a countdown/inactive message.

#### Site Sections (observed during active periods + ESC):

| Page | URL Path | Purpose |
|------|----------|---------|
| Home Page | `https://dvprogram.state.gov/` | Links to: Submit Entry, Entrant Status Check, Photo Tips, FAQs |
| Applicant Entry System (AES) | `/AES/` (dynamic session-based URL) | The main DS-5501 entry form - Part One, Part Two, Review, Confirmation |
| Entrant Status Check (ESC) | `/ESC/CheckStatus.aspx` | Check if selected (requires: confirmation number, last name, year of birth, CAPTCHA) |
| Forgot Confirmation Number | `/ESC/CheckConfirmation.aspx` | Recover lost confirmation number (requires: program year, name, DOB, email, CAPTCHA) |
| Photo Tool | `https://tsg.phototool.state.gov/photo` | Official photo cropping/resizing tool (external, hosted separately) |

#### E-DV System Architecture (from PIA documents):
The eDV system has two components:
1. **Applicant Entry System (AES)** - For submitting entries
2. **Entrant Status Check (ESC)** - For checking selection status
- Hosted on Department of State intranet with defense-in-depth security
- NIST 800-53 controls
- Internal access limited to authorized DoS users and cleared contractors

---

## B. Application Form Fields (Complete)

### General Rules
- **Form Name:** DS-5501 (Electronic Diversity Visa Entry Form)
- **OMB Control Number:** 1405-0153
- **Session Timeout:** 60 minutes (from when the form loads)
- **Language:** English only - all entries must use English/Latin characters
- **One entry per person per year** - duplicates detected and disqualified
- **No save-and-return** - must complete in one sitting
- **Fee:** Free (historically); **$1 fee from DV-2027 onward** (via Pay.gov)
- **New requirement from DV-2027:** Passport biographic page upload (JPEG, max 5MB)

---

### Section 1: Personal Information - Part One: Entrant Information

#### Field 1.1: Name
| Property | Value |
|----------|-------|
| **Field Label** | `1. Name` |
| **Sub-fields** | a. Last/Family Name, b. First Name, c. Middle Name |
| **Data Type** | Text (free text, Latin/English characters only) |
| **Required** | Yes (all sub-fields or checkboxes) |
| **Validation** | Must match passport exactly. If only one name exists, put it in Last/Family Name. |
| **Special options** | "No First Name" checkbox, "No Middle Name" checkbox - for entrants with single names |
| **Character limit** | Not explicitly documented, but typically ~50-100 chars per field |
| **Format** | As appears on passport: "last/family name, first name, middle name" |
| **Critical rule** | Do NOT include a middle name unless it appears on the passport |

#### Field 1.2: Gender (changed to "Sex" from DV-2027 per Federal Register 2026-04737)
| Property | Value |
|----------|-------|
| **Field Label** | `2. Gender` (DV-2026) / `2. Sex` (DV-2027+) |
| **Data Type** | Radio button (2 options) |
| **Options** | Male / Female |
| **Required** | Yes |

#### Field 1.3: Birth Date
| Property | Value |
|----------|-------|
| **Field Label** | `3. Birth Date` |
| **Sub-fields** | Day, Month, Year (3 separate dropdowns or fields) |
| **Data Type** | Numeric with dropdowns |
| **Format** | DD (01-31) / MM (01-12) / YYYY (e.g., 1990) |
| **Required** | Yes |
| **Validation** | Must be a valid date; entrant must be at least 18 years old (effectively) |

#### Field 1.4: City Where You Were Born
| Property | Value |
|----------|-------|
| **Field Label** | `4. City Where You Were Born` |
| **Data Type** | Text (free text) |
| **Required** | Yes |
| **Validation** | Enter city name only, NOT district/county/province/state |
| **Special option** | "Birth City Unknown" checkbox available |
| **Character limit** | ~100 chars max |

#### Field 1.5: Country Where You Were Born
| Property | Value |
|----------|-------|
| **Field Label** | `5. Country Where You Were Born` |
| **Data Type** | Dropdown (list of countries, uses current names) |
| **Required** | Yes |
| **Important** | Use the CURRENT name of the country - not historical names |
| **Note** | This is NOT the country of residence or citizenship |

#### Field 1.6: Country of Eligibility for the DV Program
| Property | Value |
|----------|-------|
| **Field Label** | `6. Country of Eligibility for the DV Program` |
| **Data Type** | Dropdown + Yes/No radio + free text explanation |
| **Sub-questions** | "Are you claiming eligibility based on the country where you were born?" → Yes / No |
| **If No** | Dropdown to select alternate country + text field for explanation |
| **Required** | Yes |
| **Default** | Same as country of birth (if born in eligible country) |
| **Alternate chargeability** | Can claim: (a) spouse's country of birth, or (b) parent's country of birth (if born in country where neither parent was born nor resident) |
| **Yemen status** | **Eligible** - listed under ASIA region |

---

### Section 2: Photo Upload

#### Field 2.7: Entrant Photograph
| Property | Value |
|----------|-------|
| **Field Label** | `7. Entrant Photograph` |
| **Data Type** | File upload (JPEG only) |
| **Upload method** | "Choose New Photo" button → file browser |
| **Photo displayed** | After selection, shows preview of uploaded image |
| **Required** | Yes (for principal entrant, spouse, and each child) |
| **File format** | JPEG (.jpg) |
| **Dimensions** | 600x600 pixels minimum, 1200x1200 pixels maximum, square aspect ratio |
| **File size** | ≤ 240 KB |
| **Color** | 24-bit color, sRGB color space |
| **Compression** | ≤ 20:1 compression ratio |
| **Recency** | Within last 6 months |
| **Re-use ban** | Cannot use same photo from a prior year's DV entry |

---

### Section 3: Mailing Address & Contact

#### Field 3.8: Mailing Address
| Property | Value |
|----------|-------|
| **Field Label** | `8. Mailing Address` |
| **Sub-fields** | a. In Care Of (optional), b. Address Line 1, c. Address Line 2, d. City/Town, e. District/County/Province/State, f. Postal Code/Zip Code, g. Country |
| **Data Type** | Text (free text), Country is a dropdown |
| **Required** | Address Line 1, City, Country required; others optional |
| **Character limits** | Not explicitly documented, but typically ~100 chars per line |
| **Note** | This is the address that would be used to contact if selected |

#### Field 3.9: Country Where You Live Today
| Property | Value |
|----------|-------|
| **Field Label** | `9. Country Where You Live Today` |
| **Data Type** | Dropdown |
| **Required** | Yes |

#### Field 3.10: Phone Number
| Property | Value |
|----------|-------|
| **Field Label** | `10. Phone Number` |
| **Data Type** | Text (numeric + possibly +, -, spaces) |
| **Required** | **Optional** |
| **Format** | Typically country code + number |

#### Field 3.11: Email Address
| Property | Value |
|----------|-------|
| **Field Label** | `11. Email Address` |
| **Data Type** | Email format (text@domain.com) |
| **Required** | Yes |
| **Critical** | Must be an address the entrant has direct access to AND will continue to have access to through May of the following year |
| **Note** | DoS will NEVER send selection notification by email. Email is used for confirmation number recovery and follow-up communication if selected |

---

### Section 4: Education

#### Field 4.12: Highest Level of Education
| Property | Value |
|----------|-------|
| **Field Label** | `12. What is the highest level of education you have achieved, as of today?` |
| **Data Type** | Dropdown (selection from 10 levels) |
| **Required** | Yes |
| **Options (exact, 1-10):** |
| 1 | Primary school only |
| 2 | Some high school, no diploma |
| 3 | High school diploma |
| 4 | Vocational school |
| 5 | Some university courses |
| 6 | University degree |
| 7 | Some graduate-level courses |
| 8 | Master's degree |
| 9 | Some doctoral-level courses |
| 10 | Doctorate |
| **Minimum requirement** | Option 3 (High school diploma) or higher to be eligible via education |
| **Note** | Only formal 12-year course of study qualifies; GED and equivalency certificates do NOT qualify |

---

### Section 5: Work Experience (Not a direct form field - but eligibility criterion)

Work experience is NOT directly entered on the DS-5501 form. The education field determines the path:

- If education ≥ "High school diploma" (option 3): No work experience needed
- If education < "High school diploma": Entrant must qualify via work experience but there is no work experience field on the form itself. The entrant is supposed to know they're ineligible and not apply.

**Qualifying work experience (checked at interview, not on form):**
- 2 years of experience within the past 5 years
- In an occupation classified as Job Zone 4 or 5 on O*Net
- SVP (Specific Vocational Preparation) rating of 7.0 or higher
- Checked at: `https://www.onetonline.org/`

---

### Section 6: Current Marital Status & Spouse Information

#### Field 6.13: Current Marital Status
| Property | Value |
|----------|-------|
| **Field Label** | `13. What is your current marital status?` |
| **Data Type** | Radio buttons (6 options) |
| **Options** | |
| | Unmarried |
| | Married and my spouse is NOT a U.S. citizen or U.S. LPR |
| | Married and my spouse IS a U.S. citizen or U.S. LPR |
| | Divorced |
| | Widowed |
| | Legally separated |
| **Required** | Yes |
| **Conditional logic** | If "Married and my spouse IS a U.S. citizen or LPR" → no spouse details prompted |
| | If "Unmarried", "Divorced", "Widowed", "Legally separated" → no spouse details |
| | If "Married and spouse NOT a U.S. citizen/LPR" → must enter spouse data |

#### Spouse Information (Part Two - Derivatives, shown when applicable)
| Property | Value |
|----------|-------|
| **Field Label** | `13. Spouse Name` |
| **Sub-fields** | a. Last/Family Name, b. First Name, c. Middle Name |
| **Field Label** | `13d. Birth Date` |
| **Sub-fields** | Month, Day, Year |
| **Field Label** | `13e. Gender` |
| **Options** | Male / Female |
| **Field Label** | `13f. City Where Spouse Was Born` |
| **Data Type** | Text |
| **Field Label** | `13g. Country Where Spouse Was Born` |
| **Data Type** | Dropdown |
| **Field Label** | `13h. Spouse Photograph` |
| **Data Type** | File upload (same photo specs as entrant) |
| **Required** | All fields required (if spouse is NOT a U.S. citizen/LPR) |
| **Note** | Must include spouse even if legally separated (but not divorced); do NOT include if legally divorced or spouse is U.S. citizen/LPR |

---

### Section 7: Children Information

#### Field 7.14: Number of Children
| Property | Value |
|----------|-------|
| **Field Label** | `14. Number of Children` |
| **Data Type** | Numeric input |
| **Required** | Yes (even if 0) |
| **Definition** | All living, unmarried children under 21 years of age on the date of entry |
| **Must include** | Natural children, legally adopted children, stepchildren (even if divorced from parent), spouse's children |
| **Do NOT include** | Children who are U.S. citizens or LPRs; children over 21; married children |
| **Note** | Must list all eligible children even if they don't live with entrant or won't immigrate |

#### Each Child's Information
| Property | Value |
|----------|-------|
| **Field Labels** | a. Last/Family Name, b. First Name, c. Middle Name |
| | d. Birth Date (Month, Day, Year) |
| | e. Gender |
| | f. City Where Child Was Born |
| | g. Country Where Child Was Born |
| | h. Child Photograph (same specs as entrant) |
| **Data Types** | Same as spouse fields |
| **Required** | All fields |
| **Photo required** | Individual photo for each child (same technical specs) |

---

### Section 8: Review & Submit (estimated from sample form)

After completing Parts One and Two, the system presents a **Review page**:
- All entered information displayed for verification
- Photo thumbnails shown
- Buttons: "Edit" / "Submit"
- Confirmation/legal warning about accuracy of information

### Section 9: Confirmation Page

After successful submission:
- **Entrant's full name** displayed
- **Unique Confirmation Number** (16-character alphanumeric)
- **Year of Birth** displayed
- **Digital Signature**
- **Instruction to PRINT or SAVE** this page
- **Warning** that DoS will not send notifications
- **Link to Entrant Status Check URL**

---

## C. Photo Requirements (Detailed)

### Digital Image Specifications (for upload)

| Specification | Requirement |
|---------------|------------|
| **File Format** | JPEG (.jpg) ONLY |
| **Pixel Dimensions** | **600 x 600 pixels** (minimum) to **1200 x 1200 pixels** (maximum) |
| **Aspect Ratio** | **Square** (height MUST equal width) - 1:1 |
| **File Size** | **≤ 240 KB** (kilobytes) |
| **Color Depth** | 24-bit color, sRGB color space |
| **Compression Ratio** | ≤ 20:1 |
| **Recency** | Taken within the **last 6 months** |
| **Prior use** | Cannot be the same photo from a prior year's DV entry |
| **Manipulation** | **No digital alterations** - no filters, AI enhancements, beauty mode, background replacement, or any modification that changes facial characteristics |

### Photo Content/Composition Requirements

| Requirement | Specification |
|-------------|--------------|
| **Background** | **Plain white or off-white** - no patterns, textures, gradients, shadows. Must be uniform. |
| **Head Position** | Full-face view, directly facing camera |
| **Head Size** | **50% to 69%** of the total image height (from chin bottom to top of hair) |
| | In pixels: **300-414 pixels** (for 600x600 image); **600-828 pixels** (for 1200x1200 image) |
| | In inches: **1 inch to 1 3/8 inches** (22mm to 35mm) |
| **Eye Position** | Eyes must be between **56% and 69%** of image height from bottom edge |
| | In pixels: **336-414 pixels** from bottom (for 600x600) |
| **Expression** | **Neutral** - mouth closed, both eyes open, natural appearance |
| **Glasses** | **NOT permitted** (exception: medical statement for recent ocular surgery) |
| **Headwear** | **NOT permitted** unless worn daily for religious reasons (full face must be visible from chin to forehead, no shadows on face) |
| **Uniforms** | NOT permitted (except daily religious clothing) |
| **Clothing** | Everyday clothing; avoid white that blends into background; no camouflage/military |
| **Other people/objects** | No other people or objects visible in photo |
| **Selfies** | Not recommended - someone else should take the photo |
| **Headphones/earbuds** | Must be removed |

### Scanning an Existing Photo

| Requirement | Specification |
|-------------|--------------|
| **Print size** | 2 x 2 inches (51 x 51 mm) |
| **Scan resolution** | 300 pixels per inch (12 pixels per millimeter) |
| **Plus all digital specs above** | Must also meet JPEG, ≤240KB, 600x600px, etc. |

### Official Photo Tool
URL: `https://tsg.phototool.state.gov/photo`
- Free tool from DoS
- Crops to 600x600 pixels
- Does NOT validate quality/compliance
- For cropping only

### Baby/Infant Photos
- Lay baby on back on plain white/off-white sheet
- No other people or objects (including hands/pacifier toys)

### Common Rejection Reasons
1. File > 240 KB
2. Not square / wrong dimensions
3. Not JPEG format
4. Head too small (< 50%) or too large (> 69%)
5. Background not plain white/off-white (shadows, patterns, wrong color)
6. Eyes not fully visible or not both open
7. Glasses worn
8. Non-neutral expression (smiling with teeth, frowning)
9. Photo older than 6 months
10. Photo used in a prior year's DV entry
11. Digital alterations/AI enhancement detected
12. Shadows on face or background
13. Head coverings obscuring face
14. Selfie (camera angle not straight-on)

---

## D. Confirmation Number Format

| Property | Value |
|----------|-------|
| **Length** | **16 characters** (alphanumeric) |
| **Structure** | `YYYYXXXXXXXXXXXX` where `YYYY` = program year |
| **Example** | `20261O0DZWY3DOV9` |
| **Format notes** | Mix of numbers and letters. Characters that look similar: `0` (zero) vs `O` (letter), `1` (one) vs `I` (eye), `6` vs `G`, `8` vs `B` |
| **Uniqueness** | Globally unique per entry |
| **Displayed** | On confirmation page ONLY after successful submission |
| **Not emailed** | The confirmation number is **NOT sent by email**. It appears once on screen. |
| **Storage** | MUST be saved/printed immediately. Screenshot, write down, save to cloud, email to self. |
| **Losing it** | Can attempt recovery via "Forgot Confirmation Number" at `/ESC/CheckConfirmation.aspx` (requires: program year, full name, DOB, email used on entry) |
| **Critical warning** | Without the confirmation number, cannot check selection status |

### Confirmation Number vs. Case Number
- **Confirmation Number**: Given to ALL entrants at submission (16 chars, starts with year)
- **Case Number**: Only given to SELECTEES (winners) - used for DS-260 and interview scheduling
- They are **NOT the same thing**

---

## E. Result Checking (Entrant Status Check)

### When Results Are Available
- Results posted on/around **May 3** each year (for the following year's program)
- Check window: **May 3 through at least September 30** of the program year
- Example: DV-2026 results available from **May 3, 2025 through September 30, 2026**

### Entrant Status Check Page
**URL:** `https://dvprogram.state.gov/ESC/CheckStatus.aspx`

#### Required Information to Check Status
| Field | Detail |
|-------|--------|
| **1. Confirmation Number** | 16-character alphanumeric code from entry submission |
| **2. Last/Family Name** | Exactly as entered on the DS-5501 form |
| **3. Year of Birth** | 4-digit year only (NOT full DOB) |
| **4. Authentication (CAPTCHA)** | Visual CAPTCHA - type characters shown in image |

### Additional Check: "No Last/Family Name" checkbox
- Some entrants may have no last/family name (checkbox available)

### Possible Results
| Result | Meaning | What to Do |
|--------|---------|------------|
| **"Has been selected"** (with entrant's name) | Entry selected for further processing | Follow instructions: complete DS-260, submit documents, prepare for interview |
| **"Has not been selected"** | Not selected this year | May try again next year if still eligible |
| **Error: "Information entered is not valid"** | Confirmation number/last name/DOB mismatch | Double-check characters (0 vs O, 1 vs I, etc.) |

### Result Page Content (if selected)
- **Case Number** (for visa processing)
- Instructions for completing **DS-260** Online Immigrant Visa Application
- Links to fee information
- Instructions for submitting documents to Kentucky Consular Center
- Interview scheduling information

### Critical Warnings
- **DoS will NEVER send email notifications** about selection
- **DoS will NEVER call** to notify selection
- **DoS will NEVER mail letters** about selection
- **ESC is the ONLY official notification method**
- Any third party claiming you won without checking ESC = **SCAM**

### Confirmation Number Recovery Page
**URL:** `https://dvprogram.state.gov/ESC/CheckConfirmation.aspx`

| Field | Detail |
|-------|--------|
| **1. Program Year** | Dropdown (e.g., 2026, or "Other" with text input) |
| **2. Name** | Last/Family Name, First Name, Middle Name, with No-First/No-Middle checkboxes |
| **3. Date of Birth** | Month, Day, Year (full DOB, not just year) |
| **4. Email Address** | The email used on the original entry |
| **5. CAPTCHA** | Visual authentication |

---

## F. Technical Observations

### Website Technology
- **Platform:** ASP.NET Web Forms (`.aspx` pages)
- **System Name:** "Electronic Diversity Visa" - Applicant Entry System v11.00+ / Entrant Status Check v5.10
- **Session:** ASP.NET session management with URL-based session IDs (e.g., `(S(5sk5jrmoqkqn51doounn5mef))`)
- **HTTPS:** Yes, enforced
- **Host:** Department of State intranet (OpenNet), accessible publicly via `dvprogram.state.gov`
- **CAPTCHA:** Visual text-based CAPTCHA on all submission/status check pages

### Session/Timeout Behavior
| Activity | Timeout |
|----------|---------|
| Entry form completion | **60 minutes** from form load |
| Idle during entry | Not specified, but 60 min total for the session |
| ESC session | Standard ASP.NET session (typically 20 min inactivity) |

### CAPTCHA Details
- **Type:** Standard visual text CAPTCHA
- **Character set:** Alphanumeric (distorted)
- **Refresh:** "Refresh" button to get new CAPTCHA image
- **Location:** Present on both CheckStatus.aspx and CheckConfirmation.aspx
- **Likely provider:** Not specified (likely custom or standard DoS CAPTCHA implementation)

### Browser Requirements
- Updated browser required
- **Internet Explorer 8 specifically mentioned as incompatible**
- JavaScript enabled (required for form validation and submission)
- Cookies enabled (for session management)

### Security Measures
- **Defense-in-depth** security architecture
- NIST 800-53 controls and privacy overlays
- Firewalls, auditing, continuous monitoring
- Access control lists on servers
- Configuration auditing and vulnerability scanning tools
- Only authorized DoS personnel can access backend data
- System of Records Notice: STATE-39 (Visa Records)

### Anti-Fraud Measures
- Advanced technology to detect **multiple entries** from same person
- Duplicate entry detection across all submitted forms
- Photo comparison technology (detects same photo from prior years)
- Digital alteration detection for photos
- IP tracking and pattern analysis

### API Calls (observed)
- The site does NOT expose public REST APIs
- All interactions are form-based (POST/GET with ASP.NET Web Forms)
- Photo upload is a file upload within the form POST
- No public API endpoints for programmatic access

### Known Issues
- **ESC technical problems** have occurred historically (May 1, 2014 - wrong status displayed for some entrants)
- **Cuba/UK status errors** occurred in DV-2026 (incorrect selection status shown)
- High traffic volume on result day causes slow response and timeouts
- Users advised not to use browser Forward/Back buttons within ESC - must use site-provided navigation

### Rate Limiting
- Not explicitly documented, but implied by "high volume may cause slow response"
- Likely session-based rate limiting on ESC

---

## G. Yemen-Specific Notes

| Item | Detail |
|------|--------|
| **Eligibility** | **Yemen is ELIGIBLE** for the DV program (listed under ASIA region) |
| **DV-2026 Yemen statistics** | 2,449 selectees (including derivatives) from 20,822,624 total entries |
| **Region** | ASIA |
| **Language** | Form must be completed in English |
| **Photo challenges** | Yemeni clients should be advised about proper lighting (white/off-white background can be challenging in some settings) |
| **Email access** | Must have reliable email access through May of following year |
| **Address format** | Yemeni addresses should be entered in Latin characters per form requirements |
| **Document preparation** | Passports required for DV-2027+ (passport must be valid, unexpired) |

---

## H. Reference URLs Summary

| Resource | URL |
|----------|-----|
| DV Program Main Page | `https://travel.state.gov/content/travel/en/us-visas/immigrate/diversity-visa-program-entry.html` |
| E-DV Website | `https://dvprogram.state.gov/` |
| Entrant Status Check | `https://dvprogram.state.gov/ESC/CheckStatus.aspx` |
| Forgot Confirmation # | `https://dvprogram.state.gov/ESC/CheckConfirmation.aspx` |
| DV Instructions | `https://travel.state.gov/content/travel/en/us-visas/immigrate/diversity-visa-program-entry/diversity-visa-instructions.html` |
| Photo Requirements | `https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/photos.html` |
| Digital Image Specs | `https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/photos/digital-image-requirements.html` |
| Photo Examples | `https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/photos/photo-examples.html` |
| Photo Composition Template | `https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/photos/photo-composition-template.html` |
| Official Photo Tool | `https://tsg.phototool.state.gov/photo` |
| O*Net Occupation Database | `https://www.onetonline.org/` |
| DV Statistics | `https://travel.state.gov/content/travel/en/us-visas/immigrate/diversity-visa-program-entry/diversity-visa-program-statistics.html` |
| KCC Email | `kccdv@state.gov` |
| DV-2026 Instructions PDF | `https://travel.state.gov/content/dam/visas/Diversity-Visa/DV-Instructions-Translations/DV-2026-Instructions-Translations/DV%202026%20Plain%20Language%20Instructions%20and%20FAQs.pdf` |

---

*End of Analysis Document*
