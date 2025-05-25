# RoomieMatch - AI-Powered Roommate Finder

A modern, responsive web application that helps users find compatible roommates in New York City and Jersey City through AI-powered matching based on location preferences and lifestyle compatibility.

![RoomieMatch Preview](https://img.shields.io/badge/React-18.2.0-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## 🚀 Features

### Landing Page
- **City Selection**: Currently supports New York City
- **Multi-Select Neighborhoods**: Choose up to 5 neighborhoods across different boroughs
- **Interactive UI**: Smooth animations and hover effects
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Registration Page
- **Location Preferences**: Review and update selected neighborhoods
- **Personal Information**: Age, occupation, ethnicity, languages spoken
- **Lifestyle Preferences**: Smoking, drinking, pets, children, and other habits
- **AI Matching**: Intelligent pairing based on compatibility factors

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: CSS3 with Tailwind-inspired utility classes
- **State Management**: React Hooks (useState, useEffect)
- **Build Tool**: Create React App
- **Type Safety**: TypeScript for enhanced development experience

## 📁 Project Structure

```
roommate-finder/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── BackgroundShapes.tsx    # Animated background elements
│   │   ├── Header.tsx              # App header with title
│   │   ├── SearchSection.tsx       # Location search interface
│   │   ├── FeatureCard.tsx         # Individual feature card
│   │   ├── Features.tsx            # Feature cards grid
│   │   └── RegistrationPage.tsx    # User registration form
│   ├── data/
│   │   └── locationData.ts         # NYC neighborhoods data
│   ├── styles/
│   │   ├── globals.css             # Global styles and animations
│   │   ├── App.css                 # Main app styles
│   │   └── RegistrationPage.css    # Registration page styles
│   ├── types/
│   │   └── index.ts                # TypeScript type definitions
│   ├── App.tsx                     # Main app component
│   └── index.tsx                   # App entry point
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/roommate-finder.git
cd roommate-finder
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm start
# or
yarn start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🔧 Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## 📦 Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-scripts": "5.0.1",
  "typescript": "^5.0.0"
}
```

## 🎨 Customization

### Adding New Neighborhoods

Edit `src/data/locationData.ts` to add new neighborhoods:

```typescript
export const neighborhoods: AreaData = {
  manhattan: [
    { value: 'new-neighborhood', label: 'New Neighborhood' },
    // ... existing neighborhoods
  ],
  // ... other boroughs
};
```

### Modifying Form Fields

Update `src/components/RegistrationPage.tsx` to add or modify registration fields.

### Styling

- Global styles: `src/styles/globals.css`
- Component-specific styles: `src/styles/App.css`
- Registration page styles: `src/styles/RegistrationPage.css`

## 🌟 Key Features Implementation

### Location Selection System
- Multi-select checkboxes for neighborhoods
- Maximum 5 locations enforced
- Visual feedback for selected locations
- Expandable/collapsible borough sections

### Form Validation
- Required fields marked with asterisks
- Disabled submit button until required fields are complete
- Visual feedback for user interactions

### Responsive Design
- Mobile-first approach
- Flexible grid layouts
- Touch-friendly interface elements

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

### Deploy to GitHub Pages

1. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

2. Add to package.json:
```json
"homepage": "https://yourusername.github.io/roommate-finder",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}
```

3. Deploy:
```bash
npm run deploy
```

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔮 Future Enhancements

- [ ] Backend API integration
- [ ] Real-time chat functionality
- [ ] User authentication
- [ ] Profile photo uploads
- [ ] Advanced matching algorithm
- [ ] Email notifications
- [ ] Saved searches
- [ ] Map integration
- [ ] Mobile app version

## 👥 Authors

- Your Name - [GitHub Profile](https://github.com/yourusername)

## 🙏 Acknowledgments

- React team for the amazing framework
- TypeScript for type safety
- All contributors and testers

---

Made with ❤️ for finding the perfect roommate in NYC