

// Button Click Sound Effect - Play on ANY click
function addButtonClickSound() {
    document.addEventListener('click', function(e) {
        try {
            const clickSound = new Audio('click.mp3');
            clickSound.volume = 0.5;
            clickSound.play();
        } catch (error) {
            // Silently fail
        }
    }, false);
}

// IntersectionObserver to reveal elements with the `fade-part` class
document.addEventListener('DOMContentLoaded', function () {
    addButtonClickSound();
    // Auto-mark common divider elements to fade (so no HTML edits required)
    const dividerSelectors = ['hr', '.section-sep', '.divider-line'];
    dividerSelectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => {
            if (!el.classList.contains('fade-part')) el.classList.add('fade-part');
            if (!el.classList.contains('fade-line')) el.classList.add('fade-line');
        });
    });

    const parts = Array.from(document.querySelectorAll('.fade-part'));
    if (parts.length === 0) return;

    let observer;
    if ('IntersectionObserver' in window) {
        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const el = entry.target;
                if (entry.isIntersecting) {
                    if (!el.style.getPropertyValue('--delay')) {
                        const index = parts.indexOf(el);
                        const stagger = Math.min(0.12 * index, 0.6);
                        el.style.setProperty('--delay', stagger + 's');
                    }
                    el.classList.add('in-view');
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.12 });

        parts.forEach(p => observer.observe(p));
    }

    // Animate visible parts on initial load (so refresh shows animations)
    function animateOnLoad() {
        const visible = parts.filter(p => {
            const r = p.getBoundingClientRect();
            return r.top < window.innerHeight && r.bottom > 0;
        });
        visible.forEach((el, i) => {
            if (!el.style.getPropertyValue('--delay')) el.style.setProperty('--delay', (i * 0.12) + 's');
            el.classList.add('in-view');
            if (observer) observer.unobserve(el);
        });
    }
    setTimeout(animateOnLoad, 80);

    // Replay animations when user clicks (ignores clicks on links to preserve navigation)
    let isReplaying = false;
    function replayAnimations() {
        if (isReplaying) return;
        isReplaying = true;
        const els = parts.slice();
        els.forEach(el => el.classList.remove('in-view'));
        // force reflow
        void document.body.offsetWidth;
        els.forEach((el, i) => {
            const delay = Math.min(0.08 * i, 0.8);
            el.style.setProperty('--delay', delay + 's');
            // add back the class to trigger the animation
            el.classList.add('in-view');
        });
        const lastDelay = Math.min(0.08 * (els.length - 1), 0.8);
        const total = (lastDelay + 0.9) * 1000;
        setTimeout(() => { isReplaying = false; }, total);
    }

    document.addEventListener('click', function (e) {
        if (e.target.closest('a')) return; // ignore link clicks
        replayAnimations();
    });

    const introOverlay = document.getElementById('introOverlay');
    const introClose = document.getElementById('introClose');
    const skipIntro = document.getElementById('skipIntro');
    const introVideo = document.getElementById('introVideo');

    function hideIntro() {
        if (!introOverlay) return;
        introOverlay.classList.add('intro-hidden');
        document.body.classList.remove('no-scroll');
        if (introVideo && !introVideo.paused) {
            introVideo.pause();
        }
    }

    function showIntro() {
        if (!introOverlay) return;
        introOverlay.classList.remove('intro-hidden');
        document.body.classList.add('no-scroll');
    }

    if (introOverlay) {
        showIntro();
        if (introVideo) {
            const playPromise = introVideo.play();
            if (playPromise && typeof playPromise.then === 'function') {
                playPromise.catch(() => {
                    introVideo.muted = true;
                    introVideo.play().catch(() => {});
                });
            }
            introVideo.addEventListener('ended', hideIntro);
        }
    }

    if (introClose) introClose.addEventListener('click', hideIntro);
    if (skipIntro) skipIntro.addEventListener('click', hideIntro);
    if (introOverlay) {
        introOverlay.addEventListener('click', function (event) {
            if (event.target === introOverlay) hideIntro();
        });
    }
});

// Smooth-scroll to top when the "Home" link is clicked
document.addEventListener('DOMContentLoaded', function () {
    const homeLink = document.querySelector('a[href="#top"]');
    if (!homeLink) return;
    homeLink.addEventListener('click', function (e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (history && history.replaceState) history.replaceState(null, '', '#top');
    });
});
