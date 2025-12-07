# Credit Card Fraud Detection

A capstone project combining data science and web development to build a fraud detection system with interactive dashboard and credit risk analysis.

---

## 📦 What's Inside

**Two main components:**

1. **Capstone Notebook** - ML analysis and fraud detection models
2. **Fraud Detection Website** - Interactive web dashboard

---

## 🚀 Quick Start

### Notebook
```bash
cd capstone-notebook
conda env create -f environment.yml
conda activate capstone-fraud-detection
jupyter lab
```

### Website
```bash
cd fraud-detection-website
npm install
npm run dev
# Open http://localhost:3000
```

**For detailed setup:** See [SETUP.md](./SETUP.md)

---

## 🏗️ Tech Stack

| Component | Technologies |
|-----------|--------------|
| **Notebook** | Python, Jupyter, Pandas, Scikit-learn, XGBoost, TensorFlow |
| **Website** | Next.js, React, TypeScript, Tailwind CSS, Recharts |

---

## 📂 Project Structure

```
├── capstone-notebook/
│   ├── fraudDetection.ipynb
│   ├── requirements.txt
│   ├── environment.yml
│   └── home-credit-default-risk/  # Kaggle dataset
│
├── fraud-detection-website/
│   ├── app/
│   ├── components/
│   ├── package.json
│   └── tsconfig.json
│
├── SETUP.md                 # Installation guide
├── .github/SECURITY.md      # Security policy
└── README.md
```

---

## ✨ Features

- 📊 Real-time fraud detection scoring
- 💳 Credit risk assessment
- 📈 Interactive dashboards & visualizations
- 🤖 Multiple ML models (XGBoost, CatBoost, Neural Networks)
- 🔍 Kaggle dataset explorer
- ⚙️ Admin panel

---

## 🚀 Deploy

**Website:** Use **Vercel** (recommended for Next.js)
- Free tier available
- One-click GitHub integration
- Full API support

> GitHub Pages won't work (app has backend API routes)

---

## 🔐 Security

- No secrets committed to repository
- See [.github/SECURITY.md](.github/SECURITY.md)

---

## 📖 Documentation

- [SETUP.md](./SETUP.md) - Complete installation guide
- [.github/SECURITY.md](.github/SECURITY.md) - Security guidelines

---

## 📊 Dataset

Uses [Home Credit Default Risk](https://www.kaggle.com/c/home-credit-default-risk) from Kaggle

---

**Last Updated:** December 2025 | Version 1.0.0
