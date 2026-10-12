# AI Civic Issue Reporting Platform 🏙️
### AI-Powered Civic Issue Reporting Platform

This platform bridges the gap between citizens and public works. 
Snap a photo of a pothole, water leak, or broken light — 
our AI classifies, prioritizes, and routes it instantly.

## Live Demo
🔗 https://cityfix-107476098950.us-west1.run.app

## Key Features
- 📸 Photo-based issue reporting with auto-detected geolocation
- 🤖 Gemini AI analyzes photos for category, severity, and department routing
- 🔁 Autonomous triage agent: detects duplicate reports within 100m, 
  merges them, and auto-escalates priority (Low → Medium → High → Critical)
- 📊 Live dashboard: urgency triage density, category distribution, 
  active repairs, resolved counts
- 🗺️ Community feed with real-time status tracking
- 🔐 Google Sign-In authentication

## How the Triage Agent Works
1. User submits a report with photo + auto-detected location
2. Gemini analyzes the photo → category + severity
3. Agent checks Firestore for existing reports within ~100m, same category
4. If duplicate found → merges report, increments confirmation count, 
   recalculates priority automatically
5. Priority badge updates visibly on the community feed card

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React.js |
| Database | Cloud Firestore |
| Auth | Firebase Authentication |
| AI | Gemini API |
| Deployment | Google Cloud Run |
| Built with | Google AI Studio |

## Google Technologies Used
- Google AI Studio
- Gemini API
- Cloud Firestore
- Firebase Authentication
- Google Cloud Run
- Google Cloud Console


