// src/pages/LandingPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';
import { BarChart3, BrainCircuit, Zap, DatabaseZap, Settings2, Eye, CheckCircle, Linkedin, Twitter, Github } from 'lucide-react';
import { motion, useAnimation, type Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

// Definer animasjonsvarianter for kort/elementer som fader inn og sklir opp
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};

// Hjelpekomponent for animerte kort
interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  index?: number;
  threshold?: number;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({ children, className, index = 0, threshold = 0.1 }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: threshold,
  });

  React.useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={controls}
      variants={cardVariants}
      custom={index}
    >
      {children}
    </motion.div>
  );
};


const LandingPage: React.FC = () => {
  const features = [
    {
      icon: <BarChart3 size={36} className="feature-icon" />,
      title: "Dybdeanalyse & Innsikt",
      description: "Avdekke skjulte mønstre og få dypere forståelse gjennom omfattende dataanalyse og visualisering."
    },
    {
      icon: <BrainCircuit size={36} className="feature-icon" />,
      title: "AI & Modellering",
      description: "Bygg og tren dine egne AI-modeller, eller benytt våre avanserte algoritmer for prediksjon og automatisert analyse."
    },
    {
      icon: <Zap size={36} className="feature-icon" />,
      title: "Dynamisk Datainnhenting",
      description: "Integrer og analyser data i sanntid fra diverse kilder, inkludert sosiale medier, API-er og markedsinformasjon."
    }
  ];

  const sectionAnimationControls = (threshold = 0.2, delay = 0.2) => {
    const controls = useAnimation();
    const [ref, inView] = useInView({ triggerOnce: true, threshold });
    React.useEffect(() => {
      if (inView) controls.start({ opacity: 1, y: 0, transition: { duration: 0.8, delay, ease: "easeOut" } });
    }, [controls, inView, delay]);
    return { ref, controls, initial: { opacity: 0, y: 50 } as const }; // 'as const' for bedre typeinferens
  };
  
  const featuresSectionAnim = sectionAnimationControls();
  const howItWorksAnim = sectionAnimationControls();
  const highlight1Anim = sectionAnimationControls(0.2, 0);
  const highlight2Anim = sectionAnimationControls(0.2, 0);
  const finalCtaAnim = sectionAnimationControls(0.3, 0.3);


  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="logo">Aracanix</div>
        <nav className="main-nav">
          {/* <Link to="/sign-up" className="cta-button primary">Kom i gang</Link> */}
          <Link to="/sign-in" className="cta-button secondary">Logg Inn</Link>
        </nav>
      </header>

      <main>
        <section className="hero">
          <motion.div
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
             className="hero-content"
          >
            <h1>Avansert Innsikt. Intelligente Beslutninger.</h1>
            <p className="subtitle">
              Aracanix samler og analyserer komplekse data, og leverer presis innsikt for å optimalisere dine strategier – enten det gjelder markedstrender, sport, eller andre dynamiske felt.
            </p>
             <Link to="/sign-up" className="cta-button primary hero-cta">Utforsk Mulighetene</Link>
          </motion.div>
        </section>

        <motion.section
          ref={featuresSectionAnim.ref}
          id="features"
          className="features-section"
          initial={featuresSectionAnim.initial}
          animate={featuresSectionAnim.controls}
        >
          <h2>Hvorfor Aracanix?</h2>
          <p className="section-subtitle">Utforsk kraften i en plattform bygget for innsamling, analyse og prediksjon.</p>
          <div className="features-grid">
            {features.map((feature, index) => (
              <AnimatedCard
                key={index}
                className="feature-item"
                index={index}
                threshold={0.2}
              >
                <div className="feature-icon-wrapper">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </AnimatedCard>
            ))}
          </div>
        </motion.section>
        
        <motion.section 
          ref={howItWorksAnim.ref}
          className="how-it-works-section"
          initial={howItWorksAnim.initial}
          animate={howItWorksAnim.controls}
        >
          <div className="content-wrapper">
            <h2 className="section-title-centered">Slik Gir Aracanix Deg Oversikt</h2>
            <p className="section-subtitle-centered">
              Fra rådata til handlingsklar innsikt – en sømløs og kraftfull prosess.
            </p>
            <div className="steps-grid">
              <AnimatedCard className="step-item" index={0} threshold={0.3}>
                <div className="step-icon-wrapper"><DatabaseZap size={40} /></div> 
                <h3>1. Datainnsamling & Integrasjon</h3>
                <p>Koble til et bredt spekter av datakilder – API-er, sosiale medier, databaser og filopplastinger. Aracanix sentraliserer din informasjon.</p>
              </AnimatedCard>
              <AnimatedCard className="step-item" index={1} threshold={0.3}>
                <div className="step-icon-wrapper"><Settings2 size={40} /></div>
                <h3>2. Analyse & AI-Modellering</h3>
                <p>Benytt avanserte analyseverktøy og maskinlæring for å bygge prediktive modeller, eller la våre pre-konfigurerte algoritmer gjøre jobben.</p>
              </AnimatedCard>
              <AnimatedCard className="step-item" index={2} threshold={0.3}>
                <div className="step-icon-wrapper"><Eye size={40} /></div>
                <h3>3. Visualisering & Handling</h3>
                <p>Transformer komplekse resultater til intuitive dashboards og rapporter. Få innsikten du trenger for å ta datadrevne beslutninger.</p>
              </AnimatedCard>
            </div>
          </div>
        </motion.section>

        <motion.section 
          ref={highlight1Anim.ref}
          className="platform-highlight-section light-bg"
          initial={highlight1Anim.initial}
          animate={highlight1Anim.controls}
        >
          <div className="content-wrapper highlight-layout">
            <motion.div 
              className="highlight-text" 
              initial={{ opacity:0, x: -50 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true, amount: 0.4 }} 
              transition={{ duration: 0.7, delay: 0.3, ease:"easeOut" }}
            >
              <span className="highlight-tag">Dataintegrasjon</span>
              <h2>Koble til Verden av Data</h2>
              <p>Aracanix' fleksible arkitektur lar deg sømløst integrere data fra Twitter-feeds, finansielle API-er, sportsresultater, dine egne databaser, og mye mer. Alt på ett sted, klart for analyse.</p>
              <ul>
                <li><CheckCircle size={20} className="list-check-icon" /> Sanntids datastrømmer</li>
                <li><CheckCircle size={20} className="list-check-icon" /> Planlagt innhenting</li>
                <li><CheckCircle size={20} className="list-check-icon" /> Støtte for diverse API-formater</li>
              </ul>
            </motion.div>
            <motion.div 
              className="highlight-visual" 
              initial={{ opacity:0, scale: 0.8 }} 
              whileInView={{ opacity: 1, scale: 1 }} 
              viewport={{ once: true, amount: 0.4 }} 
              transition={{ duration: 0.7, delay: 0.5, ease:"easeOut" }}
            >
              <img src="/placeholder-visual-1.svg" alt="Dataintegrasjon illustrasjon" />
            </motion.div>
          </div>
        </motion.section>

        <motion.section 
          ref={highlight2Anim.ref}
          className="platform-highlight-section dark-bg"
          initial={highlight2Anim.initial}
          animate={highlight2Anim.controls}
        >
          <div className="content-wrapper highlight-layout reversed">
            <motion.div 
              className="highlight-visual" 
              initial={{ opacity:0, scale: 0.8 }} 
              whileInView={{ opacity: 1, scale: 1 }} 
              viewport={{ once: true, amount: 0.4 }} 
              transition={{ duration: 0.7, delay: 0.5, ease:"easeOut" }}
            >
               <img src="/placeholder-visual-2.svg" alt="AI Modellering illustrasjon" />
            </motion.div>
            <motion.div 
              className="highlight-text" 
              initial={{ opacity:0, x: 50 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true, amount: 0.4 }} 
              transition={{ duration: 0.7, delay: 0.3, ease:"easeOut" }}
            >
              <span className="highlight-tag">AI & Maskinlæring</span>
              <h2>Bygg Fremtidens Modeller</h2>
              <p>Enten du er en erfaren data scientist eller nybegynner, gir Aracanix deg verktøyene for å lage, trene og validere kraftfulle AI-modeller. Utforsk mønstre, prediker utfall og automatiser komplekse analyser.</p>
              <ul>
                <li><CheckCircle size={20} className="list-check-icon" /> Intuitivt modellbygger-grensesnitt</li>
                <li><CheckCircle size={20} className="list-check-icon" /> Støtte for populære ML-rammeverk</li>
                <li><CheckCircle size={20} className="list-check-icon" /> Kontinuerlig modellovervåkning</li>
              </ul>
            </motion.div>
          </div>
        </motion.section>

        <motion.section 
          ref={finalCtaAnim.ref}
          className="final-cta-section"
          initial={finalCtaAnim.initial}
          animate={finalCtaAnim.controls}
        >
          <div className="cta-content-wrapper">
            <h2>Klar for å Ta Kontroll over Dine Data?</h2>
            <p>Bli med i forkant av datadrevet innovasjon. Aracanix gir deg verktøyene.</p>
            <Link to="/sign-up" className="cta-button final-action"> {/* Endret klasse for unik styling */}
              Be om Tilgang Nå
            </Link>
          </div>
        </motion.section>
      </main>

      <footer className="landing-footer">
        <div className="footer-content-wrapper content-wrapper">
          <div className="footer-logo-area">
            <div className="logo">Aracanix</div>
            <p className="footer-tagline">Datadrevet Innsikt & Analyse.</p>
          </div>
          <div className="footer-links">
            <h4>Utforsk</h4>
            <ul>
              <li><Link to="/#features">Funksjoner</Link></li>
              <li><Link to="/#how-it-works">Hvordan det fungerer</Link></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Selskap</h4>
            <ul>
              <li><Link to="/privacy">Personvern</Link></li>
              <li><Link to="/terms">Vilkår</Link></li>
            </ul>
          </div>
          <div className="footer-social">
            <h4>Følg Oss</h4>
            <div className="social-icons">
              <a href="#" aria-label="Twitter" target="_blank" rel="noopener noreferrer"><Twitter size={22} /></a>
              <a href="#" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer"><Linkedin size={22} /></a>
              <a href="#" aria-label="GitHub" target="_blank" rel="noopener noreferrer"><Github size={22} /></a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Aracanix. Alle rettigheter forbeholdt.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;