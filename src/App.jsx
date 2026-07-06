import { useState, useMemo, useEffect } from 'react'
import { motion } from 'motion/react'
import Masonry from './Masonry'
import { useVideoAspects } from './useVideoAspects'
import cards from './card-info'
import tags, { IconAll } from './tags-info'
import SideRays from './SideRays'
import SplitText from './SplitText'
import ShinyText from './ShinyText'
import Dock from './Dock'
import { useSideRaysProvider } from './SideRaysContext'
import t from './i18n'
import './App.css'

const allTagsBase = [{ id: null, icon: <IconAll /> }, ...tags]

/* ── Language slider toggle ───────────────────────────────── */
function LangSwitch({ lang, onChange }) {
  const isRu = lang === 'ru'
  return (
    <button
      className="lang-switch"
      onClick={() => onChange(isRu ? 'en' : 'ru')}
      aria-label={`Switch language, current: ${lang.toUpperCase()}`}
      role="switch"
      aria-checked={isRu}
    >
      <span className="lang-switch__track">
        <motion.span
          className="lang-switch__thumb"
          animate={{ left: isRu ? 'calc(50%)' : '4px' }}
          transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.7 }}
        />
        <span className={`lang-switch__label lang-switch__label--en${!isRu ? ' lang-switch__label--active' : ''}`}>
          EN
        </span>
        <span className={`lang-switch__label lang-switch__label--ru${isRu ? ' lang-switch__label--active' : ''}`}>
          RU
        </span>
      </span>
    </button>
  )
}

/* ── Scroll to top ────────────────────────────────────────── */
function ScrollToTop() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <button
      className={`scroll-to-top${visible ? ' scroll-to-top--visible' : ''}`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll to top"
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M9 14V4M4 9l5-5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  )
}

/* ── App ──────────────────────────────────────────────────── */
export default function App() {
  const [selectedTag, setSelectedTag] = useState(null)
  const [lang, setLang] = useState('en')
  const { Provider, publishRef, contextValue } = useSideRaysProvider()
  const i18n = t[lang]

  // Localized tag items
  const allTagItems = useMemo(() =>
    allTagsBase.map(tag => ({
      ...tag,
      label: i18n.tags[tag.id ?? 'All'],
    })),
    [i18n]
  )

  const filteredCards = useMemo(() => {
    if (!selectedTag) return cards
    return cards.filter(card => card.tags && card.tags.includes(selectedTag))
  }, [selectedTag])

  const items = useVideoAspects(filteredCards)

  // Apply translations to resolved items — title is now { en, ru } object
  const translatedItems = useMemo(() =>
    items.map(item => ({
      ...item,
      title: item.title?.[lang] ?? item.title?.en ?? String(item.title),
    })),
    [items, lang]
  )

  return (
    <>
    <Provider value={contextValue}>
    <div className="page">

      {/* ── Background rays ───────────────────────────────── */}
      <div className="bg-rays">
        <SideRays
          speed={0.8}
          rayColor1="#d4d2cc"
          rayColor2="#b8a878"
          intensity={3.5}
          spread={1.6}
          origin="top-left"
          tilt={0}
          saturation={0.7}
          blend={0.5}
          falloff={0.7}
          opacity={1.0}
          followMouse={true}
          mouseTiltRange={12}
          publishRef={publishRef}
        />
      </div>

      <div className="inner">

        {/* ── About ─────────────────────────────────────────── */}
        <section className="about">
          <div className="about__avatar" aria-hidden="true" />
          <div className="about__text">
            <SplitText
              tag="h1"
              text={i18n.name}
              className="about__name"
              splitType="chars"
              delay={40}
              duration={0.7}
              ease="power3.out"
              from={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
              to={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              threshold={0.2}
              rootMargin="0px"
              textAlign="left"
            />
            <SplitText
              tag="p"
              text={i18n.bio}
              className="about__bio"
              splitType="words"
              delay={18}
              duration={0.6}
              ease="power2.out"
              from={{ opacity: 0, y: 12 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.2}
              rootMargin="0px"
              textAlign="left"
            />
          </div>
          <LangSwitch lang={lang} onChange={setLang} />
        </section>

        {/* ── Tags ──────────────────────────────────────────── */}
        <section className="tags" aria-label={i18n.filter}>
          <Dock
            items={allTagItems.map((tag, i) => ({
              label: tag.label,
              icon: (
                <button
                  key={tag.id ?? 'all'}
                  className={`tag-btn${selectedTag === tag.id ? ' tag-btn--active' : ''}`}
                  onClick={() => setSelectedTag(tag.id)}
                  aria-pressed={selectedTag === tag.id}
                >
                  <span className="tag-pill">
                    {tag.icon && (
                      <span
                        className="tag-icon"
                        aria-hidden="true"
                        style={{ color: selectedTag === tag.id ? '#e8e4dc' : '#b0aea8' }}
                      >
                        {tag.icon}
                      </span>
                    )}
                    <ShinyText
                      text={tag.label}
                      color={selectedTag === tag.id ? '#e8e4dc' : '#b0aea8'}
                      shineColor="#e8e4dc"
                      speed={3.5}
                      delay={i * 0.3}
                      spread={100}
                      direction="left"
                      pauseOnHover={true}
                      className="tag-text"
                    />
                  </span>
                </button>
              ),
            }))}
            baseItemSize={38}
            magnification={50}
            distance={120}
            spring={{ mass: 0.1, stiffness: 180, damping: 14 }}
            className="tags-dock"
          />
        </section>

        {/* ── Masonry ───────────────────────────────────────── */}
        <section aria-label="Portfolio">
          <Masonry
            items={translatedItems}
            lang={lang}
            ease="power3.out"
            duration={0.6}
            blurToFocus={true}
          />
        </section>

      </div>
    </div>
    </Provider>
    <ScrollToTop />
    </>
  )
}
