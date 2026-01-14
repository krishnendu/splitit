# SplitIt - Serverless Splitwise Clone

A complete serverless expense splitting application built with React, TypeScript, and Google Sheets API. No backend required - all data is stored in your own Google Sheet.

🌐 **Live Demo**: [View on GitHub Pages](https://krishnendu.github.io/splitit)  
📱 **PWA Ready**: Install as an app on your phone or desktop!

## ✨ Features

- ✅ Google OAuth 2.0 Authentication
- ✅ Group Management
- ✅ Expense Tracking with Equal Split
- ✅ Balance Calculation & Debt Simplification
- ✅ Settlement Tracking
- ✅ In-App Notifications
- ✅ Category-based Expense Organization
- ✅ Reporting & Analytics (Charts, CSV Export)
- ✅ Backup & Restore System
- ✅ Offline Support (PWA)
- ✅ Installable on Mobile & Desktop

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Google Cloud Console account
- Google Sheet (create a new one)

### Installation

```bash
# Clone the repository
git clone https://github.com/krishnendu/splitit.git
cd splitit

# Install dependencies
npm install

# Start development server
npm run dev
```

### Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google Sheets API
4. Enable Google Sign-In API
5. Create OAuth 2.0 credentials
6. Create API Key for Sheets API

See the detailed walkthrough in [`GOOGLE_CLOUD_SETUP.md`](/Users/krish/my_projects/splitit/GOOGLE_CLOUD_SETUP.md).

### Configuration

1. Get your Google Sheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit
   ```

2. Complete the onboarding flow:
   - Sign in with Google
   - Enter your Sheet ID
   - Enter your API Key
   - Enter your OAuth Client ID
   - Initialize the sheet

## 📱 Progressive Web App (PWA)

SplitIt is a fully functional PWA that can be installed on:
- **Desktop**: Chrome, Edge, Safari
- **Mobile**: iOS Safari, Android Chrome

### Installation:
1. Visit the app in your browser
2. Look for the install prompt or use browser menu
3. Click "Install" to add to home screen/apps

### PWA Features:
- ✅ Offline support
- ✅ Fast loading with service worker caching
- ✅ Native app-like experience
- ✅ Installable on all platforms

## 🚀 Deployment

### Deploy to GitHub Pages

**Automated (Recommended):**
1. Push code to GitHub
2. Go to Settings → Pages
3. Select "GitHub Actions" as source
4. App will auto-deploy on every push

**Manual:**
```bash
npm run deploy
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 📁 Project Structure

```
src/
├── components/     # React components
├── contexts/        # React contexts for state management
├── services/       # Business logic and API services
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── constants/      # App constants and configuration
```

## 💻 Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Build for GitHub Pages
npm run build:gh-pages

# Preview production build
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

## 📖 Usage

1. **Create Groups**: Add groups for different expense categories
2. **Add Expenses**: Record expenses with equal split among group members
3. **View Balances**: See who owes whom with simplified debt calculations
4. **Settle Up**: Record settlements to update balances
5. **Backup**: Regularly backup your data using the backup feature

## 🔄 Backup & Restore

- **Manual Backup**: Click "Backup Now" in Settings
- **Auto-Backup**: Configure automatic backups (daily/weekly/monthly)
- **Restore**: Upload a backup file to restore your data
- **Merge Mode**: Merge backup data with existing data
- **Replace Mode**: Replace all data with backup

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite + TypeScript
- **Storage**: Google Sheets API
- **Auth**: Google OAuth 2.0
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **PWA**: Vite PWA Plugin

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

Made with ❤️ using React, TypeScript, and Google Sheets API
