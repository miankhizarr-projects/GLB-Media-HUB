<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://i.ibb.co/FqLs6s3q/Annotation-2025-10-26-054943.png" />
</div>

## 🌟 Overview

**Global Media Hub** is a premium entertainment discovery platform. Leveraging the powerful **TMDB API**, it brings together content from every corner of the globe—specializing in Pakistani, Indian, Korean, Turkish, and Western media. Whether you're looking for the latest Anime, a trending K-Drama, or a Hollywood blockbuster, Global Media Hub is your ultimate destination.

## ✨ Features

- 🌍 **Global Coverage**: Dedicated sections for Pakistani Dramas, Indian Cinema, Korean Dramas, Turkish Series, and Anime.
- 🔍 **Universal Search**: Intelligent multi-search functionality to find movies, TV shows, and people instantly.
- ❤️ **Favorites System**: Save your must-watch titles to a personalized favorites list (powered by LocalStorage).
- 🎬 **Rich Media Details**: Deep-dive into synopses, cast information, user ratings, and similar recommendations.
- 🎞️ **Integrated Trailers**: High-quality YouTube trailer integration via a custom modal player.
- 📱 **Mobile First**: Fully responsive design that looks stunning on desktops, tablets, and smartphones.
- 🎨 **Modern UI**: Dark-themed aesthetic with smooth transitions and high-performance image loading.


## 🛠️ Built With

| Category | Technology |
| :--- | :--- |
| **Frontend** | [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/) |
| **Routing** | [React Router 7](https://reactrouter.com/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **Icons** | Heroicons (SVG) |
| **Data Source** | [TMDB API](https://www.themoviedb.org/documentation/api) |
| **State Management** | React Context API (for Favorites) |

## Run Locally

**Prerequisites:**  Node.js

## 1.  **Clone the repository**  
    ```bash
    git clone https://github.com/your-username/global-media-hub.git
    cd global-media-hub
    ```  
## 2.  **Open the project in command prompt**  
1. Install dependencies:
   `npm install`
2. Set the `TMBD_API_KEY` in [.env](.env)
3. Run the app:
   `npm run dev`  
## 🌐 Deployment  
**Deploy to Vercel**  
https://vercel.com/button  
**Deploy to Netlify**  
https://www.netlify.com/img/deploy/button.svg  

## 📁 Project Structure

```text
├── components/          # Reusable UI components (Cards, Header, Footer)
├── context/             # Global state (FavoritesContext)
├── hooks/               # Custom React hooks (useDebounce)
├── pages/               # Main route views (Home, Details, Search)
├── services/            # API interaction logic (tmdbService)
├── types.ts             # TypeScript interfaces for API data
├── constants.ts         # API keys and configuration
├── App.tsx              # Main application router and layout
└── index.tsx            # Entry point
```

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

## 🙌 Credits

- Data provided by [The Movie Database (TMDB)](https://www.themoviedb.org/).
- UI Inspiration from modern streaming platforms.
- Built with ❤️ by **Mian Khizar**.

---

<div align="center">

**[⬆ Back to top](#-global-media-hub)**

</div>
