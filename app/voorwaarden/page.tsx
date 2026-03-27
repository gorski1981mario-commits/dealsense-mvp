export const revalidate = 60

export default function VoorwaardenPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px', color: '#111827' }}>
        Algemene Voorwaarden
      </h1>
      
      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '32px' }}>
        Laatst bijgewerkt: 27 maart 2026
      </p>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: '#111827' }}>
          1. Acceptatie van de Voorwaarden
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', marginBottom: '12px' }}>
          Door gebruik te maken van DealSense.nl ga je akkoord met deze Algemene Voorwaarden. 
          Als je niet akkoord gaat met deze voorwaarden, mag je de dienst niet gebruiken.
        </p>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
          Deze voorwaarden vormen een bindende overeenkomst tussen jou en DealSense B.V.
        </p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: '#111827' }}>
          2. Dienstverlening
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', marginBottom: '12px' }}>
          DealSense.nl biedt een prijsvergelijkingsdienst aan waarmee gebruikers producten kunnen vergelijken 
          tussen verschillende Nederlandse webshops. We garanderen niet dat alle prijzen altijd 100% actueel zijn, 
          maar doen ons best om de meest recente informatie te tonen.
        </p>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
          De dienst wordt aangeboden "as is" en "as available". We behouden ons het recht voor om de dienst 
          op elk moment te wijzigen, op te schorten of te beëindigen.
        </p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: '#111827' }}>
          3. Gebruikersaccount
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', marginBottom: '12px' }}>
          Voor sommige functies is een account vereist. Bij het aanmaken van een account:
        </p>
        <ul style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8', paddingLeft: '20px', marginBottom: '12px' }}>
          <li>Moet je accurate en volledige informatie verstrekken</li>
          <li>Ben je verantwoordelijk voor het geheimhouden van je wachtwoord</li>
          <li>Ben je verantwoordelijk voor alle activiteiten onder je account</li>
          <li>Moet je ons onmiddellijk informeren bij ongeautoriseerd gebruik</li>
        </ul>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
          We behouden ons het recht voor om accounts te weigeren of te beëindigen naar eigen goeddunken.
        </p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: '#111827' }}>
          4. Gratis Scans & Pakketstructuur
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', marginBottom: '12px' }}>
          Nieuwe gebruikers krijgen 3 gratis scans om de dienst uit te proberen. 
          Na 3 scans is een upgrade naar een betaald pakket vereist voor verdere scans.
        </p>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
          We bieden verschillende pakketten aan (FREE en PLUS) met verschillende functionaliteiten. 
          De specifieke voorwaarden per pakket zijn beschikbaar op onze website.
        </p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: '#111827' }}>
          5. Prijzen, Betalingen & Commissie
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', marginBottom: '12px' }}>
          DealSense rekent een commissie op de besparing die je maakt. De commissie wordt alleen berekend 
          wanneer wij een lagere prijs vinden dan de door jou opgegeven basisprijs.
        </p>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', marginBottom: '12px' }}>
          Geen besparing = geen commissie. Alle prijzen zijn inclusief BTW tenzij anders vermeld.
        </p>
        <ul style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8', paddingLeft: '20px' }}>
          <li>Betalingen worden veilig verwerkt via Stripe</li>
          <li>We accepteren creditcards, debitcards en iDEAL</li>
          <li>Abonnementen worden maandelijks automatisch verlengd</li>
          <li>Prijswijzigingen worden 30 dagen van tevoren aangekondigd</li>
        </ul>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: '#111827' }}>
          6. Opzegging & Restitutie
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', marginBottom: '12px' }}>
          Je kunt je abonnement op elk moment opzeggen via je account instellingen. Bij opzegging:
        </p>
        <ul style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8', paddingLeft: '20px' }}>
          <li>Blijft je pakket actief tot het einde van de betaalde periode</li>
          <li>Wordt er geen restitutie gegeven voor gedeeltelijk gebruikte maanden</li>
          <li>Worden er geen kosten in rekening gebracht voor toekomstige periodes</li>
        </ul>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: '#111827' }}>
          7. Herroepingsrecht (14 dagen)
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', marginBottom: '12px' }}>
          Als consument heb je recht op een bedenktijd van 14 dagen na aankoop van een abonnement, 
          zonder opgave van redenen. Dit recht vervalt wanneer je de dienst al hebt gebruikt 
          (scans hebt uitgevoerd) of expliciet hebt verzocht om directe toegang.
        </p>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
          Voor herroeping neem je contact op via <a href="mailto:info@dealsense.nl" style={{ color: '#15803d', textDecoration: 'underline' }}>info@dealsense.nl</a>. 
          Restitutie vindt plaats binnen 14 dagen.
        </p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: '#111827' }}>
          8. Privacy & Gegevensbescherming
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', marginBottom: '12px' }}>
          DealSense respecteert je privacy en voldoet aan de AVG (GDPR). We verzamelen alleen 
          noodzakelijke gegevens voor de dienstverlening.
        </p>
        <ul style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8', paddingLeft: '20px', marginBottom: '12px' }}>
          <li>Anonieme gebruikers: geen persoonlijke gegevens opgeslagen</li>
          <li>Account gebruikers: e-mailadres en betaalgegevens (via Stripe)</li>
          <li>Alleen functionele cookies, geen tracking</li>
          <li>Je hebt recht op inzage, correctie en verwijdering van je gegevens</li>
        </ul>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
          Zie onze <a href="/veiligheid" style={{ color: '#15803d', textDecoration: 'underline' }}>Privacy & Veiligheid pagina</a> voor meer informatie.
        </p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: '#111827' }}>
          9. Toegestaan & Verboden Gebruik
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', marginBottom: '12px' }}>
          Je mag DealSense NIET gebruiken voor:
        </p>
        <ul style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8', paddingLeft: '20px', marginBottom: '12px' }}>
          <li>Illegale activiteiten of activiteiten die de wet overtreden</li>
          <li>Geautomatiseerde scraping, bots of andere geautomatiseerde toegang</li>
          <li>Misbruik van de gratis scans (bijv. meerdere accounts aanmaken)</li>
          <li>Commercieel hergebruik van onze data zonder schriftelijke toestemming</li>
          <li>Versturen van spam of ongewenste berichten</li>
          <li>Uploaden van virussen, malware of andere schadelijke code</li>
          <li>Pogingen om de beveiliging van de dienst te omzeilen</li>
          <li>Activiteiten die de reputatie van DealSense kunnen schaden</li>
        </ul>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
          Overtreding van deze regels kan leiden tot onmiddellijke beëindiging van je account.
        </p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: '#111827' }}>
          10. Intellectueel Eigendom
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', marginBottom: '12px' }}>
          Alle content op DealSense.nl, inclusief maar niet beperkt tot:
        </p>
        <ul style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8', paddingLeft: '20px', marginBottom: '12px' }}>
          <li>Teksten, afbeeldingen en logo's</li>
          <li>Software en broncode</li>
          <li>AI-modellen en algoritmes</li>
          <li>Database structuur en data</li>
          <li>Design en user interface</li>
        </ul>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
          is eigendom van DealSense B.V. en beschermd door auteursrecht, merkrecht en andere 
          intellectuele eigendomsrechten. Je mag deze content niet kopiëren, reproduceren, 
          distribueren of hergebruiken zonder onze schriftelijke toestemming.
        </p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: '#111827' }}>
          11. Licentie voor Gebruik
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', marginBottom: '12px' }}>
          We verlenen je een beperkte, niet-exclusieve, niet-overdraagbare licentie om de dienst 
          te gebruiken voor persoonlijke, niet-commerciële doeleinden, in overeenstemming met deze voorwaarden.
        </p>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', marginBottom: '12px' }}>
          Deze licentie geeft je GEEN recht om:
        </p>
        <ul style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8', paddingLeft: '20px' }}>
          <li>De software te wijzigen, kopiëren of reverse-engineeren</li>
          <li>Afgeleide werken te creëren</li>
          <li>De dienst te gebruiken voor commerciële doeleinden zonder toestemming</li>
        </ul>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: '#111827' }}>
          12. Beschikbaarheid & Onderhoud
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', marginBottom: '12px' }}>
          DealSense streeft naar een beschikbaarheid van 99% op jaarbasis. We behouden ons het recht voor om:
        </p>
        <ul style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8', paddingLeft: '20px', marginBottom: '12px' }}>
          <li>Gepland onderhoud uit te voeren (waar mogelijk buiten kantooruren)</li>
          <li>De dienst tijdelijk te onderbreken voor updates of reparaties</li>
          <li>Functionaliteiten toe te voegen, te wijzigen of te verwijderen</li>
          <li>De dienst permanent te beëindigen met 30 dagen voorafgaande kennisgeving</li>
        </ul>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
          We zijn niet aansprakelijk voor schade als gevolg van downtime of onderhoud.
        </p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: '#111827' }}>
          13. Aansprakelijkheid & Garanties
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', marginBottom: '12px' }}>
          DealSense is NIET aansprakelijk voor:
        </p>
        <ul style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8', paddingLeft: '20px', marginBottom: '12px' }}>
          <li>Onjuiste prijsinformatie van externe webshops</li>
          <li>Uitverkochte producten of gewijzigde prijzen</li>
          <li>Kwaliteit, levering of garanties van producten (verantwoordelijkheid van de verkoper)</li>
          <li>Verlies van data of winstderving</li>
          <li>Indirecte, incidentele of gevolgschade</li>
          <li>Schade door gebruik van externe links of diensten</li>
        </ul>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', marginBottom: '12px' }}>
          De dienst wordt aangeboden "as is" zonder enige garantie. We garanderen niet dat de dienst 
          foutloos, ononderbroken of veilig zal zijn.
        </p>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
          Onze totale aansprakelijkheid is in alle gevallen beperkt tot het bedrag dat je in de 
          laatste 12 maanden aan ons hebt betaald.
        </p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: '#111827' }}>
          14. Links naar Externe Websites
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', marginBottom: '12px' }}>
          Onze dienst kan links bevatten naar externe websites (webshops). Deze links worden 
          uitsluitend voor je gemak aangeboden. We hebben geen controle over deze websites en 
          zijn niet verantwoordelijk voor hun inhoud, privacy beleid of praktijken.
        </p>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
          Het gebruik van externe websites is op eigen risico.
        </p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: '#111827' }}>
          15. Beëindiging door DealSense
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', marginBottom: '12px' }}>
          We kunnen je toegang tot de dienst onmiddellijk beëindigen of opschorten, zonder voorafgaande 
          kennisgeving, bij:
        </p>
        <ul style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8', paddingLeft: '20px', marginBottom: '12px' }}>
          <li>Schending van deze voorwaarden</li>
          <li>Frauduleus of illegaal gebruik</li>
          <li>Niet-betaling van verschuldigde bedragen</li>
          <li>Misbruik van de dienst</li>
          <li>Op verzoek van wetshandhavingsinstanties</li>
        </ul>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
          Bij beëindiging vervallen alle licenties en rechten die je hebt gekregen.
        </p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: '#111827' }}>
          16. Wijziging van de Voorwaarden
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', marginBottom: '12px' }}>
          We behouden ons het recht voor om deze voorwaarden op elk moment te wijzigen. 
          Materiële wijzigingen worden 30 dagen van tevoren aangekondigd via:
        </p>
        <ul style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8', paddingLeft: '20px', marginBottom: '12px' }}>
          <li>E-mail (voor account gebruikers)</li>
          <li>Kennisgeving op onze website</li>
        </ul>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
          Gebruik van de dienst na de wijziging betekent acceptatie van de nieuwe voorwaarden. 
          Als je niet akkoord gaat, moet je het gebruik van de dienst staken.
        </p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: '#111827' }}>
          17. Toepasselijk Recht & Geschillenbeslechting
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', marginBottom: '12px' }}>
          Op deze voorwaarden is Nederlands recht van toepassing, met uitsluiting van het 
          Weens Koopverdrag.
        </p>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', marginBottom: '12px' }}>
          Bij geschillen:
        </p>
        <ul style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8', paddingLeft: '20px' }}>
          <li>Proberen we eerst tot een oplossing te komen via direct contact</li>
          <li>Consumenten kunnen zich wenden tot de Geschillencommissie Thuiswinkel</li>
          <li>Bij niet-oplossing zijn de rechtbanken in Amsterdam bevoegd</li>
        </ul>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: '#111827' }}>
          18. Overmacht (Force Majeure)
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', marginBottom: '12px' }}>
          DealSense is niet aansprakelijk voor het niet nakomen van verplichtingen als gevolg van 
          omstandigheden buiten onze redelijke controle, waaronder:
        </p>
        <ul style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8', paddingLeft: '20px' }}>
          <li>Storingen bij hosting providers of API leveranciers</li>
          <li>Internetproblemen of telecommunicatiestoringen</li>
          <li>Natuurrampen, brand, overstroming</li>
          <li>Oorlog, terrorisme, oproer</li>
          <li>Overheidsmaatregelen of wetgeving</li>
          <li>Stakingen of arbeidsconflicten</li>
        </ul>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: '#111827' }}>
          19. Scheidbaarheid
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
          Indien een bepaling in deze voorwaarden nietig, ongeldig of niet-afdwingbaar blijkt, 
          blijven de overige bepalingen volledig van kracht. De nietige bepaling wordt vervangen 
          door een geldige bepaling die de bedoeling van de oorspronkelijke bepaling zo dicht 
          mogelijk benadert.
        </p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: '#111827' }}>
          20. Volledige Overeenkomst
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
          Deze Algemene Voorwaarden, samen met onze Privacy Policy, vormen de volledige overeenkomst 
          tussen jou en DealSense met betrekking tot het gebruik van de dienst en vervangen alle 
          eerdere overeenkomsten en afspraken.
        </p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: '#111827' }}>
          21. Contact
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', marginBottom: '12px' }}>
          Voor vragen, klachten of opmerkingen over deze voorwaarden kun je contact met ons opnemen:
        </p>
        <ul style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8', paddingLeft: '20px', marginBottom: '12px' }}>
          <li>Algemene vragen: <a href="mailto:info@dealsense.nl" style={{ color: '#15803d', textDecoration: 'underline' }}>info@dealsense.nl</a></li>
          <li>Privacy gerelateerd: <a href="mailto:privacy@dealsense.nl" style={{ color: '#15803d', textDecoration: 'underline' }}>privacy@dealsense.nl</a></li>
        </ul>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
          We streven ernaar om binnen 48 uur te reageren op alle vragen.
        </p>
      </div>

      <div style={{
        marginTop: '48px',
        padding: '20px',
        background: '#f8fafc',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6' }}>
          <strong style={{ color: '#111827' }}>DealSense B.V.</strong><br />
          KVK: [wordt aangevraagd]<br />
          BTW: [wordt aangevraagd]<br />
          Amsterdam, Nederland<br /><br />
          © 2026 DealSense.nl
        </div>
      </div>
    </div>
  )
}




