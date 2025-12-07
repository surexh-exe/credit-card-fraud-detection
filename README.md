# Credit Card Fraud Detection

A comprehensive capstone project that combines machine learning and web development to detect fraudulent credit card transactions and assess credit risk. Built with modern tools and deployed with easy setup.

---

## 🎯 Project Overview

This project provides an end-to-end solution for:
- **Fraud Detection** - Identify suspicious transactions in real-time
- **Credit Risk Assessment** - Evaluate creditworthiness of applicants
- **Data Analysis** - Explore patterns in credit card transactions
- **Interactive Dashboard** - Visualize fraud detection results and analytics

Designed for learning, production use, or as a capstone project reference.

---

## 📦 What's Included

### 1. **Capstone Notebook**
Jupyter-based data science project with:
- Exploratory Data Analysis (EDA) on Kaggle's Home Credit dataset
- Feature engineering and selection
- Multiple ML models (XGBoost, CatBoost, LightGBM, Neural Networks)
- Model training, evaluation, and comparison
- Fraud pattern identification and insights

### 2. **Fraud Detection Website**
Interactive Next.js web dashboard with:
- Real-time fraud detection scoring
- Credit risk assessment module
- Interactive charts and visualizations
- Kaggle dataset explorer
- User-friendly admin panel

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.8+** - [Download](https://www.python.org/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/)

### Option 1: Run the Notebook

```bash
# Navigate to notebook folder
cd capstone-notebook

# Create environment (Conda recommended)
conda env create -f environment.yml
conda activate capstone-fraud-detection

# Launch Jupyter
jupyter lab
```

Then open `fraudDetection.ipynb` and run all cells.

**Or with pip:**
```bash
python -m venv venv
source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
jupyter lab
```

### Option 2: Run the Website

```bash
# Navigate to website folder
cd fraud-detection-website

# Install dependencies
npm install

# Start development server
npm run dev
```

Open browser and go to **http://localhost:3000**

---

## 🏗️ Project Structure

```
credit-card-fraud-detection/
├── capstone-notebook/
│   ├── fraudDetection.ipynb              # Main analysis notebook
│   ├── requirements.txt                  # Python dependencies
│   ├── environment.yml                   # Conda environment
│   ├── home-credit-default-risk/         # Kaggle dataset
│   ├── models_stack_v2/                  # Trained models
│   └── Graphs/                           # Visualizations
│
├── fraud-detection-website/
│   ├── app/
│   │   ├── page.tsx                      # Home page
│   │   ├── dashboard/                    # Dashboard pages
│   │   ├── api/                          # API routes
│   │   └── globals.css
│   ├── components/                       # React components
│   ├── lib/                              # Utilities
│   ├── package.json
│   ├── tsconfig.json
│   └── next.config.mjs
│
├── SETUP.md                              # Detailed setup guide
└── README.md
```

---

## 💻 Tech Stack

| Component | Technologies |
|-----------|--------------|
| **Data Science** | Python, Jupyter, Pandas, NumPy, Scikit-learn |
| **ML Models** | XGBoost, CatBoost, LightGBM, TensorFlow |
| **Frontend** | Next.js, React 18, TypeScript, Tailwind CSS |
| **Visualization** | Recharts, Matplotlib, Seaborn, Plotly |
| **Database** | In-memory (can extend with PostgreSQL) |

---

## ✨ Key Features

**Notebook:**
- 📊 Complete EDA with 50+ visualizations
- 🔍 Feature engineering and selection
- 🤖 Multiple models with hyperparameter tuning
- 📈 Model performance comparison
- 💾 Pre-trained model files included

**Website:**
- 🎯 Real-time fraud detection scoring
- 💳 Credit risk calculation
- 📊 Interactive dashboards
- 🔍 Transaction analysis tools
- ⚙️ Admin dashboard
- 📥 Data upload and processing

---

## 📊 Dataset

Uses [Home Credit Default Risk](https://www.kaggle.com/c/home-credit-default-risk) dataset from Kaggle:
- 300,000+ loan applications
- 120+ features
- Credit card transactions, installments, bureau data
- Ready-to-use in the notebook

---

## 🛠️ Installation Details

### Full Setup (Both Components)

```bash
# Clone the repository
git clone https://github.com/surexh-exe/credit-card-fraud-detection.git
cd credit-card-fraud-detection

# Setup Notebook
cd capstone-notebook
conda env create -f environment.yml
conda activate capstone-fraud-detection
jupyter lab

# In another terminal, setup Website
cd fraud-detection-website
npm install
npm run dev
```

### Commands Reference

```bash
# Notebook
conda activate capstone-fraud-detection
jupyter lab                    # Launch Jupyter
conda deactivate              # Exit environment

# Website
npm install                    # Install dependencies (once)
npm run dev                    # Start dev server
npm run build                  # Build for production
npm start                      # Run production build
npm run type-check            # Check TypeScript
npm run lint                  # Run ESLint
```

---

## 🚀 Deployment

### Website Deployment

**Recommended: Vercel** (Free tier available)
```bash
# Sign up at vercel.com with your GitHub account
# Import this repository
# Vercel auto-detects Next.js and deploys automatically
```

**Other options:**
- AWS Amplify
- Netlify
- Railway
- Docker + your server

### Notebook

Can be deployed as:
- Kaggle Notebook
- Google Colab
- GitHub Pages (with nbconvert)
- Binder (interactive online)

---

## 📖 Detailed Guide

See [SETUP.md](./SETUP.md) for:
- Step-by-step installation
- Troubleshooting common issues
- Advanced configurations
- Dataset setup details

---

## 📄 License

MIT License - Feel free to use this project for learning, research, or production.

See LICENSE file for details.

---

## 🤝 How to Use This Project

1. **For Learning**: Follow the notebook to understand fraud detection ML workflows
2. **For Portfolio**: Use as a capstone project example
3. **For Production**: Extend the website with your own models and data
4. **For Teaching**: Share as educational material for ML/web dev classes

---

## 🎓 What You'll Learn

- How to build ML pipelines for fraud detection
- Feature engineering and selection techniques
- Model training and hyperparameter optimization
- Building interactive dashboards with React
- Full-stack development with Next.js
- API development for ML models

---

## 📞 Questions or Issues?

- Review [SETUP.md](./SETUP.md) for common problems
- Check the notebook for implementation details
- Open an issue on GitHub for bugs

---

## 🙌 Credits

- **Dataset**: Kaggle Home Credit Default Risk
- **Libraries**: Python, React, Next.js communities
- **Inspiration**: Real-world fraud detection systems

---

**Made with ❤️ | December 2025 | Version 1.0.0**
