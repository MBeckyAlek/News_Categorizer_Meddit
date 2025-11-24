# Meddit - African News Categirizer 🌍

A Reddit-inspired news platform dedicated exclusively to African news. Clean interface, smart filtering, and dark mode support.

## Demo Video
[Demo video URL](your-youtube-link-here)

## Deployment URL
```
1. alekdev.tech
2. www.alekdev.tech
3. lb-01.alekdev.tech
```

## Features

### Core Features
- **7 News Categories** - General, Business, Entertainment, Health, Science, Sports, Technology
- **Smart Search** - Find African news with automatic context filtering
- **Dark Mode** - Toggle between light and dark themes
- **Sort Options** - Sort by newest, most relevant, or most popular
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Smart Caching** - 5-minute cache for faster loading
- **African-Only Filtering** - Multi-layer filtering ensures only African content

### Modern UI
- Clean, Reddit-inspired card layout
- Blue color scheme with smooth transitions
- Sidebar navigation (☰ menu)
- User-friendly error messages

## Prerequisites

- A web browser (Chrome, Firefox, Safari, Edge)
- A NewsAPI account (free tier available)
- Internet connection

## Setup Instructions

### Step 1: Get Your API Key

1. Visit [NewsAPI.org](https://newsapi.org) and create an account
2. Copy your API key from the dashboard

### Step 2: Configure the Application

1. Open the `config.js` file
2. Replace `YOUR_API_KEY_HERE` with your actual API key:
```javascript
   const CONFIG = {
       API_KEY: 'your-actual-api-key-here',
       BASE_URL: 'https://newsapi.org/v2',
       PAGE_SIZE: 20,
       LANGUAGE: 'en'
   };
```

### Step 3: Run the Application

**Local Testing (Recommended for full functionality):**
```bash
# Using Python 3
python -m http.server 8000

# Then visit
http://localhost:8000
```

**Production Deployment:**
- Visit: https://alekdev.tech
- All features work except live article loading (see API limitations below)

## How to Use

1. **Browse by Category**: Click any category button to filter news
2. **Search**: Enter keywords in the search box
3. **Sort Results**: Use the dropdown to change sort order
4. **Dark Mode**: Click the 🌓 toggle in the sidebar menu
5. **Read Articles**: Click any card to open the full article

## API Information

### API Used
- **Name**: NewsAPI
- **Endpoint**: `GET /v2/everything`
- **Base URL**: `https://newsapi.org/v2`
- **Documentation**: [NewsAPI Docs](https://newsapi.org/docs)
- **Rate Limits**: Free tier (100 requests/day)

### API Response Structure
```json
{
  "status": "ok",
  "totalResults": 1234,
  "articles": [
    {
      "source": { "name": "..." },
      "title": "...",
      "description": "...",
      "url": "...",
      "urlToImage": "...",
      "publishedAt": "..."
    }
  ]
}
```

## Project Structure
```
meddit/
├── index.html          # Main HTML file
├── style.css           # Styling with dark mode
├── script.js           # App logic and UI
├── api.js              # NewsAPI integration (African filtering)
├── cache.js            # Caching system (5-min cache)
├── config.js           # API configuration (not in repo)
├── .gitignore          # Excludes config.js
└── README.md           # This file
```

## Security Notes

- **Never commit your API key** to version control
- `config.js` is in `.gitignore` to prevent accidental commits
- Keep your API keys private

## Deployment Architecture

Meddit is deployed across 3 servers with load balancing:
```
                  Load Balancer (Lb01)
                  alekdev.tech
                  54.90.78.198
                         │
            ┌────────────┴────────────┐
            │                         │
         Web01                     Web02
    3.80.188.154              [Your Web02 IP]
    (Nginx Server)            (Nginx Server)
```

### Deployment Features
- ✅ **Load Balancing** - Traffic distributed between servers
- ✅ **HTTPS/SSL** - Let's Encrypt certificates
- ✅ **High Availability** - Redundant server setup
- ✅ **Custom Domain** - alekdev.tech

## Development Challenges & Solutions

### Challenge 1: NewsAPI Free Tier Limitation

**Problem**: NewsAPI's free tier blocks browser-based API calls from live domains (HTTP 426 error).

**Investigation**:
- ✅ Tested locally → Works perfectly
- ✅ Tested server-side with curl → Works perfectly
- ❌ Tested in browser on live domain → Fails with 426

**Root Cause**: NewsAPI free tier allows localhost and server-side requests but blocks browser requests from deployed domains.

**Current Solution**: Application fully functional locally with complete deployment infrastructure. API limitation documented with local testing instructions.

**Production Solutions (Future)**:
1. Backend proxy (PHP/Node.js) for server-side calls
2. Upgrade to NewsAPI Business tier
3. Alternative news API

### Challenge 2: SSH and Server Access

**Problem**: Initial confusion with SSH keys and authentication.

**Solution**: Learned proper SSH key usage (`id_ed25519`) and connection commands.

### Challenge 3: Deployment vs Development Environments

**Problem**: Didn't realize some features work differently in production.

**Learning**: What works on localhost doesn't always work on live domains - a normal part of web development.

## What I Learned

### Technical Skills
- Full deployment pipeline (dev to production)
- Load balancing and traffic distribution
- SSL/HTTPS setup with Let's Encrypt
- API integration and limitations
- Server management (Nginx, SSH, file permissions)
- DNS management and domain configuration
- Caching strategies for performance

### Real-World Lessons
- API pricing tiers have hidden restrictions
- Production testing reveals issues not caught locally
- Professional documentation is crucial
- Error handling and user feedback are essential
- Not everything works perfectly, and that's okay

## Troubleshooting

### API Key Issues

**No articles loading locally**:
1. Verify API key in `config.js` is correct
2. Check subscription at [newsapi.org/account](https://newsapi.org/account)
3. Ensure no extra spaces in API key

### 426 Error (Upgrade Required)

**On live domain (alekdev.tech)**:
- This is expected behavior with NewsAPI free tier
- Test locally for full functionality: `python -m http.server 8000`
- Visit `http://localhost:8000` to see articles

### Rate Limit (429 Error)

**Too many requests**:
- Free tier: 100 requests/day
- Wait 24 hours or upgrade plan
- Caching helps reduce API calls

## License

This project was created for educational purposes as part of a university assignment.

## Credits & Attribution

### API Attribution
- **NewsAPI**: [newsapi.org](https://newsapi.org)
  - Provides live news data from global sources
  - Free tier for educational projects

### Technologies Used
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Nginx web server
- **Deployment**: Ubuntu 20.04, Let's Encrypt SSL
- **Infrastructure**: Load balancing with 2 web servers

### Design Inspiration
- **Reddit**: UI/UX inspiration for card layout

---

**Created by Becky Alek M. | Powered by BecksMeddit**

*"Bringing African stories to the world."*