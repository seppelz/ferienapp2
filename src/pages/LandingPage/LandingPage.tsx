import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MetaTags } from '../../components/SEO/MetaTags';
import styles from './LandingPage.module.css';

// Icons (we'll use emoji as placeholders, later we can replace with proper SVG icons)
const icons = {
  calendar: '🗓️',
  people: '👥',
  state: '🏛️',
  keyboard: '⌨️',
  chart: '📊',
  rocket: '🚀',
  gift: '🎁',
};

// Constants
const FEATURES = [
  {
    icon: icons.calendar,
    title: 'Brückentage-Optimierung',
    description: 'Intelligente Berechnung der effizientesten Urlaubstage mit Berücksichtigung von Feiertagen.',
  },
  {
    icon: icons.people,
    title: 'Zwei-Personen Planung',
    description: 'Plane deinen Urlaub gemeinsam mit Partner oder Familie, mit separater Verwaltung pro Person.',
  },
  {
    icon: icons.state,
    title: 'Bundesland-spezifisch',
    description: 'Alle Feiertage für jedes Bundesland, inklusive Schulferien als zusätzliche Information.',
  },
  {
    icon: icons.keyboard,
    title: 'Schnelle Bedienung',
    description: 'Effiziente Tastatursteuerung für schnelle und komfortable Urlaubsplanung.',
  },
];

const BENEFITS = [
  {
    icon: icons.chart,
    title: 'Maximale Effizienz',
    value: 'Bis zu 24 Tage',
    description: 'Verlängere deinen Urlaub durch optimale Nutzung von Brückentagen und Feiertagen.',
  },
  {
    icon: icons.rocket,
    title: 'Schnelle Planung',
    value: '< 5 Minuten',
    description: 'Plane deinen gesamten Jahresurlaub in weniger als 5 Minuten.',
  },
  {
    icon: icons.gift,
    title: 'Kostenlos',
    value: '100% Gratis',
    description: 'Alle Features kostenlos verfügbar, keine versteckten Kosten.',
  },
];

const DEMO_CALENDAR_DAYS = [
  { date: '1', type: 'normal' },
  { date: '2', type: 'normal' },
  { date: '3', type: 'holiday', label: 'Tag der Deutschen Einheit' },
  { date: '4', type: 'bridge', label: 'Brückentag' },
  { date: '5', type: 'weekend' },
  { date: '6', type: 'weekend' },
  { date: '7', type: 'normal' },
];

const HOW_IT_WORKS_STEPS = [
  {
    icon: '🗺️',
    title: 'Bundesland auswählen',
    description: 'Wähle dein Bundesland aus, um alle relevanten Feiertage zu sehen.',
  },
  {
    icon: '👥',
    title: 'Optional: Zweite Person',
    description: 'Plane gemeinsam mit Partner oder Familie durch Aktivierung der Zwei-Personen Ansicht.',
  },
  {
    icon: '📅',
    title: 'Brückentage anzeigen',
    description: 'Lass dir die effizientesten Brückentage für dein Bundesland anzeigen.',
  },
  {
    icon: '✨',
    title: 'Urlaub optimieren',
    description: 'Wähle die Brückentage aus und optimiere deinen Jahresurlaub mit wenigen Klicks.',
  },
];

const PWA_FEATURES = [
  {
    icon: '🔌',
    title: 'Offline verfügbar',
    description: 'Nutze die App auch ohne Internetverbindung. Alle Funktionen bleiben erhalten.',
  },
  {
    icon: '📱',
    title: 'App Installation',
    description: 'Installiere die App direkt auf deinem Smartphone oder Desktop für schnellen Zugriff.',
  },
  {
    icon: '🚀',
    title: 'Schnellzugriff',
    description: 'Greife blitzschnell auf deine Urlaubsplanung zu - direkt vom Homescreen.',
  },
  {
    icon: '🔄',
    title: 'Automatische Updates',
    description: 'Bleibe immer auf dem neuesten Stand mit automatischen App-Updates.',
  },
];

// Common components
interface CTAButtonProps {
  children: React.ReactNode;
}

const CTAButton: React.FC<CTAButtonProps> = ({ children }) => {
  const navigate = useNavigate();
  return (
    <button 
      className={styles.ctaButton}
      onClick={() => navigate('/app')}
      aria-label="Öffne den Urlaubsplaner"
    >
      {children}
    </button>
  );
};

// Memoized components
interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

interface BenefitCardProps {
  icon: string;
  title: string;
  value: string;
  description: string;
}

const FeatureCard = memo<FeatureCardProps>(({ icon, title, description }) => (
  <div className={styles.featureCard} role="article">
    <div className={styles.featureIcon} aria-hidden="true">{icon}</div>
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
));

const BenefitCard = memo<BenefitCardProps>(({ icon, title, value, description }) => (
  <div className={styles.benefitCard} role="article">
    <div className={styles.benefitIcon} aria-hidden="true">{icon}</div>
    <h3>{title}</h3>
    <div className={styles.benefitValue} aria-label={`Wert: ${value}`}>{value}</div>
    <p>{description}</p>
  </div>
));

// Section Components
const HeroIllustration = () => (
  <div className={styles.heroIllustration}>
    <svg
      viewBox="0 0 500 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={styles.heroSvg}
    >
      {/* Main Calendar */}
      <rect className={styles.calendarFrame} x="50" y="50" width="240" height="280" rx="15" />
      <rect className={styles.calendarHeader} x="50" y="50" width="240" height="60" rx="15" />
      
      {/* Calendar Days */}
      <g className={styles.calendarDays}>
        {Array.from({ length: 5 }).map((_, row) =>
          Array.from({ length: 7 }).map((_, col) => (
            <rect
              key={`${row}-${col}`}
              x={70 + col * 30}
              y={130 + row * 40}
              width="25"
              height="25"
              rx="5"
              className={styles.calendarDay}
            />
          ))
        )}
      </g>

      {/* Highlighted Vacation Period */}
      <g className={styles.vacationPeriod}>
        <rect x="100" y="170" width="85" height="25" rx="5" className={styles.vacationBlock} />
        <path d="M185 182.5 L215 182.5" className={styles.vacationConnection} />
        <rect x="215" y="170" width="55" height="25" rx="5" className={styles.holidayBlock} />
      </g>

      {/* Palm Tree */}
      <g className={styles.palmTree}>
        <path
          d="M380 280 C380 280, 360 250, 390 220 C420 190, 400 160, 380 150"
          className={styles.palmLeaf1}
        />
        <path
          d="M380 280 C380 280, 400 250, 370 220 C340 190, 360 160, 380 150"
          className={styles.palmLeaf2}
        />
        <rect x="375" y="280" width="10" height="40" className={styles.palmTrunk} />
      </g>

      {/* Beach Elements */}
      <path
        d="M320 320 Q380 300, 440 320"
        className={styles.beachWave1}
      />
      <path
        d="M300 340 Q380 320, 460 340"
        className={styles.beachWave2}
      />

      {/* Sun with Dynamic Rays */}
      <g className={styles.sunGroup}>
        <circle cx="420" cy="100" r="25" className={styles.sun} />
        {Array.from({ length: 8 }).map((_, i) => (
          <line
            key={i}
            x1="420"
            y1="100"
            x2={420 + Math.cos((i * Math.PI) / 4) * 40}
            y2={100 + Math.sin((i * Math.PI) / 4) * 40}
            className={styles.sunRay}
          />
        ))}
      </g>

      {/* Floating Icons */}
      <g className={styles.floatingIcons}>
        <g className={styles.planeIcon}>
          <path d="M320 150 L350 130 L360 140 L320 150 L340 170 L320 150" />
        </g>
        <circle cx="450" cy="180" r="10" className={styles.beachBall} />
        <path
          d="M280 200 L290 190 L300 200 L290 210 Z"
          className={styles.umbrella}
        />
      </g>

      {/* Check Marks on Calendar */}
      {[
        [2, 1],
        [2, 2],
        [2, 3]
      ].map(([row, col]) => (
        <path
          key={`check-${row}-${col}`}
          d={`M${75 + col * 30} ${140 + row * 40} l5 5 l10 -10`}
          className={styles.checkMark}
        />
      ))}
    </svg>
  </div>
);

const HeroSection = () => {
  const navigate = useNavigate();
  
  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <div className={styles.heroText}>
          <h1>Intelligente Urlaubsplanung mit Brückentagen</h1>
          <p>
            Maximiere deinen Urlaub mit unserem smarten Urlaubsplaner. 
            Plane effizient, nutze Brückentage und genieße mehr Freizeit.
          </p>
          <CTAButton>Jetzt Planen</CTAButton>
        </div>
        <HeroIllustration />
      </div>
    </section>
  );
};

const FeaturesSection = () => (
  <section className={styles.features}>
    <div className={styles.sectionContent}>
      <h2>Unsere Features</h2>
      <div className={styles.featureGrid}>
        {FEATURES.map((feature, index) => (
          <FeatureCard
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </div>
  </section>
);

const DemoSection = () => {
  return (
    <section className={styles.demo}>
      <div className={styles.sectionContent}>
        <h2>Ausprobieren</h2>
        <div className={styles.demoContent}>
          <div className={styles.demoCalendarWrapper}>
            <div className={styles.demoCalendar}>
              <div className={styles.demoCalendarHeader}>
                <h3>Oktober 2024</h3>
                <p className={styles.efficiency}>Effizienz: 1 Urlaubstag = 4 freie Tage</p>
              </div>
              <div className={styles.demoCalendarDays}>
                {DEMO_CALENDAR_DAYS.map((day, index) => (
                  <div 
                    key={index} 
                    className={`${styles.demoDay} ${styles[day.type]}`}
                    title={day.label}
                    role="gridcell"
                    aria-label={`${day.date}. Oktober${day.label ? `, ${day.label}` : ''}`}
                  >
                    <span className={styles.dayNumber}>{day.date}</span>
                    {day.label && <span className={styles.dayLabel}>{day.label}</span>}
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.demoLegend}>
              <div className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.holiday}`}></span>
                <span>Feiertag</span>
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.bridge}`}></span>
                <span>Brückentag</span>
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.weekend}`}></span>
                <span>Wochenende</span>
              </div>
            </div>
          </div>
          <div className={styles.demoText}>
            <h3>Intelligent geplant</h3>
            <p>Mit nur einem Urlaubstag am 4. Oktober erhältst du vier freie Tage am Stück.</p>
            <CTAButton>Jetzt selbst planen</CTAButton>
          </div>
        </div>
      </div>
    </section>
  );
};

const BenefitsSection = () => {
  return (
    <section className={styles.benefits}>
      <div className={styles.sectionContent}>
        <h2>Deine Vorteile</h2>
        <div className={styles.benefitsGrid}>
          {BENEFITS.map((benefit, index) => (
            <BenefitCard
              key={index}
              icon={benefit.icon}
              title={benefit.title}
              value={benefit.value}
              description={benefit.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorksSection = () => {
  return (
    <section className={styles.howItWorks}>
      <div className={styles.sectionContent}>
        <h2>So funktioniert's</h2>
        <div className={styles.stepsContainer}>
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <div key={index} className={styles.stepCard}>
              <div className={styles.stepNumber}>{index + 1}</div>
              <div className={styles.stepIcon}>{step.icon}</div>
              <div className={styles.stepContent}>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
              {index < HOW_IT_WORKS_STEPS.length - 1 && (
                <div className={styles.stepConnector}>
                  <svg viewBox="0 0 24 24" className={styles.connectorArrow}>
                    <path d="M5 12h14m-4 4l4-4-4-4" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className={styles.startNow}>
          <p>Bereit zum Starten?</p>
          <CTAButton>Jetzt Urlaub planen</CTAButton>
        </div>
      </div>
    </section>
  );
};

const PWASection = () => {
  return (
    <section className={styles.pwa}>
      <div className={styles.sectionContent}>
        <h2>Immer & Überall verfügbar</h2>
        <div className={styles.pwaContent}>
          <div className={styles.pwaFeatures}>
            {PWA_FEATURES.map((feature, index) => (
              <div key={index} className={styles.pwaFeatureCard}>
                <div className={styles.pwaFeatureIcon}>{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
          
          <div className={styles.pwaDemo}>
            <div className={styles.deviceFrame}>
              <div className={styles.deviceScreen}>
                <div className={styles.installPrompt}>
                  <div className={styles.appIcon}>🏖️</div>
                  <div className={styles.installText}>
                    <h4>Holiday Planner</h4>
                    <p>Zum Homescreen hinzufügen</p>
                  </div>
                  <button className={styles.installButton}>Installieren</button>
                </div>
              </div>
            </div>
            <div className={styles.pwaInstructions}>
              <h3>Installation leicht gemacht</h3>
              <ol className={styles.installSteps}>
                <li>Öffne die App im Browser</li>
                <li>Tippe auf "Zum Homescreen hinzufügen"</li>
                <li>Fertig! Die App ist jetzt installiert</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Add FAQ section data
const FAQ_DATA = [
  {
    question: 'Was sind Brückentage?',
    answer: 'Brückentage sind Arbeitstage, die zwischen Feiertagen und Wochenenden liegen. Durch geschickte Planung dieser Tage können Sie Ihren Urlaub optimal verlängern.'
  },
  {
    question: 'Wie funktioniert die Zwei-Personen Planung?',
    answer: 'Sie können zwei verschiedene Bundesländer auswählen und separate Urlaubstage planen. Ideal für Paare oder Familien, die in unterschiedlichen Bundesländern arbeiten.'
  },
  {
    question: 'Ist die Nutzung kostenlos?',
    answer: 'Ja, alle Funktionen des Holiday Planners sind komplett kostenlos verfügbar. Es gibt keine versteckten Kosten oder Premium-Features.'
  },
  {
    question: 'Werden meine Daten gespeichert?',
    answer: 'Ihre Urlaubsplanung wird nur lokal in Ihrem Browser gespeichert. Es werden keine persönlichen Daten an Server übertragen.'
  },
  {
    question: 'Welche Bundesländer werden unterstützt?',
    answer: 'Der Holiday Planner unterstützt alle 16 deutschen Bundesländer mit ihren spezifischen Feiertagen und Schulferien.'
  },
  {
    question: 'Kann ich die App auch offline nutzen?',
    answer: 'Ja, der Holiday Planner funktioniert auch ohne Internetverbindung. Installieren Sie die App einmal und nutzen Sie sie jederzeit.'
  },
  {
    question: 'Wie weit im Voraus kann ich planen?',
    answer: 'Sie können Ihren Urlaub für die Jahre 2024-2026 planen. Die Feiertage und Brückentage werden regelmäßig aktualisiert.'
  },
  {
    question: 'Gibt es eine maximale Anzahl an Urlaubstagen?',
    answer: 'Nein, Sie können beliebig viele Urlaubstage planen. Die App zeigt Ihnen die effizienteste Verteilung für Ihre verfügbaren Tage.'
  }
];

// Add testimonials data
const TESTIMONIALS_DATA = [
  {
    name: 'Sarah M.',
    role: 'Projektmanagerin',
    text: 'Dank der Zwei-Personen Planung können mein Partner und ich unseren Urlaub perfekt aufeinander abstimmen.',
    rating: 5
  },
  {
    name: 'Michael K.',
    role: 'Lehrer',
    text: 'Die Berücksichtigung der Schulferien ist super praktisch. So kann ich meinen Urlaub optimal mit dem Schuljahr koordinieren.',
    rating: 5
  },
  {
    name: 'Lisa B.',
    role: 'Teamleiterin',
    text: 'Die Effizienzberechnung hat mir geholfen, aus meinen 30 Urlaubstagen das Maximum herauszuholen.',
    rating: 5
  }
];

// FAQ Section Component
const FAQSection = () => (
  <section className={styles.faq}>
    <div className={styles.sectionContent}>
      <h2 id="faq-title">Häufig gestellte Fragen</h2>
      <div className={styles.faqGrid}>
        {FAQ_DATA.map((item, index) => (
          <div key={index} className={styles.faqItem}>
            <h3>{item.question}</h3>
            <p>{item.answer}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// Testimonials Section Component
const TestimonialsSection = () => (
  <section className={styles.testimonials}>
    <div className={styles.sectionContent}>
      <h2 id="testimonials-title">Das sagen unsere Nutzer</h2>
      <div className={styles.testimonialsGrid}>
        {TESTIMONIALS_DATA.map((testimonial, index) => (
          <div key={index} className={styles.testimonialCard} itemScope itemType="https://schema.org/Review">
            <div className={styles.testimonialContent}>
              <p itemProp="reviewBody">{testimonial.text}</p>
              <div className={styles.testimonialRating} itemProp="reviewRating" itemScope itemType="https://schema.org/Rating">
                <meta itemProp="ratingValue" content={testimonial.rating.toString()} />
                <meta itemProp="bestRating" content="5" />
                {'★'.repeat(testimonial.rating)}
              </div>
            </div>
            <div className={styles.testimonialAuthor}>
              <p itemProp="author" itemScope itemType="https://schema.org/Person">
                <span itemProp="name">{testimonial.name}</span>
                <span className={styles.testimonialRole} itemProp="jobTitle">{testimonial.role}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// Update main component to include new sections
export const LandingPage: React.FC = () => {
  return (
    <div className={styles.landingPage}>
      <MetaTags />
      <main>
        <HeroSection />
        <FeaturesSection />
        <DemoSection />
        <BenefitsSection />
        <TestimonialsSection />
        <HowItWorksSection />
        <FAQSection />
        <PWASection />
      </main>
      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} Holiday Planner. Alle Rechte vorbehalten.</p>
        <nav aria-label="Footer Navigation">
          <a href="/holiday/datenschutz">Datenschutz</a>
          <a href="/holiday/impressum">Impressum</a>
          <a href="/holiday/kontakt">Kontakt</a>
        </nav>
      </footer>
    </div>
  );
}; 