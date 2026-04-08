<template>
  <section class="home-page">
    <div class="home-shell">
      <section class="hero-section" aria-labelledby="home-title">
        <div class="logo-frame">
          <img
            :src="logoSrc"
            alt="Tiny AI logo"
            class="hero-logo"
            @error="handleLogoError"
          />
        </div>

        <h1 id="home-title" class="hero-title">
          <span class="hero-title-main">TINY</span>
          <span class="hero-title-accent"> AI</span>
        </h1>

        <p class="hero-tagline">LOW NOISE · HIGH BANDWIDTH</p>

        <p class="hero-description">
          A small, invite-only community of developers pushing the edge of AI
          research. We curate what matters - papers, tools, repos - and share it
          here.
        </p>

        <div class="hero-actions">
          <a
            class="action-button action-button-primary"
            href="https://github.com/TheTinyAIServer"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub Org
          </a>
          <router-link class="action-button action-button-secondary" to="/resources">
            Browse Resources
          </router-link>
        </div>
      </section>

      <section id="about" class="about-section" aria-labelledby="about-title">
        <p class="section-label">About</p>
        <h2 id="about-title">What we do</h2>

        <p>
          We share papers, tools, and repositories that pass a simple bar:
          clear, useful, and worth your time. The public site is a snapshot of
          what we collect together - nothing is feed-driven noise.
        </p>

        <p>
          Resources and repos are added through Discord and pull requests. If
          you are already in the community, open a PR; if not, the GitHub org
          still lists projects we stand behind.
        </p>

        <ul class="highlights">
          <li>Curated papers and community links</li>
          <li>Tools and repos we actually use</li>
          <li>Quality over growth - invite-only Discord</li>
        </ul>

        <div class="community-pill-wrap">
          <p class="community-pill">
            <span class="community-dot"></span>
            Invite-only · Discord community
          </p>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { getSeason, seasonLogoSrc } from '../utils/season'

const logoSrc = ref(seasonLogoSrc(getSeason()))

function handleLogoError() {
  logoSrc.value = `${import.meta.env.BASE_URL}tiny-ai-logo.svg`
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  padding: 108px 1.5rem 80px;
}

.home-shell {
  max-width: 720px;
  margin: 0 auto;
}

.hero-section {
  min-height: min(70vh, 760px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.logo-frame {
  position: relative;
  margin-bottom: 1.75rem;
}

.logo-frame::before {
  content: '';
  position: absolute;
  inset: -18%;
  border-radius: 1.5rem;
  background: radial-gradient(circle at center, rgba(251, 140, 101, 0.35), transparent 68%);
  filter: blur(18px);
}

.hero-logo {
  position: relative;
  width: 128px;
  height: 128px;
  border-radius: 1rem;
  box-shadow: 0 18px 40px rgba(38, 21, 67, 0.28);
}

.hero-title {
  margin: 0 0 0.75rem;
  font-size: clamp(3rem, 10vw, 4.25rem);
  line-height: 0.95;
  letter-spacing: -0.04em;
}

.hero-title-main {
  color: var(--brand-cream, #f5da99);
}

.hero-title-accent {
  color: #fb8c65;
  text-shadow: 0 0 24px rgba(251, 140, 101, 0.2);
}

.hero-tagline {
  margin: 0 0 1.5rem;
  font-size: 0.72rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.hero-description {
  max-width: 34rem;
  margin: 0 0 2rem;
  font-size: 1.05rem;
  line-height: 1.75;
  color: var(--text-secondary);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
}

.action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 11rem;
  padding: 0.8rem 1.4rem;
  border-radius: 0.75rem;
  border: 1px solid transparent;
  font-size: 0.95rem;
  font-weight: 600;
  transition: transform var(--transition-base), box-shadow var(--transition-base), background var(--transition-base), border-color var(--transition-base), color var(--transition-base);
}

.action-button:hover {
  transform: translateY(-1px);
}

.action-button-primary {
  background: #fb8c65;
  color: #261543;
  box-shadow: 0 10px 24px rgba(251, 140, 101, 0.22);
}

.action-button-primary:hover {
  box-shadow: 0 14px 28px rgba(251, 140, 101, 0.28);
}

.action-button-secondary {
  background: rgba(84, 60, 129, 0.14);
  border-color: rgba(90, 58, 134, 0.2);
  color: var(--text-primary);
}

.action-button-secondary:hover {
  background: rgba(84, 60, 129, 0.2);
}

.about-link {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.about-link:hover {
  color: #fb8c65;
}

.about-section {
  max-width: 34rem;
  margin: 0 auto;
  padding-top: 2rem;
  border-top: 1px solid var(--border-primary);
}

.section-label {
  margin: 0 0 0.35rem;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #fb8c65;
}

.about-section h2 {
  margin: 0 0 1rem;
  font-size: 1.55rem;
  line-height: 1.2;
  color: var(--text-primary);
}

.about-section p,
.highlights {
  color: var(--text-secondary);
}

.about-section p {
  margin: 0 0 1rem;
  line-height: 1.75;
}

.highlights {
  margin: 1.25rem 0 0;
  padding-left: 1.2rem;
  line-height: 1.8;
  list-style: disc;
}

.highlights li {
  margin-bottom: 0.35rem;
}

.community-pill-wrap {
  margin-top: 2.5rem;
  text-align: center;
}

.community-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 0;
  padding: 0.45rem 0.95rem;
  border: 1px solid var(--border-primary);
  border-radius: 999px;
  font-size: 0.78rem;
  color: var(--text-secondary);
}

.community-dot {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 50%;
  background: #fb8c65;
}

@media (max-width: 768px) {
  .home-page {
    padding-top: 96px;
  }

  .hero-section {
    min-height: auto;
    padding-top: 1rem;
  }

  .hero-description {
    font-size: 1rem;
  }

  .hero-actions {
    width: 100%;
  }

  .action-button {
    width: 100%;
  }
}

[data-theme="dark"] .action-button-secondary {
  background: rgba(26, 15, 36, 0.35);
  border-color: var(--border-primary);
}
</style>
