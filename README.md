# User Story Map Generator

A modern web application for generating user story maps with AI assistance. Built with React, TypeScript, and Vite.

## Features

- 🤖 AI-powered story map generation using DeepSeek and Google Gemini
- 🎨 Professional color-coded user stories and supporting needs
- 🔄 Real-time feedback and story map modification
- 📱 Responsive design with modern UI
- 🚀 Automatic deployment to Vercel
- 📊 Priority-based sorting and filtering
- 🔗 Proper routing with React Router

## Quick Start

### Prerequisites
- Node.js >= 20.19.0
- npm or yarn

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

## Deployment

### Automatic Deployment (Recommended)
Use the deployment script to automatically sync changes to both GitHub and Vercel:

```bash
# Deploy with interactive commit message
./deploy.sh

# Deploy with custom commit message
./deploy.sh "Your commit message here"
```

### Manual Deployment
If you prefer manual control:

```bash
# 1. Commit and push to GitHub
git add .
git commit -m "Your changes"
git push origin main

# 2. Deploy to Vercel
vercel --prod
```

## Project Structure

```
src/
├── components/          # React components
│   ├── HomePage.tsx    # Main input page
│   ├── StoryMapView.tsx # Story map display
│   ├── EnhancedStoryDetail.tsx # Story details modal
│   └── ...
├── services/           # AI and API services
│   ├── aiService.ts   # Main AI service
│   ├── deepseekService.ts # DeepSeek API
│   └── geminiService.ts # Google Gemini API
├── types/             # TypeScript type definitions
└── App.tsx           # Main app component
```

## Configuration

### Environment Variables
Create a `.env` file with your API keys:

```env
VITE_DEEPSEEK_API_KEY=your_deepseek_key
VITE_GEMINI_API_KEY=your_gemini_key
```

### Vercel Configuration
The project includes `vercel.json` for proper deployment configuration.

## Contributing

1. Make your changes
2. Test locally with `npm run dev`
3. Use `./deploy.sh` to deploy changes
4. Both GitHub and Vercel will be updated automatically

## Live Demo

- **Production**: https://user-story-map-prod-f2pb3j24c-freedomztm-7943s-projects.vercel.app
- **GitHub**: https://github.com/frankzhi/user-story-map-generator-prod

## License

MIT License
