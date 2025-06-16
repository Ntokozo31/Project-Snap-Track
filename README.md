# SnapTrack

SnapTrack is a static web application that allows users to view their current location on a Mapbox map, get directions, save locations, and share their position. The project is built with HTML, CSS, and JavaScript, and is designed for easy deployment on static hosts like Vercel.

---

## Features

- View your current location on a Mapbox map
- Locate yourself with a single click
- Switch between street and satellite map views
- Share your location or copy it to clipboard
- Save locations to your browser’s local storage
- Get directions to your current location via Google Maps
- Responsive design for mobile and desktop

---

## Project Structure

```
/
├── index.html         # Main landing page (no map)
├── map.html           # Dedicated map page
├── styles.css         # Main stylesheet
├── script.js          # Main JS for index.html (if needed)
├── map.js             # JS for map.html (handles map and location)
├── config.js          # Contains your public Mapbox token
├── .gitignore         # Ignore sensitive files (e.g., .env)
└── README.md          # Project documentation
```

---

## Setup & Usage

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/snaptrack.git
   cd snaptrack
   ```

2. **Add your Mapbox public token:**
   - Create a file named `config.js` in the project root:
     ```js
     // config.js
     const TOKEN = "YOUR_PUBLIC_MAPBOX_TOKEN_HERE";
     ```
   - **Note:** Do not use a secret or unrestricted token. Restrict your token in your Mapbox dashboard.

3. **Run locally:**
   - You can open `index.html` or `map.html` directly in your browser, or use a simple static server:
     ```sh
     npx serve .
     ```
   - Or use the "Live Server" extension in VS Code.

4. **Deploy:**
   - Push your code (including `config.js` with your public token) to GitHub.
   - Connect your repo to [Vercel](https://vercel.com/) or any static host.
   - Your site will be live!

---

## Security Notes

- **Do not put secrets in `config.js`!**  
  Only use a public Mapbox token and restrict it in your Mapbox dashboard.
- `.env` files are not used in this static setup.

---

## Credits

- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/)
- [Font Awesome](https://fontawesome.com/)
- [Google Fonts - Inter](https://fonts.google.com/specimen/Inter)

---

## License

MIT License