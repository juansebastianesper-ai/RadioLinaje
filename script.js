document.addEventListener('DOMContentLoaded', () => {
    // Seleccionamos los elementos de la interfaz
    const audioStream = document.getElementById('audio-stream');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const btnIcon = document.getElementById('btn-icon');
    const statusText = document.getElementById('status-text');

    // Guardamos la URL original del stream
    const originalStreamUrl = audioStream.src;

    playPauseBtn.addEventListener('click', () => {
        if (audioStream.paused) {
            // Estado: Conectando
            statusText.textContent = 'Conectando...';

            // Restauramos la URL original del stream (sin parámetros extra,
            // Icecast no los reconoce y rompe la conexión) y forzamos
            // la reconexión con .load()
            audioStream.src = originalStreamUrl;
            audioStream.load();

            // Iniciar reproducción
            audioStream.play()
                .then(() => {
                    btnIcon.textContent = '⏸';
                    playPauseBtn.classList.add('playing');
                    statusText.textContent = 'Sonando en vivo';
                })
                .catch((error) => {
                    console.error('Error de reproducción:', error);
                    statusText.textContent = 'Error al conectar';
                });
        } else {
            // Estado: Pausado
            audioStream.pause();

            /* Limpiar la fuente detiene la descarga de datos en segundo plano,
               ahorrando internet al usuario cuando la radio está pausada. */
            audioStream.src = '';

            btnIcon.textContent = '▶';
            playPauseBtn.classList.remove('playing');
            statusText.textContent = 'Listo para reproducir';
        }
    });

    // Eventos adicionales para cuando el internet del usuario esté lento
    audioStream.addEventListener('waiting', () => {
        statusText.textContent = 'Cargando buffer...';
    });

    audioStream.addEventListener('playing', () => {
        statusText.textContent = 'Sonando en vivo';
    });
});

// Registrar el Service Worker para la PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('ServiceWorker registrado con éxito:', registration.scope);
            })
            .catch(error => {
                console.log('Error al registrar el ServiceWorker:', error);
            });
    });
}