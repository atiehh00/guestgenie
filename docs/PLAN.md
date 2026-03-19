# GuestGenie — MVP Plan

## Was wir bauen
KI-Chatbot für Airbnb Hosts im DACH-Raum.
Hosts tragen ihre Wohnungs-Infos ein, der Chatbot 
antwortet Gästen automatisch — 24/7, mehrsprachig, 
ohne dass der Host eingreifen muss.

---

## MVP Ziel
Eine funktionierende Demo die wir echten Wiener 
Airbnb Hosts zeigen können. Kein perfektes Produkt, 
nur der Kern der funktioniert.

---

## Tech Stack

### Backend
- Node.js + Express
- Anthropic Claude API (claude-sonnet-4-5)
- Supabase (Datenbank)
- dotenv für API Keys

### Frontend
- React + Vite
- Tailwind CSS
- Zwei Views: Host Dashboard + Chat Widget

### Deployment (später)
- Vercel

---

## Ordnerstruktur
```
guestgenie/
├── backend/
│   ├── index.js          # Express Server
│   ├── routes/
│   │   ├── chat.js       # POST /api/chat
│   │   └── property.js   # GET/POST /api/property
│   ├── services/
│   │   └── claude.js     # Anthropic API Logic
│   └── .env              # API Keys (nie in Git!)
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx   # Host Seite
│   │   │   └── Widget.jsx      # Gast Chat
│   │   └── App.jsx
└── docs/
    └── PLAN.md
```

---

## Features — MVP (Priorität 1)

### 1. Host Onboarding
Host füllt Formular aus:

🏠 Ankunft & Zugang:
- Check-in Zeit / Check-out Zeit
- Stockwerk & Wohnungsnummer
- Check-in Anleitung (Self Check-in Ablauf)
- Key-Box Code + Standort
- WiFi Name + Passwort

🛏️ Ausstattung:
- Handtücher & Bettwäsche Info
- Waschmaschine (wo, wie bedienen)
- Heizung / Klimaanlage Bedienung

🗑️ Alltag:
- Mülltrennung & Entsorgung
- Haushaltsgeräte (Herd, Geschirrspüler)

📍 Umgebung:
- Nächste U-Bahn / Öffis
- Supermarkt in der Nähe
- Restaurant-Empfehlungen

ℹ️ Sonstiges:
- Max. Gästeanzahl
- Haustiere erlaubt
- Rauchen erlaubt
- Besondere Hinweise

Basis-Felder (immer):
- Host Name
- Name der Wohnung
- Adresse
- Hausregeln
- Parkplatz Info
- Notfall-Kontakt

Alles wird in Supabase gespeichert.

### 2. Chat Widget (Gast-Seite)
- Gast schreibt eine Frage
- Backend holt Property-Daten aus Supabase
- Schickt alles an Claude API
- Claude antwortet basierend NUR auf den 
  Property-Daten
- Antwortet automatisch in der Sprache des Gastes
- Ton: freundlich, professionell

### 3. Host Dashboard
- Übersicht aller Chat-Verläufe
- Kann Gespräche lesen
- Kann bei Bedarf manuell eingreifen

---

## Wichtige Regeln für den Chatbot

Der System-Prompt für Claude muss folgendes enthalten:
- Antworte NUR mit Infos die du aus den 
  Property-Daten kennst
- Erfinde KEINE Informationen
- Wenn du etwas nicht weißt: sag dem Gast er soll 
  den Host direkt kontaktieren
- Erkenne die Sprache des Gastes und antworte 
  in derselben Sprache
- Bei Notfällen (Feuer, Unfall, medizinisch): 
  sofort Notruf empfehlen und Host benachrichtigen

---

## Datenbank Schema (Supabase)

### Tabelle: properties
- id (uuid)
- host_name (text)
- property_name (text)
- address (text)
- checkin_time (text)
- checkout_time (text)
- floor_and_unit (text)
- checkin_instructions (text)
- wifi_name (text)
- wifi_password (text)
- keybox_code (text)
- keybox_location (text)
- towels_bedding_info (text)
- washing_machine_info (text)
- heating_ac_info (text)
- trash_disposal_info (text)
- household_appliances_info (text)
- nearest_public_transport (text)
- nearest_supermarket (text)
- restaurant_recommendations (text)
- max_guests (text)
- pets_allowed (text)
- smoking_allowed (text)
- special_notes (text)
- house_rules (text)
- parking_info (text)
- emergency_contact (text)
- created_at (timestamp)

### Tabelle: conversations
- id (uuid)
- property_id (uuid)
- guest_message (text)
- bot_response (text)
- created_at (timestamp)

---

## API Endpoints

### POST /api/chat
Request:
```json
{
  "property_id": "uuid",
  "message": "Was ist das WiFi Passwort?"
}
```
Response:
```json
{
  "response": "Das WiFi heißt 'HomeNet', 
               Passwort ist 1234!"
}
```

### POST /api/property
Neue Property anlegen (Host Onboarding)

### GET /api/property/:id
Property-Daten holen

---

## Was NICHT im MVP ist
- Keine Airbnb API Integration (kommt später)
- Kein WhatsApp (kommt später)
- Kein Bezahlsystem
- Kein automatischer Login/Auth (simpel halten)

---

## Reihenfolge zum Bauen

1. Backend Setup (Express + .env)
2. Supabase verbinden + Tabellen anlegen
3. /api/property Endpoint (speichern + lesen)
4. Claude Service (System Prompt + API Call)
5. /api/chat Endpoint
6. Frontend: Host Onboarding Form
7. Frontend: Chat Widget
8. Frontend: Dashboard

---

## Kontext
- Zielmarkt: DACH, Start in Wien
- Zielgruppe: Hosts mit mehreren Listings
- Zweck dieses MVPs: Demo für echte Wiener 
  Hosts + Antler Bewerbung
- Branding: GuestGenie