# 🧬 DEMO NOTEBOOK: Lipase Engineering for Industrial Applications

**Project:** Thermostable Lipase Development  
**Researcher:** Dr. Maria Rodriguez  
**Date:** October 26, 2025  
**Goal:** Engineer Candida antarctica lipase B (CALB) for improved thermostability at 70°C  
**Quick Summary:** Testing N35D/T103W double mutation for industrial biodiesel production

---

## 📝 Research Background

We're engineering **Candida antarctica lipase B (CALB)** to improve its stability at 70°C for biodiesel production applications.

**Hypothesis:** The N35D/T103W double mutation will stabilize the active site lid and improve thermostability while maintaining catalytic activity.

**Why this matters:**
- Industrial biodiesel production requires enzymes stable at 60-80°C
- Wild-type CALB loses 50% activity after 2 hours at 70°C
- Rational design based on structural analysis suggests N35D forms new salt bridge, T103W improves hydrophobic packing

**Engineering Strategy:**
- **N35D mutation:** Asparagine → Aspartic acid at position 35 creates salt bridge with K38
- **T103W mutation:** Threonine → Tryptophan at position 103 improves hydrophobic core packing
- **Combined effect:** Predicted to increase melting temperature (Tm) by 8-12°C

---

## 🧬 CALB Lipase Sequence

**Wild-Type Candida antarctica Lipase B (317 amino acids):**

Length: 317 amino acids  
Molecular Weight: 33.2 kDa  
Mutations: Position 35 (Asn → Asp) and Position 103 (Thr → Trp)

```
ASTVPSRPLAPQQNDPVVAGAPFQSPQNVLLQAADAQNVAAGVPDYVAMPAHLQQQLEQLA
EQFRPGGTIVWGHSMGGLGLASYLTNTVLLGEPYPERGQAAWDQLSTTGATYPWYQPVYTG
GQVCAQNGTYIGAVVPWNTPQFTARWLYDAGLQFTNDASWLAFQGHSFNHDAGSLTTLSGN
AHAPVVQFSVVSAAPTTVLYPDAAPVAFAALAQDQLPGTDAAAALCSEAGLDFVVLNPGHN
VVVGSERIVLGLSPPESWFKPWGQQHQAVTTITQADLNGTLSEEVVAWVDLLRTGSGIGTV
DQYHQALQQFAQTTGQGLQVVTKDQR
```

**Active Site Region (positions 100-110):**
```
...GQVCAQNGTYI...
       ↑
     Thr103 (T→W in mutant)
```

**Salt Bridge Region (positions 30-40):**
```
...APQQNDPVVAGAPFQSPQNVLL...
       ↑        ↑
     Asn35   Lys38
     (N→D)   (salt bridge partner)
```

**Key Residues:**
- **Position 35:** Asn (N) → **Asp (D) in mutant** - Creates new salt bridge with K38
- **Position 103:** Thr (T) → **Trp (W) in mutant** - Improves hydrophobic packing
- **Position 105:** Ser (catalytic residue) - Must remain unchanged
- **Position 144:** Asp (catalytic residue) - Part of catalytic triad
- **Position 157:** His (catalytic residue) - Part of catalytic triad

---

## 🧪 Experimental Protocol

### Materials
- *Pichia pastoris* expression system (GS115 strain)
- pPICZαA expression vector with CALB gene
- Methanol for induction
- p-nitrophenyl butyrate (pNPB) substrate for activity assays
- Olive oil for transesterification assays

### Expression Protocol
1. **Day 1:** Transform *P. pastoris* with wild-type or mutant CALB plasmid
2. **Day 2-4:** Select colonies on YPD + Zeocin (100 μg/mL)
3. **Day 5:** Inoculate 50 mL BMGY medium, grow at 30°C to OD₆₀₀ = 6
4. **Day 6:** Transfer to BMMY medium, induce with 0.5% methanol every 24h
5. **Day 9:** Harvest culture supernatant (lipase is secreted)

### Purification Protocol
1. Filter culture supernatant through 0.45 μm filter
2. Load onto HisTrap HP column (Ni-NTA affinity)
3. Wash with 20 mM imidazole
4. Elute with 250 mM imidazole
5. Dialyze into 50 mM sodium phosphate pH 7.0
6. Concentrate to 5 mg/mL using Amicon Ultra filters

### Activity Assay (pNPB Hydrolysis)
1. Prepare reaction mix: 50 mM phosphate buffer pH 7.0, 1 mM pNPB in acetonitrile
2. Add 10 μL enzyme (0.1 mg/mL) to 990 μL reaction mix
3. Measure absorbance at 410 nm for 5 minutes (p-nitrophenol release)
4. Calculate specific activity: μmol product/min/mg enzyme

### Thermostability Assay
1. Incubate enzyme (1 mg/mL) at test temperature (50°C, 60°C, 70°C, 80°C)
2. Remove aliquots at 0, 30, 60, 120, 180, 240 minutes
3. Cool on ice immediately
4. Measure residual activity using pNPB assay
5. Calculate half-life (t₁/₂) and residual activity percentage

### Melting Temperature (Tm) Measurement
1. Use differential scanning fluorimetry (DSF)
2. Sample: 0.2 mg/mL enzyme + SYPRO Orange dye
3. Ramp from 25°C to 95°C at 1°C/min
4. Monitor fluorescence intensity (excitation 490nm, emission 575nm)
5. Tm = temperature at peak of first derivative

---

## 📊 DATA TABLE 1: Thermostability at 70°C (Time Course)

**Experiment Date:** October 20-22, 2025  
**Method:** Residual activity after incubation at 70°C  
**Design:** 4 biological replicates × 3 technical replicates per variant = n=12 per time point

| Time (min) | WT-Rep1 (%) | WT-Rep2 (%) | WT-Rep3 (%) | WT-Rep4 (%) | WT-Mean (%) | N35D-Rep1 (%) | N35D-Rep2 (%) | N35D-Rep3 (%) | N35D-Rep4 (%) | N35D-Mean (%) | T103W-Rep1 (%) | T103W-Rep2 (%) | T103W-Rep3 (%) | T103W-Rep4 (%) | T103W-Mean (%) | Double-Rep1 (%) | Double-Rep2 (%) | Double-Rep3 (%) | Double-Rep4 (%) | Double-Mean (%) |
|------------|-------------|-------------|-------------|-------------|-------------|---------------|---------------|---------------|---------------|---------------|----------------|----------------|----------------|----------------|----------------|-----------------|-----------------|-----------------|-----------------|-----------------|
| 0          | 100.0       | 100.0       | 100.0       | 100.0       | 100.0       | 100.0         | 100.0         | 100.0         | 100.0         | 100.0         | 100.0          | 100.0          | 100.0          | 100.0          | 100.0          | 100.0           | 100.0           | 100.0           | 100.0           | 100.0           |
| 30         | 82.1        | 80.5        | 81.3        | 82.8        | 81.7        | 89.2          | 90.1          | 88.5          | 89.8          | 89.4          | 85.6           | 86.2           | 84.9           | 86.5           | 85.8           | 92.3            | 93.1            | 91.8            | 92.8            | 92.5            |
| 60         | 68.5        | 66.8        | 67.9        | 69.2        | 68.1        | 81.5          | 82.3          | 80.8          | 81.9          | 81.6          | 75.2           | 76.1           | 74.5           | 76.8           | 75.7           | 86.8            | 87.5            | 86.2            | 87.3            | 86.9            |
| 120        | 48.2        | 46.5        | 47.8        | 49.1        | 47.9        | 68.9          | 69.8          | 68.2          | 69.5          | 69.1          | 60.5           | 61.3           | 59.8           | 61.9           | 60.9           | 77.2            | 78.1            | 76.8            | 77.8            | 77.5            |
| 180        | 32.8        | 31.2        | 32.5        | 33.5        | 32.5        | 58.2          | 59.1          | 57.6          | 58.8          | 58.4          | 48.9           | 49.8           | 48.2           | 50.3           | 49.3           | 69.5            | 70.3            | 69.1            | 70.1            | 69.8            |
| 240        | 22.1        | 20.8        | 21.6        | 22.8        | 21.8        | 49.8          | 50.6          | 49.2          | 50.3          | 50.0          | 39.2           | 40.1           | 38.6           | 40.8           | 39.7           | 63.2            | 64.1            | 62.8            | 63.8            | 63.5            |

**Summary Statistics:**
- **Wild-Type:** t₁/₂ = 115 ± 8 min, 21.8% activity remaining at 240 min
- **N35D Single Mutant:** t₁/₂ = 235 ± 12 min, 50.0% activity remaining at 240 min
- **T103W Single Mutant:** t₁/₂ = 175 ± 10 min, 39.7% activity remaining at 240 min
- **N35D/T103W Double Mutant:** t₁/₂ = 310 ± 15 min, 63.5% activity remaining at 240 min

**Question for AI:** 
- Fit exponential decay curves: A(t) = A₀ × e^(-k×t)
- Calculate decay constants and compare statistically
- Is the double mutant synergistic (better than additive)?
- Run two-way ANOVA to test mutation interaction effects

---

## 📊 DATA TABLE 2: Specific Activity Comparison

**Test Conditions:** 25°C, pH 7.0, 1 mM pNPB substrate, n=9 per variant

| Sample           | Bio Rep | Tech Rep | Specific Activity (U/mg) | kcat (s⁻¹) | Km (mM) | kcat/Km (s⁻¹·mM⁻¹) |
|------------------|---------|----------|--------------------------|------------|---------|---------------------|
| WT-1             | 1       | 1        | 1245                     | 435        | 0.82    | 530                 |
| WT-2             | 1       | 2        | 1268                     | 443        | 0.85    | 521                 |
| WT-3             | 1       | 3        | 1252                     | 438        | 0.83    | 528                 |
| WT-4             | 2       | 1        | 1231                     | 430        | 0.80    | 538                 |
| WT-5             | 2       | 2        | 1259                     | 440        | 0.84    | 524                 |
| WT-6             | 2       | 3        | 1243                     | 434        | 0.82    | 529                 |
| WT-7             | 3       | 1        | 1272                     | 445        | 0.86    | 517                 |
| WT-8             | 3       | 2        | 1255                     | 439        | 0.83    | 529                 |
| WT-9             | 3       | 3        | 1248                     | 436        | 0.82    | 532                 |
| N35D-1           | 1       | 1        | 1189                     | 416        | 0.79    | 527                 |
| N35D-2           | 1       | 2        | 1205                     | 422        | 0.81    | 521                 |
| N35D-3           | 1       | 3        | 1198                     | 419        | 0.80    | 524                 |
| N35D-4           | 2       | 1        | 1182                     | 413        | 0.78    | 530                 |
| N35D-5           | 2       | 2        | 1201                     | 420        | 0.80    | 525                 |
| N35D-6           | 2       | 3        | 1192                     | 417        | 0.79    | 528                 |
| N35D-7           | 3       | 1        | 1208                     | 423        | 0.82    | 516                 |
| N35D-8           | 3       | 2        | 1195                     | 418        | 0.80    | 523                 |
| N35D-9           | 3       | 3        | 1186                     | 415        | 0.78    | 532                 |
| T103W-1          | 1       | 1        | 1312                     | 459        | 0.88    | 522                 |
| T103W-2          | 1       | 2        | 1328                     | 465        | 0.90    | 517                 |
| T103W-3          | 1       | 3        | 1320                     | 462        | 0.89    | 519                 |
| T103W-4          | 2       | 1        | 1305                     | 456        | 0.87    | 524                 |
| T103W-5          | 2       | 2        | 1325                     | 464        | 0.89    | 521                 |
| T103W-6          | 2       | 3        | 1315                     | 460        | 0.88    | 523                 |
| T103W-7          | 3       | 1        | 1332                     | 466        | 0.91    | 512                 |
| T103W-8          | 3       | 2        | 1318                     | 461        | 0.89    | 518                 |
| T103W-9          | 3       | 3        | 1308                     | 457        | 0.87    | 525                 |
| Double-1         | 1       | 1        | 1272                     | 445        | 0.86    | 517                 |
| Double-2         | 1       | 2        | 1289                     | 451        | 0.88    | 512                 |
| Double-3         | 1       | 3        | 1280                     | 448        | 0.87    | 515                 |
| Double-4         | 2       | 1        | 1265                     | 442        | 0.85    | 520                 |
| Double-5         | 2       | 2        | 1285                     | 450        | 0.87    | 517                 |
| Double-6         | 2       | 3        | 1275                     | 446        | 0.86    | 519                 |
| Double-7         | 3       | 1        | 1292                     | 452        | 0.89    | 508                 |
| Double-8         | 3       | 2        | 1278                     | 447        | 0.87    | 514                 |
| Double-9         | 3       | 3        | 1268                     | 443        | 0.85    | 521                 |

**Summary Statistics:**
- **Wild-Type:** 1252 ± 13 U/mg, kcat/Km = 526 ± 6 s⁻¹·mM⁻¹
- **N35D:** 1195 ± 9 U/mg (95.4% of WT), kcat/Km = 525 ± 5 s⁻¹·mM⁻¹
- **T103W:** 1318 ± 9 U/mg (105.3% of WT), kcat/Km = 519 ± 4 s⁻¹·mM⁻¹
- **Double Mutant:** 1278 ± 9 U/mg (102.1% of WT), kcat/Km = 516 ± 4 s⁻¹·mM⁻¹

**Question for AI:** 
- Run one-way ANOVA comparing all four variants
- Calculate effect sizes (Cohen's d)
- Are activity differences statistically significant?
- Is catalytic efficiency (kcat/Km) preserved in mutants?

---

## 📊 DATA TABLE 3: Melting Temperature (Tm) Analysis

**Test Conditions:** Differential scanning fluorimetry, 0.2 mg/mL enzyme, n=6 per variant

| Variant    | Rep | Tm (°C) | ΔTm vs WT (°C) |
|------------|-----|---------|----------------|
| WT         | 1   | 58.2    | 0.0            |
| WT         | 2   | 58.5    | 0.0            |
| WT         | 3   | 58.3    | 0.0            |
| WT         | 4   | 58.1    | 0.0            |
| WT         | 5   | 58.6    | 0.0            |
| WT         | 6   | 58.4    | 0.0            |
| N35D       | 1   | 64.8    | 6.5            |
| N35D       | 2   | 65.2    | 6.9            |
| N35D       | 3   | 64.9    | 6.6            |
| N35D       | 4   | 64.6    | 6.3            |
| N35D       | 5   | 65.1    | 6.8            |
| N35D       | 6   | 64.7    | 6.4            |
| T103W      | 1   | 62.3    | 4.0            |
| T103W      | 2   | 62.6    | 4.3            |
| T103W      | 3   | 62.4    | 4.1            |
| T103W      | 4   | 62.1    | 3.8            |
| T103W      | 5   | 62.7    | 4.4            |
| T103W      | 6   | 62.5    | 4.2            |
| Double     | 1   | 69.2    | 10.9           |
| Double     | 2   | 69.6    | 11.3           |
| Double     | 3   | 69.3    | 11.0           |
| Double     | 4   | 69.0    | 10.7           |
| Double     | 5   | 69.5    | 11.2           |
| Double     | 6   | 69.4    | 11.1           |

**Summary Statistics:**
- **Wild-Type:** Tm = 58.4 ± 0.2°C
- **N35D:** Tm = 64.9 ± 0.2°C, ΔTm = +6.6°C
- **T103W:** Tm = 62.4 ± 0.2°C, ΔTm = +4.1°C
- **Double Mutant:** Tm = 69.3 ± 0.2°C, ΔTm = +10.9°C

**Question for AI:**
- Run t-tests comparing each mutant to wild-type
- Is the double mutant synergistic? (ΔTm_double > ΔTm_N35D + ΔTm_T103W?)
- Calculate 95% confidence intervals for ΔTm values
- Predict industrial viability: Can enzyme survive 8h at 70°C?

---

## 🤔 Initial Observations

**What we see from the data:**
- **Thermostability:** Double mutant retains 63.5% activity after 4h at 70°C (vs 21.8% for WT)
- **Activity:** Catalytic activity is preserved or slightly improved in all mutants
- **Melting Temperature:** Double mutant Tm increased by 10.9°C (synergistic effect!)
- **Synergy:** N35D + T103W combined effect exceeds sum of individual mutations

**Big Question:** 
- Why is the double mutant synergistic instead of just additive?
- How do N35D and T103W mutations stabilize different regions?
- Is the enzyme ready for industrial biodiesel production (8-hour process at 70°C)?

---

## 🎯 What We Want AI To Analyze

### 1. Statistical Analysis
- Run one-way ANOVA for thermostability data (4 variants × 6 time points)
- Calculate decay constants (k) from exponential fits
- Test for synergy: Does N35D/T103W > N35D + T103W?
- Compare Tm values with 95% confidence intervals
- Calculate industrial viability score based on half-life at 70°C

### 2. Kinetics Analysis
- Compare kcat and Km across variants
- Calculate catalytic efficiency ratios
- Assess if mutations affect substrate binding or turnover
- Plot Michaelis-Menten curves with confidence bands

### 3. Mechanistic Insight
- Why does N35D improve stability more than T103W?
- How does the N35-K38 salt bridge stabilize the enzyme?
- How does W103 improve hydrophobic packing?
- Why is the double mutant synergistic?
- Create protein interaction network showing mutation effects

### 4. Structure-Function Relationship
- Map mutations onto 3D structure (PDB: 1TCA)
- Identify which structural elements are stabilized
- Predict additional beneficial mutations
- Cross-reference with lipase engineering literature

### 5. Industrial Application Recommendation
- Calculate enzyme cost reduction (based on improved half-life)
- Predict biodiesel production efficiency improvement
- Recommend next optimization steps (expression level, additional mutations)
- Estimate ROI for industrial implementation

---

## 📈 Expected AI Output

### Part 1: Statistical Summary

**Statistical Analysis:**
- "N35D/T103W double mutant shows 2.9× longer half-life at 70°C (p < 0.0001, Cohen's d = 4.2)"
- "Tm increase is synergistic: observed +10.9°C vs predicted +10.7°C (additive), but interaction effect significant (p = 0.003)"
- "Catalytic efficiency maintained within 98-102% of wild-type across all variants (p = 0.42, not significant)"

### Part 2: Protein Interaction Network

**Residues (Nodes) in the Network:**

| Residue | Role | Effect of Double Mutation | Importance | Color |
|---------|------|---------------------------|------------|-------|
| **Asn35 (→Asp)** | Mutation site 1 | NEW SALT BRIDGE | Highest | 🔴 Red (large) |
| **Lys38** | Salt bridge partner | STRENGTHENED | Very high | 🟢 Green |
| **Thr103 (→Trp)** | Mutation site 2 | IMPROVED PACKING | Highest | 🔴 Red (large) |
| **Ser105** | Catalytic nucleophile | MAINTAINED | High | 🟢 Green |
| **His157** | Catalytic base | MAINTAINED | High | 🟢 Green |
| **Asp144** | Catalytic acid | MAINTAINED | High | 🟢 Green |
| **Phe17** | Lid stability | STRENGTHENED | Medium | 🟢 Green |
| **Leu100** | Hydrophobic core | STRENGTHENED | Medium | 🟢 Green |
| **Val102** | Hydrophobic core | STRENGTHENED | Medium | 🟢 Green |

**Interactions (Edges) in the Network:**

| From | To | Type | Strength (kcal/mol) | Distance (Å) | Effect of Mutations | Color |
|------|-----|------|-------------------|--------------|---------------------|-------|
| Asp35 (N→D) | Lys38 | Salt bridge | -4.2 | 2.8 | **NEW** (was H-bond -1.8) | 🔵 Blue (thick) |
| Trp103 (T→W) | Leu100 | Hydrophobic | -2.8 | 3.9 | **STRENGTHENED** (was -1.2) | ⚫ Gray (thick) |
| Trp103 (T→W) | Val102 | Hydrophobic | -2.5 | 3.6 | **STRENGTHENED** (was -1.0) | ⚫ Gray (thick) |
| Trp103 (T→W) | Phe17 | π-π stacking | -3.1 | 4.2 | **NEW** (was too far) | 🟡 Orange |
| Asp35 | Ser105 | H-bond | -2.1 | 3.4 | **MAINTAINED** | 🔵 Blue |
| Lys38 | Asp144 | Salt bridge | -3.8 | 2.9 | **MAINTAINED** | 🔵 Blue |
| His157 | Ser105 | H-bond | -2.6 | 2.7 | **MAINTAINED** | 🔵 Blue |

**Graph Caption:**

> "Protein interaction network showing how N35D and T103W mutations synergistically stabilize CALB. The N35D mutation (left red node) creates a new salt bridge with K38 (-4.2 kcal/mol), replacing a weaker H-bond (-1.8 kcal/mol). The T103W mutation (right red node) introduces a bulky tryptophan that strengthens hydrophobic packing with L100 and V102, and creates a new π-π stacking interaction with F17 in the active site lid. These two mutations stabilize different regions: N35D anchors the N-terminal helix to the core, while T103W rigidifies the hydrophobic core and lid. The synergistic effect (+10.9°C Tm vs predicted +10.7°C additive) arises because both mutations reduce conformational entropy without interfering with each other. The catalytic triad (S105-D144-H157, green nodes) remains fully intact, explaining why activity is preserved. **Recommendation:** This double mutant is ready for industrial biodiesel production at 70°C with 2.9× longer lifetime than wild-type."

### Part 3: Industrial Recommendation

**Mechanistic Insight:**
- "N35D creates a salt bridge that anchors the N-terminal helix to the catalytic domain, reducing thermal fluctuations"
- "T103W fills a hydrophobic cavity and forms a new π-π stack with F17, rigidifying the active site lid"
- "The two mutations work in different regions, creating synergy without negative epistasis"

**Cost-Benefit Analysis:**
- "2.9× longer half-life → 65% reduction in enzyme cost per kg biodiesel"
- "Predicted production cost savings: $0.42/kg biodiesel (from $1.20 to $0.78/kg enzyme cost)"
- "ROI: $2.1M annual savings for 5,000-ton biodiesel plant"

**Recommendation:**
- "Deploy N35D/T103W variant for industrial trials immediately"
- "Next optimization: Test triple mutant N35D/T103W/Q157E for further Tm increase"
- "Target Tm > 75°C for 80°C process intensification"

---

**End of Demo Notebook**

*This dataset contains statistically robust data (n=9-12 per group, 3 data tables, full protocol) for comprehensive AI analysis of protein engineering outcomes.*

