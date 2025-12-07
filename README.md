# Capstone Project: Fraud Detection & Credit Risk Analysis

A comprehensive capstone project combining data science and web development to build an intelligent fraud detection system and credit risk analysis platform.

## 📋 Project Overview

This project consists of two main components:

### 1. **Capstone Notebook** 
Data science and machine learning analysis for fraud detection and credit risk prediction using the Home Credit Default Risk dataset from Kaggle.

**Key Features:**
- Exploratory Data Analysis (EDA)
- Feature Engineering
- Multiple ML models (XGBoost, CatBoost, LightGBM, Neural Networks)
- Model evaluation and comparison
- Fraud pattern identification

**Technologies:** Python, Jupyter, Pandas, Scikit-learn, TensorFlow, XGBoost, CatBoost

### 2. **Fraud Detection Website**
A modern web application providing an interactive dashboard for fraud detection and credit scoring analysis.

**Key Features:**
- Real-time fraud detection scoring
- Credit risk assessment module
- Interactive dashboards and visualizations
- Kaggle dataset explorer
- User profile management
- Admin panel

**Technologies:** Next.js, React, TypeScript, Tailwind CSS, Recharts, Radix UI

---

## 🚀 Quick Start

### Prerequisites
- Git
- Python 3.8+ (for Capstone Notebook)
- Node.js 18+ (for Fraud Detection Website)

### For Capstone Notebook
```bash
cd capstone-notebook
conda env create -f environment.yml
conda activate capstone-fraud-detection
jupyter lab
```

### For Fraud Detection Website
```bash
cd fraud-detection-website
npm install
npm run dev
# Visit http://localhost:3000
```

For detailed setup instructions, see [SETUP.md](./SETUP.md)

---

## 📂 Project Structure

```
Capstone-Project/
├── capstone-notebook/              # Data analysis & ML development
│   ├── fraudDetection.ipynb
│   ├── requirements.txt
│   ├── environment.yml
│   ├── home-credit-default-risk/   # Kaggle dataset
│   ├── models_stack_v2/            # Trained models
│   └── Graphs/                     # Visualizations
│
├── fraud-detection-website/        # Next.js web application
│   ├── app/                        # App router
│   ├── components/                 # React components
│   ├── lib/                        # Utilities
│   ├── package.json
│   └── tsconfig.json
│
├── .github/
│   └── SECURITY.md                 # Security guidelines
├── SETUP.md                        # Installation guide
├── README.md                       # This file
└── .gitignore
```

---

## 🔐 Security

- No secrets or API keys are committed to the repository
- See [.github/SECURITY.md](.github/SECURITY.md) for security policies
- Never commit `.env.local` or sensitive configuration files

---

## 📊 Key Datasets

The project uses the [Home Credit Default Risk](https://www.kaggle.com/c/home-credit-default-risk) dataset from Kaggle, which includes:
- Application data (train/test)
- Bureau data
- Credit card balance data
- Installment payment data
- POS cash balance data
- Previous application data

---

## 🛠️ Tech Stack

### Backend & Data Science
- Python 3.8+
- Jupyter Notebook
- Pandas, NumPy, SciPy
- Scikit-learn, XGBoost, CatBoost, LightGBM
- TensorFlow/Keras
- Optuna (Hyperparameter tuning)

### Frontend & Web
- Next.js 15
- React 18
- TypeScript
- Tailwind CSS
- Radix UI (Component Library)
- Recharts (Data Visualization)

### Development Tools
- Git
- Node.js & npm/pnpm
- Conda/venv (Python environments)

---

## 📚 Features

### Capstone Notebook
- [ ] Data exploration and visualization
- [ ] Feature engineering and selection
- [ ] Model training and evaluation
- [ ] Hyperparameter optimization
- [ ] Fraud pattern analysis
- [ ] Model stacking and ensemble

### Fraud Detection Website
- [ ] Dashboard overview
- [ ] Real-time fraud scoring
- [ ] Credit risk assessment
- [ ] Forecasting module
- [ ] Insights and analytics
- [ ] Data upload and analysis
- [ ] User settings and preferences
- [ ] Admin panel

---

## 🚀 Deployment

### Fraud Detection Website
The website can be deployed to:
- **Vercel** (Recommended) - Free tier available
- **Netlify** - With serverless functions
- **AWS Amplify** - Full Next.js support
- **Railway** - Docker container support

> Note: GitHub Pages does NOT support this application due to its API routes and server-side requirements.

---

## 🤝 Contributing

1. Review [.github/SECURITY.md](.github/SECURITY.md) for security guidelines
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add your feature"`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📝 License

This project is part of a capstone curriculum.

---

## 📞 Support

For issues or questions:
1. Check existing GitHub Issues
2. Review [SETUP.md](./SETUP.md) for common troubleshooting
3. Create a new Issue with detailed information

---

## 📈 Project Status

- **Status:** Active Development
- **Last Updated:** December 2025
- **Version:** 1.0.0

---

## 🙏 Acknowledgments

- Kaggle for the Home Credit Default Risk dataset
- Next.js and React communities
- Open-source data science libraries

---

**Happy Coding! 🎉**
