import { useState } from 'react'

const FIELDS = [
  { name: 'host_name',          label: 'Dein Name',             placeholder: 'Max Mustermann' },
  { name: 'property_name',      label: 'Name der Unterkunft',   placeholder: 'Wiener Altbauwohnung' },
  { name: 'address',            label: 'Adresse',               placeholder: 'Mariahilfer Straße 45, 1060 Wien' },
  { name: 'checkin_time',       label: 'Check-in Zeit',         placeholder: '15:00' },
  { name: 'checkout_time',      label: 'Check-out Zeit',        placeholder: '11:00' },
  { name: 'wifi_name',          label: 'WLAN-Name',             placeholder: 'HomeNet_Wien' },
  { name: 'wifi_password',      label: 'WLAN-Passwort',         placeholder: 'meinpasswort123' },
  { name: 'keybox_code',        label: 'Schlüsselbox-Code',     placeholder: '4821' },
  { name: 'keybox_location',    label: 'Standort Schlüsselbox', placeholder: 'Links neben der Eingangstür' },
  { name: 'house_rules',        label: 'Hausregeln',            placeholder: 'Kein Rauchen, keine Haustiere, Ruhezeit ab 22 Uhr', textarea: true },
  { name: 'parking_info',       label: 'Parkplatz-Info',        placeholder: 'Straßenparken, Zone 6, Parkschein erforderlich', textarea: true },
  { name: 'emergency_contact',  label: 'Notfallkontakt',        placeholder: '+43 699 123 456 78' },
]

const EMPTY = Object.fromEntries(FIELDS.map(f => [f.name, '']))

export default function Dashboard() {
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

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

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">GuestGenie</h1>
          <p className="text-gray-500 mt-1">Host Dashboard — Unterkunft eintragen</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          {FIELDS.map(({ name, label, placeholder, textarea }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              {textarea ? (
                <textarea
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                />
              ) : (
                <input
                  type="text"
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              )}
            </div>
          ))}

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

      </div>
    </div>
  )
}
