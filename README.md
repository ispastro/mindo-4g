<div align="center">

# 🧠 Mindo

### Never Lose Your Things Again

**A voice-first memory assistant powered by AI**

[![Next.js](https://img.shields.io/badge/Next.js-15.1.11-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Enabled-5A0FC8?style=for-the-badge&logo=pwa)](https://web.dev/progressive-web-apps/)

[Live Demo](https://mindo.vercel.app) • [Report Bug](https://github.com/ispastro/mindo-4g/issues) • [Request Feature](https://github.com/ispastro/mindo-4g/issues)

</div>

---

## 🎯 Overview

Mindo is a **production-ready, voice-first Progressive Web App** that helps you remember where you put things. Simply speak naturally—"I put my keys on the kitchen counter"—and Mindo remembers. Later, ask "where are my keys?" and get instant answers.

Built with modern web technologies and designed for both mobile and desktop, Mindo combines the power of **AI-driven semantic search** with a **minimalist, accessible interface** that feels native on any device.

---

## ✨ Key Features

### 🎤 **Voice-First Interface**
- **Natural Speech Recognition**: Powered by Web Speech API
- **Text-to-Speech Feedback**: Hear your item locations read aloud
- **95%+ Mobile Coverage**: Works on Android Chrome & iOS Safari 14.5+
- **Fallback Typing Mode**: Manual input when voice isn't available

### 🤖 **Intelligent Search**
- **AI Semantic Search**: Understands natural language queries
  - "where did I put my car opener" → finds "keys"
  - "I need something to pay with" → finds "wallet"
- **Auto-Detection**: Switches between keyword and AI search automatically
- **Debounced Input**: 500ms delay prevents excessive API calls
- **Real-time Results**: Live search with loading indicators

### 📱 **Progressive Web App**
- **Install to Home Screen**: Native app experience
- **Offline Support**: Service worker caching with Workbox
- **Fast Loading**: Code splitting & optimized bundles
- **Push Notifications Ready**: Infrastructure in place for future updates

### 🎨 **Premium Design System**
- **Pure Black Monochrome**: Timeless aesthetic, OLED-friendly
- **Lexend Deca Typography**: 5 weights (300-700) for accessibility
- **Animated Gradient Orbs**: Subtle floating background effects
- **Responsive Layout**: Mobile-first, desktop-optimized
- **Dark/Light Mode**: System preference detection

### 🔐 **Enterprise-Grade Security**
- **JWT Authentication**: Stateless, scalable token-based auth
- **HTTPS Everywhere**: End-to-end encryption
- **Auto-Logout on 401**: Secure session management
- **Input Validation**: XSS & SQL injection protection

### ⚡ **Performance Optimizations**
- **Optimistic Updates**: Instant UI feedback before server response
- **SWR Caching**: Smart data fetching with revalidation
- **Server-Side Rendering**: Pre-rendered pages for SEO
- **CDN Distribution**: Vercel Edge Network (100+ locations)
- **Image Optimization**: WebP format, lazy loading

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SYSTEM ARCHITECTURE                       │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   BROWSER    │◄───────►│   VERCEL     │◄───────►│   RENDER     │
│  (Client)    │  HTTPS  │  (Frontend)  │  HTTPS  │  (Backend)   │
└──────────────┘         └──────────────┘         └──────────────┘
      │                         │                         │
   ┌──▼──┐                 ┌───▼────┐              ┌────▼─────┐
   │Local│                 │Next.js │              │ FastAPI  │
   │Store│                 │React   │              │ Python   │
   │Cache│                 │PWA     │              │ Database │
   └─────┘                 └────────┘              └──────────┘
```

### **Tech Stack**

#### Frontend
- **Framework**: Next.js 15.1.11 (App Router)
- **UI Library**: React 19.2
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 4.1 + tw-animate-css
- **State Management**: SWR 2.3 (data fetching & caching)
- **UI Components**: Radix UI (accessible primitives)
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Typography**: Lexend Deca (Google Fonts)

#### Backend (API)
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL
- **Authentication**: JWT tokens
- **AI Search**: Semantic search with embeddings
- **Hosting**: Render.com

#### Infrastructure
- **Frontend Hosting**: Vercel (Edge Network)
- **Backend Hosting**: Render
- **Version Control**: GitHub
- **CI/CD**: Vercel auto-deploy on push
- **Analytics**: Vercel Analytics

---

## 🚀 Getting Started

### Prerequisites

```bash
Node.js 18+ (LTS recommended)
pnpm 10.28.1+
Git
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/ispastro/mindo-4g.git
cd mindo-4g
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**
```bash
# Create .env.local file
echo "NEXT_PUBLIC_API_URL=https://mindo-backend-1.onrender.com/api" > .env.local
```

4. **Run development server**
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
# Create optimized production build
pnpm build

# Start production server
pnpm start
```

### PWA Testing

PWA features are disabled in development. To test:

```bash
pnpm build && pnpm start
```

Then visit `http://localhost:3000` and check for install prompt.

---

## 📁 Project Structure

```
mindo-4g/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes group
│   │   ├── login/page.tsx        # Login page
│   │   └── signup/page.tsx       # Signup page
│   ├── app/page.tsx              # Main app (protected)
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
│
├── components/                   # React components
│   ├── ui/                       # Base UI components (Radix)
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── voice-button.tsx          # Voice input component
│   ├── items-list.tsx            # Items display with CRUD
│   ├── search-bar.tsx            # Debounced search input
│   ├── edit-item-dialog.tsx      # Edit modal
│   ├── delete-item-dialog.tsx    # Delete confirmation
│   ├── theme-toggle.tsx          # Dark/light mode switch
│   └── install-prompt.tsx        # PWA install banner
│
├── hooks/                        # Custom React hooks
│   ├── use-items.ts              # Items CRUD + caching
│   ├── use-auth.ts               # Authentication state
│   └── use-voice-support.ts      # Voice API detection
│
├── lib/                          # Core utilities
│   ├── api-client.ts             # HTTP client (fetch wrapper)
│   ├── types.ts                  # TypeScript definitions
│   └── utils.ts                  # Helper functions
│
├── public/                       # Static assets
│   ├── manifest.json             # PWA manifest
│   ├── sw.js                     # Service worker (generated)
│   └── images/                   # Image assets
│
├── next.config.mjs               # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies
```

---

## 🎨 Design Philosophy

### **Minimalism Meets Functionality**

Mindo's design is inspired by Apple's Human Interface Guidelines and Google's Material Design, but with a unique twist:

- **Pure Black Monochrome**: No colors, just black and white. Timeless, elegant, OLED-friendly.
- **Lexend Deca Typography**: Designed for accessibility and readability.
- **Subtle Animations**: Floating gradient orbs, slide-up button text, smooth transitions.
- **Touch-First**: 44px minimum tap targets, swipe gestures, mobile-optimized.

### **Color System**

```css
/* Light Mode */
Background: #ffffff (Pure White)
Text: #1a1a1a (Near Black)
Accent: #262626 (Charcoal)

/* Dark Mode */
Background: #000000 (True Black - OLED)
Text: #fafafa (Soft White)
Accent: #e5e5e5 (Light Gray)
```

---

## 🔌 API Integration

### **Endpoints**

```typescript
// Authentication
POST   /api/auth/signup          // Create account
POST   /api/auth/login           // Get JWT token
GET    /api/auth/me              // Get current user

// Items CRUD
POST   /api/items                // Create item
GET    /api/items                // List items (paginated)
GET    /api/items/search/ai      // AI semantic search
GET    /api/items/{id}           // Get single item
PATCH  /api/items/{id}           // Update item
DELETE /api/items/{id}           // Delete item
```

### **Example Usage**

```typescript
import { apiClient } from '@/lib/api-client'

// Create item
const response = await apiClient.createItem({
  name: 'keys',
  location: 'kitchen counter'
})

// AI search
const results = await apiClient.searchItemsAI(
  'where did I put my car opener'
)
```

---

## 🧪 Testing

### **Manual Testing Checklist**

- [ ] Voice input works on mobile (Android Chrome, iOS Safari)
- [ ] Search debouncing (500ms delay)
- [ ] AI search activates for 3+ word queries
- [ ] Edit dialog saves changes
- [ ] Delete confirmation prevents accidents
- [ ] Offline mode caches data
- [ ] PWA installs to home screen
- [ ] Dark/light mode switches correctly
- [ ] Pagination works (5 items per page)
- [ ] Authentication redirects on 401

### **Browser Support**

| Browser | Version | Voice | PWA | Status |
|---------|---------|-------|-----|--------|
| Chrome | 90+ | ✅ | ✅ | Full Support |
| Safari | 14.5+ | ✅ | ✅ | Full Support |
| Firefox | 88+ | ❌ | ✅ | No Voice |
| Edge | 90+ | ✅ | ✅ | Full Support |

---

## 🚢 Deployment

### **Vercel (Recommended)**

1. **Push to GitHub**
```bash
git push origin main
```

2. **Import to Vercel**
- Go to [vercel.com](https://vercel.com)
- Click "Import Project"
- Select your GitHub repo
- Add environment variable: `NEXT_PUBLIC_API_URL`
- Deploy!

### **Environment Variables**

```bash
# Production
NEXT_PUBLIC_API_URL=https://mindo-backend-1.onrender.com/api

# Development
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

## 🔒 Security

### **Best Practices Implemented**

✅ **JWT Authentication**: Tokens expire after 24 hours  
✅ **HTTPS Only**: All traffic encrypted  
✅ **CORS Protection**: Backend whitelist  
✅ **Input Validation**: Zod schemas + backend validation  
✅ **XSS Prevention**: React auto-escaping + CSP headers  
✅ **SQL Injection**: Parameterized queries (FastAPI)  
✅ **Rate Limiting**: Backend throttling  
✅ **Secure Headers**: Next.js security headers  

### **Security Patches**

- **CVE-2025-66478**: Patched in Next.js 15.1.11
- **CVE-2025-55184**: Patched in Next.js 15.1.11
- **CVE-2025-55183**: Patched in Next.js 15.1.11
- **CVE-2025-67779**: Patched in Next.js 15.1.11

---

## 📊 Performance Metrics

### **Lighthouse Scores** (Target)

- **Performance**: 95+
- **Accessibility**: 100
- **Best Practices**: 100
- **SEO**: 100
- **PWA**: ✅ Installable

### **Core Web Vitals**

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### **Bundle Size**

```
First Load JS: ~120 KB
Route (app): ~85 KB
Shared chunks: ~35 KB
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'feat: add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### **Commit Convention**

```
feat: new feature
fix: bug fix
docs: documentation
style: formatting
refactor: code restructuring
test: adding tests
chore: maintenance
```

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Haile Asaye**

- GitHub: [@ispastro](https://github.com/ispastro)
- LinkedIn: [haile-asaye21](https://www.linkedin.com/in/haile-asaye21/)
- Portfolio: [Coming Soon]

---

## 🙏 Acknowledgments

- **Next.js Team** - Amazing framework
- **Vercel** - Seamless deployment
- **Radix UI** - Accessible components
- **Tailwind Labs** - Beautiful styling
- **FastAPI Community** - Powerful backend
- **Open Source Community** - Inspiration & tools

---

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [PWA Guide](https://web.dev/progressive-web-apps/)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

---

## 🐛 Known Issues

- Voice input not supported in Firefox (browser limitation)
- iOS Safari requires user gesture for speech synthesis
- Service worker cache may need manual clear after major updates

---

## 🗺️ Roadmap

- [ ] **v1.1**: Categories & tags for items
- [ ] **v1.2**: Image attachments (photo of item location)
- [ ] **v1.3**: Shared lists (family/roommates)
- [ ] **v1.4**: Location-based reminders (geofencing)
- [ ] **v1.5**: Export/import data (JSON, CSV)
- [ ] **v2.0**: Native mobile apps (React Native)

---

<div align="center">

**Made with ❤️ by Haile**

⭐ Star this repo if you find it helpful!

[Report Bug](https://github.com/ispastro/mindo-4g/issues) • [Request Feature](https://github.com/ispastro/mindo-4g/issues) • [Documentation](https://github.com/ispastro/mindo-4g/wiki)

</div>
