# PhotoWeb - Personal Photography Portfolio

A modern, interactive photography portfolio website showcasing landscape, city, event photography, and a detailed John Muir Trail (JMT) journey with interactive mapping.

## 🌟 Features

- **Interactive Photo Galleries**: Four distinct categories - Landscapes, Cities, Events, and People
- **JMT Trail Experience**: Interactive map with GPX trail data visualization and photo waypoints
- **Responsive Design**: Fully responsive across desktop, tablet, and mobile devices
- **Lightbox View**: Full-screen image viewing with keyboard navigation
- **Contact Form**: Integrated EmailJS for direct communication
- **Smooth Animations**: Premium UI with glassmorphism effects and micro-interactions
- **Crypto Donations**: Support via Ethereum and Bitcoin

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **React Router** - Client-side routing
- **Vite** - Next-generation frontend build tool with HMR

### Styling
- **Vanilla CSS** - Custom CSS with CSS variables for theming
- **Responsive Design** - Mobile-first approach with flexbox and grid layouts
- **Modern Effects** - Glassmorphism, gradients, and smooth transitions

### Mapping & Data
- **Leaflet** - Interactive map library for JMT trail visualization
- **GPX Parser** - Custom GPX file parsing for trail data
- **GeoJSON** - Geographic data formatting

### External Services
- **EmailJS** - Contact form email functionality

### Development Tools
- **ESLint** - Code quality and consistency
- **Python PIL** - Image compression and optimization script

## 📁 Project Structure

```
PhotoWeb/
├── public/
│   ├── JMT.gpx              # GPX trail data
│   ├── JMT_2025.json        # Trail waypoint data
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── Footer.jsx       # Social media links footer
│   │   ├── Gallery.jsx      # Photo gallery component
│   │   ├── Hero.jsx         # Homepage hero section
│   │   ├── Lightbox.jsx     # Full-screen image viewer
│   │   ├── Navbar.jsx       # Navigation header with burger menu
│   │   └── SplashScreen.jsx # Loading animation
│   ├── pages/
│   │   ├── About.jsx        # About page with bio and donations
│   │   ├── CategoryPage.jsx # Photo category pages
│   │   ├── Home.jsx         # Homepage
│   │   └── JMTPage.jsx      # JMT trail page with map
│   ├── styles/              # Component-specific CSS files
│   ├── utils/
│   │   ├── geojsonParser.js # GeoJSON parsing utilities
│   │   ├── gpxParser.js     # GPX file parser
│   │   ├── images.js        # Image data and metadata
│   │   └── jmtData.js       # JMT trail configuration
│   ├── App.jsx              # Main app component with routing
│   ├── main.jsx             # React entry point
│   └── index.css            # Global styles and CSS variables
├── image_compressor.py      # Image optimization script
└── package.json

```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/danilmezor/PhotoWeb.git
cd PhotoWeb
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The optimized build will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## 📧 Contact Form Setup

To enable the contact form, configure your EmailJS credentials:
1. Sign up at [EmailJS](https://www.emailjs.com/)
2. Update the EmailJS service ID, template ID, and public key in `src/pages/About.jsx`

## 🖼️ Image Optimization

Use the included Python script to compress images:

```bash
python image_compressor.py
```

This script uses PIL to optimize images while maintaining quality.

## 📱 Responsive Features

- **Desktop**: Full gallery grid, side-by-side layouts
- **Tablet**: Adapted grid layouts, touch-friendly navigation
- **Mobile**: Burger menu, stacked layouts, optimized image loading

## 🎨 Design Highlights

- Modern dark theme with vibrant accent colors
- Glassmorphism effects on navigation and overlays
- Smooth page transitions and hover animations
- Custom scrollbar styling
- Micro-interactions for enhanced UX

## 📄 License

This project is open source and available for personal and educational use.

## 👤 Author

**Danil Mezor**
- GitHub: [@danilmezor](https://github.com/danilmezor)
- LinkedIn: [Danil Mezor](https://linkedin.com/in/danilmezor)
- Instagram: [@danil.mezor](https://instagram.com/danil.mezor)

---

Built with ❤️ using React and Vite
