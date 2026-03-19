import { useState } from 'react'

const FIELDS = [
  // Basis
  { name: 'host_name',          label: 'Dein Name',             placeholder: 'Max Mustermann' },
  { name: 'property_name',      label: 'Name der Unterkunft',   placeholder: 'Wiener Altbauwohnung' },
  { name: 'address',            label: 'Adresse',               placeholder: 'Mariahilfer Straße 45, 1060 Wien' },

  // 🏠 Ankunft & Zugang
  { section: '🏠 Ankunft & Zugang' },
  { name: 'checkin_time',          label: 'Check-in Zeit',                placeholder: '15:00' },
  { name: 'checkout_time',         label: 'Check-out Zeit',               placeholder: '11:00' },
  { name: 'floor_and_unit',        label: 'Stockwerk & Wohnungsnummer',   placeholder: '3. OG, Tür 12' },
  { name: 'checkin_instructions',  label: 'Check-in Anleitung',           placeholder: 'Schlüsselbox öffnen, Tür im Erdgeschoss ist offen, Lift zum 3. OG', textarea: true },
  { name: 'keybox_code',           label: 'Schlüsselbox-Code',            placeholder: '4821' },
  { name: 'keybox_location',       label: 'Standort Schlüsselbox',        placeholder: 'Links neben der Eingangstür' },
  { name: 'wifi_name',             label: 'WLAN-Name',                    placeholder: 'HomeNet_Wien' },
  { name: 'wifi_password',         label: 'WLAN-Passwort',                placeholder: 'meinpasswort123' },

  // 🛏️ Ausstattung
  { section: '🛏️ Ausstattung' },
  { name: 'towels_bedding_info',   label: 'Handtücher & Bettwäsche',     placeholder: 'Frische Handtücher im Badezimmerschrank, extra Decken im Schlafzimmer', textarea: true },
  { name: 'washing_machine_info',  label: 'Waschmaschine',               placeholder: 'Im Badezimmer, Waschpulver unter der Spüle, Kurzprogramm 30°C empfohlen', textarea: true },
  { name: 'heating_ac_info',       label: 'Heizung / Klimaanlage',        placeholder: 'Thermostat im Flur, Heizung auf 3 = ca. 21°C', textarea: true },

  // 🗑️ Alltag
  { section: '🗑️ Alltag' },
  { name: 'trash_disposal_info',       label: 'Mülltrennung & Entsorgung',  placeholder: 'Restmüll, Plastik, Papier — Tonnen im Innenhof links', textarea: true },
  { name: 'household_appliances_info', label: 'Haushaltsgeräte',             placeholder: 'Herd: Ceranfeld, Geschirrspüler: Tabs unter der Spüle', textarea: true },

  // 📍 Umgebung
  { section: '📍 Umgebung' },
  { name: 'nearest_public_transport',  label: 'Nächste U-Bahn / Öffis',       placeholder: 'U3 Zieglergasse, 2 Min. zu Fuß' },
  { name: 'wiener_linien_stop_id',    label: 'Wiener Linien Stop-ID (RBL Nummer)', placeholder: 'z.B. 4118 (= U3 Rochusgasse)', hint: 'RBL Nummer findest du auf wienerlinien.at' },
  { name: 'nearest_supermarket',       label: 'Supermarkt in der Nähe',        placeholder: 'Billa Plus, Mariahilfer Straße 52, Mo–Sa 7–20 Uhr' },
  { name: 'restaurant_recommendations', label: 'Restaurant-Empfehlungen',      placeholder: 'Figlmüller (Schnitzel), Naschmarkt (5 Min.), Café Sperl', textarea: true },

  // ℹ️ Sonstiges
  { section: 'ℹ️ Sonstiges' },
  { name: 'max_guests',        label: 'Max. Gästeanzahl',     placeholder: '4' },
  { name: 'pets_allowed',      label: 'Haustiere erlaubt',    placeholder: 'Nein' },
  { name: 'smoking_allowed',   label: 'Rauchen erlaubt',      placeholder: 'Nur am Balkon' },
  { name: 'special_notes',     label: 'Besondere Hinweise',   placeholder: 'Bitte Schuhe im Eingangsbereich ausziehen', textarea: true },
  { name: 'house_rules',       label: 'Hausregeln',           placeholder: 'Kein Rauchen, keine Haustiere, Ruhezeit ab 22 Uhr', textarea: true },
  { name: 'parking_info',      label: 'Parkplatz-Info',       placeholder: 'Straßenparken, Zone 6, Parkschein erforderlich', textarea: true },
  { name: 'emergency_contact', label: 'Notfallkontakt',       placeholder: '+43 699 123 456 78' },
]

const EMPTY = Object.fromEntries(FIELDS.filter(f => f.name).map(f => [f.name, '']))

export default function Dashboard() {
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)
  const [documents, setDocuments] = useState([])
  const [docError, setDocError] = useState(null)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setResult(data)
      setForm(EMPTY)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const chatUrl = result ? `${window.location.origin}/chat/${result.id}` : null

  async function fetchDocuments(propertyId) {
    try {
      const res = await fetch(`/api/documents/${propertyId}`)
      const data = await res.json()
      if (res.ok) setDocuments(data)
    } catch {}
  }

  async function handleUpload(e) {
    e.preventDefault()
    if (!result) return
    const fileInput = e.target.querySelector('input[type="file"]')
    const file = fileInput?.files?.[0]
    if (!file) return

    setUploading(true)
    setDocError(null)
    setUploadResult(null)

    try {
      const formData = new FormData()
      formData.append('property_id', result.id)
      formData.append('file', file)
      const res = await fetch('/api/documents/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setUploadResult(data)
      fileInput.value = ''
      fetchDocuments(result.id)
    } catch (err) {
      setDocError(err.message)
    } finally {
      setUploading(false)
    }
  }

  async function handleDeleteDoc(filename) {
    try {
      await fetch(`/api/documents/${result.id}/${encodeURIComponent(filename)}`, { method: 'DELETE' })
      fetchDocuments(result.id)
    } catch {}
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">GuestGenie</h1>
          <p className="text-gray-500 mt-1">Host Dashboard — Unterkunft eintragen</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          {FIELDS.map((field, i) =>
            field.section ? (
              <h2 key={field.section} className="text-lg font-semibold text-gray-800 pt-4 pb-1 border-b border-gray-200">
                {field.section}
              </h2>
            ) : (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                {field.textarea ? (
                  <textarea
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                  />
                ) : (
                  <input
                    type="text"
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                )}
                {field.hint && <p className="text-xs text-gray-400 mt-1">{field.hint}</p>}
              </div>
            )
          )}

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            {loading ? 'Wird gespeichert...' : 'Unterkunft speichern'}
          </button>
        </form>

        {result && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-2xl p-5">
            <p className="text-green-800 font-medium mb-1">Unterkunft gespeichert!</p>
            <p className="text-sm text-gray-600 mb-3">Diesen Link an deine Gäste weitergeben:</p>
            <a
              href={chatUrl}
              target="_blank"
              rel="noreferrer"
              className="block bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-indigo-600 break-all hover:underline"
            >
              {chatUrl}
            </a>
          </div>
        )}

        {result && (
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Dokumente hochladen (optional)</h2>
            <p className="text-sm text-gray-500 mb-4">
              Lade PDF, TXT oder DOCX Dateien hoch — der Chatbot nutzt diese Infos für Gästeantworten.
            </p>

            <form onSubmit={handleUpload} className="flex gap-2 items-center mb-4">
              <input
                type="file"
                accept=".pdf,.txt,.docx"
                className="flex-1 text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
              />
              <button
                type="submit"
                disabled={uploading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
              >
                {uploading ? 'Lädt...' : 'Hochladen'}
              </button>
            </form>

            {docError && <p className="text-red-500 text-sm mb-3">{docError}</p>}
            {uploadResult && (
              <p className="text-green-600 text-sm mb-3">
                Dokument hochgeladen — {uploadResult.chunks} Textabschnitte erstellt.
              </p>
            )}

            {documents.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Hochgeladene Dokumente:</p>
                {documents.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <div>
                      <p className="text-sm text-gray-800">{doc.filename}</p>
                      <p className="text-xs text-gray-400">{doc.chunks} Abschnitte</p>
                    </div>
                    <button
                      onClick={() => handleDeleteDoc(doc.filename)}
                      className="text-red-400 hover:text-red-600 text-sm"
                    >
                      Löschen
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
