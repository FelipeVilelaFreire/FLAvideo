document.addEventListener('DOMContentLoaded', () =>     {
    // Pega o token de segurança uma única vez para ser usado nas requisições
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // ===================================================================
    // FUNÇÃO 1: Animação do contador de visualizações no topo da página
    // ===================================================================
    function initViewCounterAnimation() {
        const viewsElement = document.querySelector('.views-count');
        if (!viewsElement) return;

        const text = viewsElement.textContent.trim();
        const match = text.match(/\d+/);
        if (!match) return;

        const target = parseInt(match[0], 10);
        const duration = 1000;
        const startTime = performance.now();

        function animateCount(currentTime) {
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const exponentialProgress = Math.pow(progress, 2);
            const current = Math.floor(exponentialProgress * target);
            viewsElement.textContent = text.replace(/\d+/, current);

            if (progress < 1) {
                requestAnimationFrame(animateCount);
            } else {
                viewsElement.textContent = text;
                viewsElement.classList.add('active');
            }
        }
        requestAnimationFrame(animateCount);
    }

    // ===================================================================
    // FUNÇÃO 2: Rolar a página ao clicar no botão "Play" do banner principal
    // ===================================================================
    function initHeroPlayButtonScroll() {
        const heroPlayButton = document.querySelector('.hero-actions .play-button');
        const targetSection = document.querySelector('.content-section');
        if (heroPlayButton && targetSection) {
            heroPlayButton.addEventListener('click', function(event) {
                event.preventDefault();
                targetSection.scrollIntoView({ behavior: 'smooth' });
            });
        }
    }

    // ===================================================================
    // FUNÇÃO 3: Lógica do botão de Like (Versão correta, sem localStorage)
    // ===================================================================
    function initActionButtons() {

        // --- Funções Auxiliares para o botão de Like ---
        function updateLikeButtonView(button, isActive) {
            if (!button) return;
            button.classList.toggle('ativo', isActive);
            const icon = button.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-solid', isActive);
                icon.classList.toggle('fa-regular', !isActive);
            }
        }

        function applyLikeAnimation(button) {
            const icon = button.querySelector('i');
            if (icon) {
                icon.classList.add('animate-pulse');
                setTimeout(() => icon.classList.remove('animate-pulse'), 400);
            }
        }

        function getEpisodeIdFromButton(button) {
            const episodeCard = button.closest('.episode-card');
            const thumbnailWrapper = episodeCard.querySelector('.thumbnail-wrapper');
            return thumbnailWrapper ? thumbnailWrapper.dataset.episodeId : null;
        }

        // Adiciona o evento de clique diretamente e APENAS aos botões de like
        document.querySelectorAll('.btn-like').forEach(button => {
            button.addEventListener('click', () => {
                const epId = getEpisodeIdFromButton(button);
                if (!epId) return;

                fetch(`/toggle-like/episodio/${epId}/`, {
                    method: 'POST',
                    headers: { 'X-CSRFToken': csrfToken, 'Content-Type': 'application/json' },
                })
                .then(response => {
                    // Trata o caso de usuário não logado
                    if (response.status === 401) {
                        window.location.href = '/login/'; // Redireciona para a página de login
                        return null;
                    }
                    return response.json();
                })
                .then(data => {
                    if (data && data.status === 'ok') {
                        // Se o like foi ativado, aplica a animação de pulso
                        if (data.liked) {
                            applyLikeAnimation(button);
                        }

                        // Atualiza o contador de likes com a resposta do servidor
                        const likeCountSpan = document.getElementById(`like-count-${epId}`);
                        if (likeCountSpan) {
                            likeCountSpan.textContent = data.total_likes;
                        }

                        // Atualiza a aparência do botão com a resposta do servidor
                        updateLikeButtonView(button, data.liked);
                    }
                })
                .catch(error => {
                    // Não faz nada no catch para evitar que a tela do usuário pisque
                    console.error('Erro na requisição de Like:', error)
                });
            });
        });
    }

    // ===================================================================
    // FUNÇÃO 4: Lógica do Player de Vídeo (com funcionalidade de Visualização)
    // ===================================================================
    function initCustomVideoPlayer() {

        const playerOverlay = document.getElementById('player-overlay');
        if (!playerOverlay) return;

        const playerContainer = playerOverlay.querySelector('.meu-player-container');
        const video = playerOverlay.querySelector('#meu-video');
        const playPauseBtn = playerOverlay.querySelector('#play-pause-btn');
        const rewindBtn = playerOverlay.querySelector('#rewind-btn');
        const forwardBtn = playerOverlay.querySelector('#forward-btn');
        const progressBar = playerOverlay.querySelector('#progress-bar');
        const muteBtn = playerOverlay.querySelector('#mute-btn');
        const volumeBar = playerOverlay.querySelector('#volume-bar');
        const fullscreenBtn = playerOverlay.querySelector('#fullscreen-btn');
        const closePlayerBtn = playerOverlay.querySelector('#close-player-btn');
        const currentTimeEl = playerOverlay.querySelector('#current-time');
        const durationEl = playerOverlay.querySelector('#duration');
        const episodeClickables = document.querySelectorAll('.thumbnail-wrapper');

        // --- FUNÇÃO DE VISUALIZAÇÃO ---
        // Esta função envia a requisição para o servidor para contar a visualização.
        function registrarVisualizacao(episodeId) {
            if (!episodeId || !csrfToken) return;
            fetch(`/registrar-visualizacao/episodio/${episodeId}/`, {
                method: 'POST',
                headers: { 'X-CSRFToken': csrfToken, 'Content-Type': 'application/json' }
            })
            .then(res => res.json())
            .then(data => {
                if(data.status === 'ok') {
                    console.log('Visualização registrada:', data.visualizacoes_episodio);
                }
            });
        }

        function openCustomPlayer(videoSrc, episodeId) {
            if (!videoSrc) { alert('Vídeo não disponível.'); return; }
            document.body.classList.add('body-no-scroll');
            video.src = videoSrc;
            playerOverlay.classList.add('visible');
            video.play();
            // A visualização é registrada assim que o player abre
            registrarVisualizacao(episodeId);
        }

        function closeCustomPlayer() {
            document.body.classList.remove('body-no-scroll');
            video.pause();
            video.src = "";
            playerOverlay.classList.remove('visible');
        }

        function togglePlayPause() { video.paused ? video.play() : video.pause(); }

        function updatePlayIcon() {
            const icon = playPauseBtn.querySelector('i');
            icon.classList.toggle('fa-play', video.paused);
            icon.classList.toggle('fa-pause', !video.paused);
            playerContainer.classList.toggle('paused', video.paused);
        }

        function formatTime(time) {
            const minutes = Math.floor(time / 60);
            const seconds = Math.floor(time % 60);
            return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }

        function updateProgress() {
            const progress = (video.currentTime / video.duration) * 100;
            progressBar.style.setProperty('--progress', `${progress}%`);
            progressBar.value = isNaN(progress) ? 0 : progress;
            currentTimeEl.textContent = formatTime(video.currentTime);
        }

        function setVideoProgress() { video.currentTime = (progressBar.value / 100) * video.duration; }
        function seekBackward() { video.currentTime -= 10; }
        function seekForward() { video.currentTime += 10; }
        function toggleMute() { video.muted = !video.muted; }

        function updateMuteIcon() {
            const icon = muteBtn.querySelector('i');
            volumeBar.style.setProperty('--volume', `${video.volume * 100}%`);
            if (video.muted || video.volume === 0) {
                icon.classList.remove('fa-volume-high', 'fa-volume-low');
                icon.classList.add('fa-volume-xmark');
            } else if (video.volume < 0.5) {
                icon.classList.remove('fa-volume-high', 'fa-volume-xmark');
                icon.classList.add('fa-volume-low');
            } else {
                icon.classList.remove('fa-volume-low', 'fa-volume-xmark');
                icon.classList.add('fa-volume-high');
            }
        }

        function setVolume() { video.volume = volumeBar.value; }

        function toggleFullscreen() {
            const icon = fullscreenBtn.querySelector('i');
            if (!document.fullscreenElement) {
                playerContainer.requestFullscreen ? playerContainer.requestFullscreen() : playerContainer.webkitRequestFullscreen();
                icon.classList.remove('fa-expand');
                icon.classList.add('fa-compress');
            } else {
                document.exitFullscreen ? document.exitFullscreen() : document.webkitExitFullscreen();
                icon.classList.remove('fa-compress');
                icon.classList.add('fa-expand');
            }
        }

        // --- Conexão dos Eventos do Player ---
        episodeClickables.forEach(el => el.addEventListener('click', () => openCustomPlayer(el.dataset.videoSrc, el.dataset.episodeId)));
        closePlayerBtn.addEventListener('click', closeCustomPlayer);
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && playerOverlay.classList.contains('visible')) closeCustomPlayer(); });

        playPauseBtn.addEventListener('click', togglePlayPause);
        rewindBtn.addEventListener('click', seekBackward);
        forwardBtn.addEventListener('click', seekForward);
        muteBtn.addEventListener('click', toggleMute);
        fullscreenBtn.addEventListener('click', toggleFullscreen);
        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement) {
                fullscreenBtn.querySelector('i').classList.remove('fa-compress');
                fullscreenBtn.querySelector('i').classList.add('fa-expand');
            }
        });

        volumeBar.addEventListener('input', setVolume);
        progressBar.addEventListener('input', setVideoProgress);

        video.addEventListener('play', updatePlayIcon);
        video.addEventListener('pause', updatePlayIcon);
        video.addEventListener('timeupdate', updateProgress);
        video.addEventListener('volumechange', updateMuteIcon);
        video.addEventListener('loadedmetadata', () => {
            durationEl.textContent = formatTime(video.duration);
            updateProgress();
            updateMuteIcon();
        });
    }

    // --- INICIALIZAÇÃO DE TODAS AS FUNÇÕES ---
    initViewCounterAnimation();
    initHeroPlayButtonScroll();
    initActionButtons();
    initCustomVideoPlayer();
});