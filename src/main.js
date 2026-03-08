import './style.css'

function createSpaceCard(space) {
  const card = document.createElement('div');
  card.className = 'space-card';
  card.style.opacity = '0';
  card.style.transform = 'translateY(20px)';

  const audioHtml = space.audioFile ? `
    <div class="audio-player">
      <audio controls src="${space.audioFile}" style="width: 100%; height: 36px; border-radius: 18px; outline: none;"></audio>
    </div>` : `
    <span class="listen-btn">
      <a href="${space.url}" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: none; display: flex; align-items: center; gap: 0.5rem;">
        Xで聴く
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </a>
    </span>`;

  card.innerHTML = `
    <div class="card-date">${space.date}</div>
    <h3 class="card-title">${space.title}</h3>
    <p class="card-desc">${space.description}</p>
    <div class="card-footer" style="flex-direction: column; align-items: flex-start; gap: 1rem;">
      ${audioHtml}
      <span class="duration" style="align-self: flex-end;">${space.duration || ''}</span>
    </div>
  `;

  return card;
}

async function fetchSpaces() {
  try {
    const response = await fetch('http://localhost:3000/api/spaces');
    if (!response.ok) throw new Error('Failed to fetch');
    return await response.json();
  } catch (error) {
    console.error('Error fetching spaces:', error);
    return [];
  }
}

async function renderSpaces() {
  const container = document.getElementById('spaces-container');
  if (!container) return;

  const spacesData = await fetchSpaces();

  if (spacesData.length === 0) {
    container.innerHTML = '<p style="color: var(--color-text-muted); text-align: center; grid-column: 1/-1;">現在表示できるスペースはありません。<br><a href="/admin.html" style="color: var(--color-primary); text-decoration: none; margin-top: 1rem; display: inline-block;">管理画面から追加してください</a></p>';
    return;
  }

  container.innerHTML = ''; // prevent duplicates if called multiple times

  spacesData.forEach((space, index) => {
    const card = createSpaceCard(space);
    container.appendChild(card);

    // Staggered entry animation with Intersection Observer would be better,
    // but a simple timeout creates a nice load effect for the initial view.
    setTimeout(() => {
      // Need to reset the inline transform to empty so the CSS hover transform works
      card.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      card.style.opacity = '1';
      card.style.transform = '';
    }, 100 * index + 300);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderSpaces();
});
