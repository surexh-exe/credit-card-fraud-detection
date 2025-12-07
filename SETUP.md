# Setup Guide

Simple setup instructions for both components of the Capstone Project.

## What's Included?

This project has **2 parts**:
1. **Capstone Notebook** - Data analysis with Jupyter
2. **Fraud Detection Website** - Web dashboard with Next.js

---

## Prerequisites

Before you start, install:
- **Python 3.8+** - [Download](https://www.python.org/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/)

Check your versions:
```bash
python --version
node --version
git --version
```

---

## Part 1: Capstone Notebook

### 1. Navigate to the notebook folder
```bash
cd capstone-notebook
```

### 2. Create a Python environment

**Using Conda (Recommended):**
```bash
conda env create -f environment.yml
conda activate capstone-fraud-detection
```

**Using pip (Alternative):**
```bash
python -m venv venv
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate  # Windows

pip install -r requirements.txt
```

### 3. Start Jupyter
```bash
jupyter lab
```

The browser will open automatically. Click on `fraudDetection.ipynb` to open it.

### 4. Run the notebook
- Click **Cell → Run All** to run everything
- Or press **Shift + Enter** to run one cell at a time

### 5. When done, deactivate the environment
```bash
conda deactivate
# or
deactivate
```

---

## Part 2: Fraud Detection Website

### 1. Navigate to the website folder
```bash
cd fraud-detection-website
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the development server
```bash
npm run dev
```

### 4. Open in browser
Go to `http://localhost:3000`

You'll see:
- Dashboard
- Fraud Detection
- Credit Scoring
- Forecasting
- Analytics

### 5. Stop the server
Press `Ctrl+C` in your terminal

---

## Quick Commands Reference

### Notebook Commands
```bash
cd capstone-notebook
conda activate capstone-fraud-detection
jupyter lab
conda deactivate
```

### Website Commands
```bash
cd fraud-detection-website
npm install      # Install dependencies once
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Run production server
```

---

## Troubleshooting

### "Port 3000 is already in use"
```bash
npm run dev -- -p 3001
# Then visit http://localhost:3001
```

### "Python not found"
Make sure Python is installed and accessible:
```bash
python --version
```

### "Node modules are corrupted"
```bash
rm -rf node_modules package-lock.json
npm install
```

### "Jupyter kernel error"
```bash
python -m ipykernel install --user --name capstone-fraud-detection
```

---

## Deployment

**For the Fraud Detection Website:**
- Use **Vercel** (Recommended - free for Next.js)
- AWS Amplify
- Netlify
- Railway

> GitHub Pages does NOT work because the app has backend API routes.

See README.md for more deployment options.

---

## Security

- Never commit `.env.local` files
- Never share API keys
- See `.github/SECURITY.md` for details

---

**Need help?** Check README.md or SECURITY.md
