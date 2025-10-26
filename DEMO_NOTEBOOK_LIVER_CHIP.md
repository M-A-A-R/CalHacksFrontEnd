# 🧪 Research Notebook Entry: Protein Interactions in Liver‑on‑Chip

**Project:** Acetaminophen Impact on Hepatic Protein Networks
**Researcher:** Dr. Sarah Kim
**Lab:** Hepatic Microphysiology Unit
**Date:** October 26, 2025
**Study ID:** LCH‑APAP‑1026‑SK
**Hypothesis:** Therapeutic acetaminophen (0.5 mM) reinforces protective protein interactions; toxic dose (5 mM) disrupts CYP2E1↔GST coupling and depletes glutathione, leading to damage.

---

## 1) Overview & Experimental Design

**Liver‑on‑Chip model:** Primary human hepatocytes + NPCs in dual‑channel microfluidic chips (collagen‑I ECM).
**Flow:** 10 µL/min (perfusion, gravity‑balanced).
**Treatment window:** 24 h (Day 8→Day 9).

**Groups & Replicates (n = 3 chips per group):**

| Group   | Dose (APAP) | Chip IDs               | Notes                  |
| ------- | ----------- | ---------------------- | ---------------------- |
| Control | 0 mM        | LCH‑01, LCH‑02, LCH‑03 | Vehicle (0.1% DMSO)    |
| Normal  | 0.5 mM      | LCH‑04, LCH‑05, LCH‑06 | Therapeutic range      |
| High    | 5.0 mM      | LCH‑07, LCH‑08, LCH‑09 | Supratherapeutic/toxic |

**Primary readouts:**

* Protein abundance: CYP2E1, GST (ELISA / immunoblot densitometry)
* Functional interaction: CYP2E1↔GST proximity/complexing (PLA / co‑IP index)
* Enzyme activity: CYP2E1 (p‑nitrophenol hydroxylation), GST (CDNB assay)
* Cellular state: Reduced glutathione (GSH), protein damage (carbonyls), viability (Calcein‑AM / LDH)

---

## 2) Materials & Reagents (lot‑tracked)

* **Acetaminophen (APAP)**, ≥99%, lot AP25‑1102 (stock 1 M in DMSO)
* **Primary hepatocytes** donor HEP‑A712, lot PH‑712‑25
* **Non‑parenchymal mix** (LSECs+Kupffer) lot NPC‑LHK‑09
* **Chips**: Microhepatic v3.2, lot MHC‑3225
* **Assay kits**:

  * CYP2E1 Activity Kit (pNP substrate), lot CYP2E1‑P07
  * GST Activity Kit (CDNB), lot GST‑CDNB‑31
  * GSH‑Glo™ Detection, lot GSH‑GL‑18
  * Protein Carbonyl ELISA, lot PC‑EL‑55
  * Duolink® PLA Red, lot PLA‑R‑210
  * LDH Cytotoxicity Assay, lot LDH‑C‑77

---

## 3) Protocol (timestamped)

**D1–D7: Chip Preparation & Culture**

* Seeded 1.2×10^6 cells/chip (80% hepatocytes, 20% NPCs).
* Media: Williams’ E + supplements; media change q24h.
* QC (D7): Albumin secretion ≥ 25 µg/mL/day (all chips passed: 26–34 µg/mL).

**D8: Treatment Start (09:00)**

* Prepared APAP work solutions in perfusate (final DMSO 0.1% in all groups).
* Connected reservoirs; verified flow (10 µL/min) and bubble‑free channels.

**D9: Sampling (09:15–11:30)**

* Effluent collection (last 4 h pooled).
* Chip lysis for protein/activity assays.
* PLA performed on‑chip (fix 4% PFA, block, probe, ligation, amplification).

**Deviations:** None.
**Environmental log:** 37 °C, 5% CO₂; ΔT < 0.2 °C throughout.

---

## 4) Sample Registry

| Chip ID | Group   | Effluent Tube | Lysate Tube | Imaging Slide |
| ------- | ------- | ------------- | ----------- | ------------- |
| LCH‑01  | Control | E‑01          | L‑01        | S‑01          |
| LCH‑02  | Control | E‑02          | L‑02        | S‑02          |
| LCH‑03  | Control | E‑03          | L‑03        | S‑03          |
| LCH‑04  | Normal  | E‑04          | L‑04        | S‑04          |
| LCH‑05  | Normal  | E‑05          | L‑05        | S‑05          |
| LCH‑06  | Normal  | E‑06          | L‑06        | S‑06          |
| LCH‑07  | High    | E‑07          | L‑07        | S‑07          |
| LCH‑08  | High    | E‑08          | L‑08        | S‑08          |
| LCH‑09  | High    | E‑09          | L‑09        | S‑09          |

---

## 5) Raw Measurements (mock data)

**5a) Protein abundance (immunoblot densitometry)**
*(Units: arbitrary densitometry units; normalized later to Control mean = 100%)*

| Chip   |   Group | CYP2E1 (a.u.) | GST (a.u.) | Loading (β‑actin a.u.) |
| ------ | ------: | ------------: | ---------: | ---------------------: |
| LCH‑01 | Control |          0.92 |       1.01 |                   1.00 |
| LCH‑02 | Control |          1.05 |       0.97 |                   1.03 |
| LCH‑03 | Control |          1.00 |       1.02 |                   0.98 |
| LCH‑04 |  Normal |          1.34 |       1.46 |                   1.02 |
| LCH‑05 |  Normal |          1.41 |       1.51 |                   1.01 |
| LCH‑06 |  Normal |          1.38 |       1.42 |                   0.99 |
| LCH‑07 |    High |          0.66 |       0.47 |                   0.97 |
| LCH‑08 |    High |          0.61 |       0.44 |                   1.01 |
| LCH‑09 |    High |          0.69 |       0.46 |                   1.00 |

**5b) Enzyme activity**
CYP2E1: p‑nitrocatechol formation; **nmol/min/mg**.
GST: CDNB conjugation; **µmol/min/mg**.

| Chip   |   Group | CYP2E1 (nmol/min/mg) | GST (µmol/min/mg) |
| ------ | ------: | -------------------: | ----------------: |
| LCH‑01 | Control |                 2.01 |              0.72 |
| LCH‑02 | Control |                 2.10 |              0.69 |
| LCH‑03 | Control |                 1.96 |              0.71 |
| LCH‑04 |  Normal |                 2.80 |              1.03 |
| LCH‑05 |  Normal |                 2.92 |              1.05 |
| LCH‑06 |  Normal |                 2.84 |              1.00 |
| LCH‑07 |    High |                 1.30 |              0.33 |
| LCH‑08 |    High |                 1.25 |              0.31 |
| LCH‑09 |    High |                 1.36 |              0.34 |

**5c) Cellular state**

| Chip   |   Group | GSH (nmol/mg) | Protein Carbonyls (nmol/mg) | LDH Release (% of max) |
| ------ | ------: | ------------: | --------------------------: | ---------------------: |
| LCH‑01 | Control |           9.8 |                        0.42 |                    5.1 |
| LCH‑02 | Control |          10.1 |                        0.40 |                    4.7 |
| LCH‑03 | Control |           9.5 |                        0.45 |                    5.3 |
| LCH‑04 |  Normal |           8.9 |                        0.52 |                    7.1 |
| LCH‑05 |  Normal |           9.0 |                        0.50 |                    7.6 |
| LCH‑06 |  Normal |           9.2 |                        0.49 |                    6.9 |
| LCH‑07 |    High |           1.6 |                        2.10 |                   36.5 |
| LCH‑08 |    High |           1.4 |                        2.25 |                   39.2 |
| LCH‑09 |    High |           1.5 |                        2.05 |                   35.4 |

**5d) PLA (CYP2E1↔GST proximity index)**
*(Puncta per cell; mean of 10 fields, ~200 cells/field)*

| Chip   |   Group | PLA Puncta/Cell |
| ------ | ------: | --------------: |
| LCH‑01 | Control |            1.00 |
| LCH‑02 | Control |            0.96 |
| LCH‑03 | Control |            1.04 |
| LCH‑04 |  Normal |            1.50 |
| LCH‑05 |  Normal |            1.57 |
| LCH‑06 |  Normal |            1.49 |
| LCH‑07 |    High |            0.18 |
| LCH‑08 |    High |            0.20 |
| LCH‑09 |    High |            0.17 |

**5e) Viability (Calcein‑AM positive, % of total nuclei)**

| Chip   |   Group | % Alive |
| ------ | ------: | ------: |
| LCH‑01 | Control |    95.8 |
| LCH‑02 | Control |    94.9 |
| LCH‑03 | Control |    95.2 |
| LCH‑04 |  Normal |    92.4 |
| LCH‑05 |  Normal |    91.7 |
| LCH‑06 |  Normal |    92.0 |
| LCH‑07 |    High |    60.9 |
| LCH‑08 |    High |    58.7 |
| LCH‑09 |    High |    61.4 |

---

## 6) Calculations & Normalization

**Method:** Normalize each chip to the Control group mean for that assay, then report group means ± SD as % of Control.

**Example (CYP2E1 protein densitometry):**

* Control mean = mean(0.92, 1.05, 1.00) = **0.99** → set = **100%**
* Normal chip LCH‑04 = 1.34 / 0.99 × 100 = **135.4%**
* High chip LCH‑07 = 0.66 / 0.99 × 100 = **66.7%**

**6a) Summary (Means ± SD, % of Control)**

| Readout                   | Control  | Normal (0.5 mM) | High (5 mM)  |
| ------------------------- | -------- | --------------- | ------------ |
| **CYP2E1 Protein**        | 100 ± 6  | **140 ± 4**     | **65 ± 3**   |
| **GST Protein**           | 100 ± 3  | **145 ± 5**     | **45 ± 2**   |
| **CYP2E1 Activity**       | 100 ± 4  | **140 ± 3**     | **65 ± 3**   |
| **GST Activity**          | 100 ± 4  | **145 ± 3**     | **45 ± 4**   |
| **GSH (Protection)**      | 100 ± 5  | **90 ± 3**      | **15 ± 2**   |
| **Protein Damage**        | 0–5      | **~5**          | **~80**      |
| **PLA Interaction Index** | 100 ± 3  | **150 ± 4**     | **18 ± 2**   |
| **Viability**             | 95 ± 0.4 | **92 ± 0.3**    | **60 ± 1.2** |


**6b) Total Protein Network Score (composite, scaled to 100 at Control)**
Formula: mean(z‑scores of {CYP2E1, GST abundance & activity, PLA}) − z(Protein Damage).

* Control: 100
* Normal: **~145**
* High: **~25**

---

## 7) Results & Interpretation (concise)

1. **Therapeutic adaptation:** 0.5 mM APAP increased both CYP2E1 and GST abundance/activity (≈+40–45%) and **strengthened CYP2E1↔GST proximity (~+50%)** with only mild GSH dip (−10%) and minimal damage.
2. **Toxic collapse:** 5 mM APAP **reduced enzymes** (CYP2E1 ~65%, GST ~45%), **collapsed interaction** (to ~18% of normal), **depleted GSH (~15%)**, and elevated carbonyl damage (~80%), with viability ~60%.
3. **Early failure marker:** The **CYP2E1↔GST interaction** index fell sharply before/with GSH exhaustion—useful **early predictor** of hepatotoxic shift.

---

## 8) Representative Images (placeholders)

* **PLA puncta**: Control (sparse red puncta), Normal (dense puncta), High (rare puncta).
* **Calcein‑AM**: Control/Normal (uniform green), High (patchy; necrotic foci).



---

## 9) QA/QC Checks

* Housekeeping normalization (β‑actin) within ±5% across lanes 
* Flow rate verified at start/end (10.0 ± 0.2 µL/min) 
* DMSO matched (0.1%) across all groups 
* No visible channel occlusion; bubble log: none 

---

## 10) Notes & Troubleshooting

* **Observation:** Normal dose shows adaptive upregulation of GST, likely Nrf2‑mediated.
* **Watch‑outs:** At 5 mM, rapid GSH collapse precedes spike in carbonyls; shorten sampling interval (e.g., 4 h, 8 h) in future runs to resolve sequence of failure.

---

## 11) Next Steps

* Time‑course (0, 4, 8, 24 h) for **GSH** and **PLA**.
* Add **NAC co‑treatment** (5 mM APAP ± 5 mM NAC) to test rescue of interaction and viability.
* Expand protein panel: **NQO1, HO‑1** (Nrf2 targets), **JNK phosphorylation** (stress signaling).


