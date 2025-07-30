# User Story Map Generator

A modern web application that generates comprehensive user story maps from product descriptions using AI. Built with React, TypeScript, and Tailwind CSS.

## ✨ Features

- **AI-Powered Generation**: Generate user story maps using DeepSeek and Gemini AI
- **Visual Story Mapping**: Interactive visualization of epics, features, and tasks
- **Story Details**: Click on any story to view detailed information
- **YAML Export**: Download story maps in YAML format
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Beautiful, intuitive interface with Tailwind CSS

## 🚀 Live Demo

[Deploy to Vercel](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/user-story-map-generator)

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **AI Integration**: DeepSeek API, Gemini API
- **Deployment**: Vercel

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/user-story-map-generator.git
   cd user-story-map-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your API keys to `.env.local`:
   ```env
   VITE_DEEPSEEK_API_KEY=your_deepseek_api_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔧 Environment Variables

Create a `.env.local` file in the root directory:

```env
# DeepSeek API Configuration
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key_here
VITE_DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions

# Gemini API Configuration
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
```

## 🎯 Usage

1. **Enter Product Description**: Describe your product or feature idea
2. **Choose AI Provider**: Select between DeepSeek or Gemini
3. **Generate Story Map**: Click "Generate Story Map" to create a comprehensive user story map
4. **Explore Stories**: Click on any story card to view detailed information
5. **Export**: Download the story map in YAML format

## 📁 Project Structure

```
user-story-map-generator/
├── src/
│   ├── components/
│   │   ├── HomePage.tsx          # Main landing page
│   │   ├── StoryMapView.tsx      # Story map visualization
│   │   └── StoryDetailModal.tsx  # Story detail modal
│   ├── services/
│   │   ├── aiService.ts          # AI service integration
│   │   ├── deepseekService.ts    # DeepSeek API service
│   │   └── geminiService.ts      # Gemini API service
│   ├── types/
│   │   └── story.ts              # TypeScript type definitions
│   ├── App.tsx                   # Main app component
│   └── index.css                 # Tailwind CSS styles
├── public/                       # Static assets
├── vercel.json                   # Vercel deployment config
└── package.json                  # Dependencies and scripts
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy!

### Deploy to Netlify

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Drag and drop the `dist` folder to Netlify
   - Or connect your GitHub repository

## 🔑 API Keys Setup

### DeepSeek API
1. Visit [DeepSeek Console](https://platform.deepseek.com/)
2. Create an account and get your API key
3. Add to environment variables

### Gemini API
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com/) for the beautiful styling
- [Vite](https://vitejs.dev/) for the fast build tool
- [DeepSeek](https://deepseek.com/) for AI capabilities
- [Google Gemini](https://ai.google.dev/) for AI capabilities
