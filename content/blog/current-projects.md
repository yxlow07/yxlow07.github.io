---
lastMod: "2026-09-28T00:00:00+01:00"
title: "Projects List"
date: 2025-05-16T12:00:00+08:00
draft: false
description: "A comprehensive list of engineering projects, machine learning systems, and research platforms I've developed."
image: "todo.png"
author: "Yu Xuan Low"
authorImage: "profile.png"
math: false
tags: ["projects", "machine-learning", "software-engineering", "healthtech"]
---

### Projects Highlights & Completed Systems

#### 1. Embrace Study (NDA)
*August 2026*

**Description**  
Built secure participant-tracking infrastructure for a 200+ person prospective study on maternal-infant postpartum psychological adjustment. Architected the entire platform using **Next.js**, **ShadCN**, and **Supabase**, ensuring robust role-based access control, interpretable longitudinal insights, and strict medical-grade data protection.

*(Source code and live deployment restricted under non-disclosure agreement).*

---

#### 2. Diabetic Retinopathy Screening (Champion @ NAIC 2026)
*June 2026*

**Description**  
Developed a computer vision diagnostic pipeline for clinical retinal image analysis to detect diabetic retinopathy. 
- **Preprocessing Pipeline:** Implemented Contrast Limited Adaptive Histogram Equalization (CLAHE), Graham's Method for local color normalization, and Feature Adaptive Cropping to isolate retinal regions and eliminate lighting variations using OpenCV and NumPy.
- **Model Architecture:** Trained an ensemble architecture combining **ResNet-34**, **EfficientNetB4**, and a **Random Forest** meta-classifier, reaching **91% accuracy** on limited, highly unbalanced clinical datasets.

**Source code:** [Diabetic Retinopathy Screening GitHub](https://github.com/yxlow07/NAIC2026)

---

#### 3. Byte of Kuih (1st Runner Up @ NAIC 2025)
*July 2025*

**Description**  
Curated, augmented, and cleaned a proprietary dataset of over `16,000` images representing 8 traditional Malaysian kuih classes under diverse lighting, orientations, and backgrounds. Fine-tuned an **EfficientNetV2** model using PyTorch and Hugging Face Transformers, reaching **98% validation accuracy** and **100% test accuracy**.

**Read the full breakdown:** [National AI Competition 2025 Post](/blog/naic/)  
**Model repository:** [NAIC Model 2025 GitHub](https://github.com/yxlow07/naic-model-2025)

---

#### 4. JotMe (Best Beginner Project @ LingHacks VI)
*June 2025*

**Description**  
A mental-health digital journaling web application powered by NLP. Integrates **KeyBERT** for keyword extraction with fine-tuned emotion-detection transformer models, combined with a **NetworkX** graph-based contextual sentiment analysis algorithm to detect sarcasm and nuanced expressions, generating real-time crisis-intervention alerts and interactive ChartJS mood trends.

**Read the hackathon story:** [LingHacks VI Blog Post](/blog/linghacks-vi/)  
**Source code:** [JotMe GitHub](https://github.com/yxlow07/jotme/)

---

#### 5. Generative User Interface for Differential Evaluation via Symptom Analysis and Record Keeping (GUIDE-SHARK)
*March 2025*

**Description**  
Designed to relieve hospital and emergency room overcrowding by giving patients a preliminary symptom screening before triage. Features a clean cross-platform **Flutter** frontend, coupled with a **Django REST** backend and PyTorch machine learning models to analyze multi-modal patient symptoms and suggest preliminary differential diagnoses.

**Frontend Repository:** [GUIDE-SHARK Frontend](https://github.com/yxlow07/guide-shark-frontend)

**Video Showcase:**  
{{< embed src="guide-shark-reel.html" >}}

---

### Additional / Earlier Projects
- **Artificial Intelligence with Reprompting & Code Execution:** Iterative code generation and evaluation inspired by AlphaEvolve. [GitHub](https://github.com/yxlow07/code-reprompter)
- **Maker Kehadiran:** Custom MVC web application in PHP & MySQL for attendance tracking. [GitHub](https://github.com/yxlow07/maker-kehadiran/)
- **Study Scroll:** Educational revision tool leveraging doom-scrolling micro-habits for A Level students. [GitHub](https://github.com/yxlow07/study-scroll)