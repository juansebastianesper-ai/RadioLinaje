document.addEventListener('DOMContentLoaded', () => {
    const audioStream = document.getElementById('audio-stream');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const btnIcon = document.getElementById('btn-icon');
    const statusText = document.getElementById('status-text');

    const originalStreamUrl = audioStream.src;
    let retryTimeout = null;
    let retryCount = 0;
    const MAX_RETRIES = 5;
    const RETRY_DELAY = 3000;

    function setStatus(text, className) {
        statusText.textContent = text;
        statusText.className = className || '';
    }

    function setPlaying() {
        btnIcon.textContent = '⏸';
        playPauseBtn.classList.add('playing');
        playPauseBtn.classList.remove('loading');
        setStatus('Sonando en vivo');
        retryCount = 0;
        updateMediaSession(true);
    }

    function setPaused() {
        btnIcon.textContent = '▶';
        playPauseBtn.classList.remove('playing', 'loading');
        setStatus('Listo para reproducir');
        cancelRetry();
        updateMediaSession(false);
    }

    function setLoading() {
        btnIcon.textContent = '⟳';
        playPauseBtn.classList.add('loading');
        playPauseBtn.classList.remove('playing');
        setStatus('Conectando...', 'connecting');
    }

    function setError(message) {
        btnIcon.textContent = '⚠';
        playPauseBtn.classList.remove('playing', 'loading');
        setStatus(message, 'error');
    }

    function startStream() {
        setLoading();
        audioStream.src = originalStreamUrl;
        audioStream.load();

        audioStream.play()
            .then(() => setPlaying())
            .catch((error) => {
                console.error('Error de reproducción:', error);
                scheduleRetry();
            });
    }

    function stopStream() {
        audioStream.pause();
        audioStream.src = '';
        setPaused();
    }

    function scheduleRetry() {
        if (retryCount >= MAX_RETRIES) {
            setError(`No se pudo conectar. Toca para reintentar.`);
            return;
        }
        retryCount++;
        const delay = RETRY_DELAY * retryCount;
        setError(`Reconectando... (${retryCount}/${MAX_RETRIES})`);
        playPauseBtn.classList.add('loading');
        retryTimeout = setTimeout(() => startStream(), delay);
    }

    function cancelRetry() {
        if (retryTimeout) {
            clearTimeout(retryTimeout);
            retryTimeout = null;
        }
        retryCount = 0;
    }

    playPauseBtn.addEventListener('click', () => {
        cancelRetry();
        if (audioStream.paused) {
            startStream();
        } else {
            stopStream();
        }
    });

    audioStream.addEventListener('waiting', () => {
        setStatus('Cargando buffer...', 'connecting');
    });

    audioStream.addEventListener('playing', () => {
        setPlaying();
    });

    audioStream.addEventListener('error', () => {
        scheduleRetry();
    });

    // MediaSession API - controles nativos del sistema
    function updateMediaSession(isPlaying) {
        if (!('mediaSession' in navigator)) return;

        navigator.mediaSession.metadata = new MediaMetadata({
            title: 'RadioLinaje',
            artist: 'Transmisión en Vivo',
            album: 'RadioLinaje Web',
            artwork: [
                { src: 'logo.png', sizes: 'any', type: 'image/png' }
            ]
        });

        navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

        navigator.mediaSession.setActionHandler('play', () => {
            if (audioStream.paused) startStream();
        });

        navigator.mediaSession.setActionHandler('pause', () => {
            if (!audioStream.paused) stopStream();
        });

        navigator.mediaSession.setActionHandler('stop', () => stopStream());
    }

    // Inicializar MediaSession
    updateMediaSession(false);
});

// Registrar Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('SW registrado:', reg.scope))
            .catch(err => console.log('Error SW:', err));
    });
}
