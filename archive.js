document.addEventListener('DOMContentLoaded', () => {
    // Reveal elements on scroll (reuse logic from main script)
    const revealElements = document.querySelectorAll('.reveal');

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const revealPoint = 50;

        revealElements.forEach(el => {
            const revealTop = el.getBoundingClientRect().top;
            if (revealTop < windowHeight - revealPoint) {
                el.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Trigger once on load

    // Filter Logic
    const filterBtns = document.querySelectorAll('.filter-bar .tag');
    const episodeItems = document.querySelectorAll('.episode-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            filterBtns.forEach(b => b.classList.remove('tag-active'));
            // Add active class to clicked
            btn.classList.add('tag-active');

            const filterValue = btn.getAttribute('data-filter');

            episodeItems.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // Audio Player Simulation
    const playBtns = document.querySelectorAll('.player-circle, .btn-play');
    const stickyPlayer = document.getElementById('stickyPlayer');
    const closePlayerBtn = document.querySelector('.close-player');
    const playingTitle = document.getElementById('playingTitle');

    playBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Simulate starting playback
            stickyPlayer.style.display = 'block';

            // Get title relative to clicked button
            let title = "もやもや話 録音データ";
            const card = e.target.closest('.featured-episode') || e.target.closest('.episode-item');

            if (card) {
                const titleEl = card.querySelector('.episode-title') || card.querySelector('.episode-title-small');
                if (titleEl) {
                    title = titleEl.textContent;
                }
            }

            playingTitle.textContent = title;
        });
    });

    closePlayerBtn.addEventListener('click', () => {
        stickyPlayer.style.display = 'none';
    });
});
