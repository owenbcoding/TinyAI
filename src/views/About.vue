<template>
  <section class="about-section">
    <div class="container">
      <h1><i class="fas fa-info-circle"></i> About Tiny AI</h1>
      <div class="about-content">
        <p>
          Tiny AI Resources is a curated collection of AI papers, repositories, and models.
          Our Discord bot automatically adds new resources via pull requests.
        </p>
        <div class="features">
          <div class="feature-card">
            <i class="fas fa-file-alt"></i>
            <h3>Research Papers</h3>
            <p>Curated collection of groundbreaking AI research</p>
          </div>
          <div class="feature-card">
            <i class="fab fa-github"></i>
            <h3>Open Source</h3>
            <p>Community-driven repositories and tools</p>
          </div>
          <div class="feature-card">
            <i class="fas fa-robot"></i>
            <h3>AI Models</h3>
            <p>Pre-trained models on Hugging Face</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about-section {
  padding: 100px 2rem 80px;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
}

h1 {
  font-size: 2.5rem;
  color: var(--hf-yellow);
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.about-content {
  background: var(--card-bg);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  padding: 2rem;
}

.about-content > p {
  font-size: 1.1rem;
  line-height: 1.8;
  margin-bottom: 2rem;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.feature-card {
  background: rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
  border-radius: var(--radius-md);
  text-align: center;
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card i {
  font-size: 2.5rem;
  color: var(--hf-yellow);
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.feature-card p {
  font-size: 0.9rem;
  color: var(--text-muted);
}
</style>
