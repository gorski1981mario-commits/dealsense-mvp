'use client'

export default function ZakelijkFAQPage() {
  const faqs = [
    {
      q: 'Wat is het ZAKELIJK B2B pakket?',
      a: 'ZAKELIJK B2B is ons professionele pakket voor bedrijven die industriële materialen, machines en diensten inkopen. Je krijgt toegang tot 10 B2B configurators (Metale, Chemicaliën, Energie, Granen, Bouwmaterialen, Machines, Elektronika, Transport, Verpakking, Gereedschap) en vergelijkt prijzen van 1000+ Nederlandse leveranciers.'
    },
    {
      q: 'Hoeveel kost het ZAKELIJK pakket?',
      a: 'Het ZAKELIJK B2B pakket kost €59,99 per maand. Je betaalt 10% commissie op gerealiseerde transacties via het platform.'
    },
    {
      q: 'Hoe werkt het Referral B2B2026 programma?',
      a: 'Het Referral B2B2026 programma is beschikbaar voor actieve zakelijke partners. Als je voldoet aan de vereisten, ontvang je een persoonlijke referral code die je kunt delen met andere bedrijven. Beide partijen ontvangen -2% korting op het maandabonnement.'
    },
    {
      q: 'Wat zijn de vereisten voor het Referral programma?',
      a: 'Om deel te nemen aan het B2B referral programma moet je:\n\n• Minimaal 3 maanden een actief ZAKELIJK pakket hebben\n• Minimaal 5 transacties hebben gerealiseerd via het platform\n• Minimaal €25.000 totale omzet hebben gegenereerd\n\nDeze vereisten zorgen voor een betrouwbaar netwerk van serieuze zakelijke partners en voorkomen misbruik van het systeem.'
    },
    {
      q: 'Hoe ontvang ik mijn referral code?',
      a: 'Zodra je aan alle vereisten voldoet (3+ maanden actief, 5+ deals, €25.000+ omzet), wordt je referral code automatisch gegenereerd. Je vindt deze in je account dashboard en kunt deze delen via e-mail, WhatsApp of andere kanalen.'
    },
    {
      q: 'Hoeveel korting krijg ik met een referral code?',
      a: 'Met een B2B2026 referral code ontvang je -2% korting op je maandabonnement. Dit geldt alleen voor het abonnement (€59,99 → €58,79), niet voor de commissie op transacties. De korting wordt automatisch toegepast bij betaling.'
    },
    {
      q: 'Kan ik een ZAKELIJK referral code gebruiken voor PLUS/PRO/FINANCE?',
      a: 'Nee, ZAKELIJK B2B referral codes kunnen alleen gebruikt worden voor het ZAKELIJK pakket. PLUS/PRO/FINANCE referral codes werken alleen voor PLUS/PRO/FINANCE pakketten. Dit voorkomt misbruik tussen verschillende pakkettypen.'
    },
    {
      q: 'Wat is het verschil tussen ZAKELIJK en andere pakketten?',
      a: 'ZAKELIJK B2B is specifiek voor bedrijven die industriële inkoop doen. Je krijgt toegang tot 10 B2B configurators, RFQ (Request for Quote) systeem, dedicated account manager en certificaten/documentatie (MSDS, COA, ISO). PLUS/PRO/FINANCE zijn voor consumenten en diensten zoals vakanties, verzekeringen en energie.'
    },
    {
      q: 'Hoe werkt de commissie bij ZAKELIJK?',
      a: 'Bij het ZAKELIJK pakket betaal je 10% commissie op de waarde van transacties die je via het platform realiseert. Dit is alleen bij succesvolle deals - geen transactie betekent geen commissie. De commissie dekt de kosten van platformonderhoud, leverancierverificatie en support.'
    },
    {
      q: 'Kan ik mijn referral code delen met werknemers?',
      a: 'Je kunt je referral code delen met andere bedrijven, maar elk bedrijf moet een eigen ZAKELIJK account hebben met unieke KVK-verificatie. Meerdere accounts van hetzelfde bedrijf (bijv. verschillende werknemers) kunnen niet allemaal referral codes ontvangen - dit voorkomt misbruik van het systeem.'
    },
    {
      q: 'Hoe lang is mijn referral code geldig?',
      a: 'Referral codes zijn 14 dagen geldig vanaf het moment van generatie. Na 14 dagen vervalt de code automatisch. Dit zorgt voor een actief en dynamisch referral netwerk.'
    },
    {
      q: 'Wat gebeurt er als ik stop met het ZAKELIJK pakket?',
      a: 'Als je je ZAKELIJK abonnement opzegt, verlies je toegang tot alle B2B configurators en je referral code wordt gedeactiveerd. Bedrijven die jouw code hebben gebruikt, behouden hun korting voor de eerste maand, maar je ontvangt geen korting meer bij verlenging.'
    }
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '40px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>
            ZAKELIJK B2B - Veelgestelde Vragen
          </h1>
          <p style={{ fontSize: '16px', color: '#6B7280' }}>
            Alles wat je moet weten over het ZAKELIJK B2B pakket en het Referral B2B2026 programma
          </p>
        </div>

        {/* FAQs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {faqs.map((faq, index) => (
            <div
              key={index}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #E5E7EB'
              }}
            >
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>
                {faq.q}
              </h3>
              <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-line', margin: 0 }}>
                {faq.a}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{
          marginTop: '48px',
          padding: '32px',
          background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
          borderRadius: '16px',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'white', marginBottom: '12px' }}>
            Klaar om te starten?
          </h3>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.9)', marginBottom: '24px' }}>
            Activeer het ZAKELIJK B2B pakket en begin met besparen op je inkoop
          </p>
          <button
            onClick={() => window.location.href = '/checkout/zakelijk'}
            style={{
              padding: '16px 32px',
              background: 'white',
              color: '#15803d',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            Activeer ZAKELIJK - €59,99/mnd
          </button>
        </div>
      </div>
    </div>
  )
}
