
//Numero de visualizacoes aumentar ao entrar na pagina
document.addEventListener('DOMContentLoaded', () => {
    const viewsElement = document.querySelector('.views-count');
    if (!viewsElement) return;

    const text = viewsElement.textContent.trim();
    const match = text.match(/\d+/);
    if (!match) return;

    const target = parseInt(match[0], 10);
    let current = 0;
    const duration = 1000; // Reduced to 1 second for faster animation
    const startTime = performance.now();

    function animateCount(currentTime) {
        const progress = Math.min((currentTime - startTime) / duration, 1); // Progress from 0 to 1
        // Exponential curve: progress squared for acceleration
        const exponentialProgress = Math.pow(progress, 2); // Starts slow, speeds up exponentially
        current = Math.floor(exponentialProgress * target);
        viewsElement.textContent = `${text.replace(/\d+/, current)}`;

        if (progress < 1) {
            requestAnimationFrame(animateCount);
        } else {
            viewsElement.textContent = text; // Ensure it ends exactly at the target
            viewsElement.classList.add('active'); // Apply final styling
        }
    }

    requestAnimationFrame(animateCount);
})

//Butao play destaque
document.addEventListener('DOMContentLoaded', function() {
    // 1. Seleciona o botão "Play" que está na seção hero
    const heroPlayButton = document.querySelector('.hero-actions .play-button');

    // 2. Seleciona a seção de conteúdo para onde queremos rolar a página
    const targetSection = document.querySelector('.content-section');

    // 3. Verifica se os dois elementos existem na página para evitar erros
    if (heroPlayButton && targetSection) {

        // 4. Adiciona um "ouvinte" que espera pelo clique no botão
        heroPlayButton.addEventListener('click', function(event) {

            // 5. Previne o comportamento padrão do link (que é ir para a página inicial)
            event.preventDefault();

            // 6. Rola a página suavemente até o topo da seção de destino
            targetSection.scrollIntoView({
                behavior: 'smooth'
            });
        });
    }
});


// Entrar nos videos
document.addEventListener('DOMContentLoaded', function () {
    const episodeClickables = document.querySelectorAll('.episode-thumbnail, .button-play');
    let fullscreenVideo = null;

    // --- NOVA FUNÇÃO AJAX ---
    // Esta função envia o "aviso" de visualização para o Django
    function registrarVisualizacao(episodeId) {
        const url = `/registrar-visualizacao/episodio/${episodeId}/`;
        // Pega o token de segurança que colocamos no HTML
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

        // "Dispare e esqueça": o JS envia a requisição e não precisa esperar a resposta
        fetch(url, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken,
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            // Apenas para nosso controle, podemos ver a resposta no console do navegador
            console.log('Resposta do registro de visualização:', data);
        })
        .catch(error => {
            console.error('Erro na chamada AJAX:', error);
        });
    }

    // Adiciona o evento de clique nos botões e miniaturas dos episódios
    episodeClickables.forEach(element => {
        element.addEventListener('click', function () {
            const parent = this.closest('.thumbnail-wrapper');
            const thumbnail = parent.querySelector('.episode-thumbnail');
            const videoIdAttribute = thumbnail.getAttribute('data-video-id'); // ex: "video-42"
            const videoElement = document.getElementById(videoIdAttribute);

            // Extrai apenas o número do ID do episódio (ex: "42")
            const episodeId = videoIdAttribute.split('-')[1];

            if (videoElement && episodeId) {

                // --- CHAMADA AJAX ACONTECE AQUI! ---
                // Assim que o usuário clica, chamamos nossa função para registrar a view.
                registrarVisualizacao(episodeId);

                // O código para tocar o vídeo continua executando normalmente
                playVideoInFullscreen(videoElement);
            }
        });
    });

    // Função para tocar o vídeo (sem alterações)
    function playVideoInFullscreen(videoElement) {
        if (videoElement) {
            if (fullscreenVideo && fullscreenVideo !== videoElement) { exitFullscreenVideo(); }
            videoElement.classList.add('visible');
            videoElement.style.display = 'block';
            fullscreenVideo = videoElement;
            if (videoElement.requestFullscreen) { videoElement.requestFullscreen(); }
            else if (videoElement.mozRequestFullScreen) { videoElement.mozRequestFullScreen(); }
            else if (videoElement.webkitRequestFullscreen) { videoElement.webkitRequestFullscreen(); }
            else if (videoElement.msRequestFullscreen) { videoElement.msRequestFullscreen(); }
            videoElement.play();
        }
    }

    // O resto do seu código para sair da tela cheia continua aqui...
    function handleFullscreenChange() { if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) { exitFullscreenVideo(); } }
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    function exitFullscreenVideo() { if (fullscreenVideo) { fullscreenVideo.pause(); fullscreenVideo.currentTime = 0; fullscreenVideo.classList.remove('visible'); fullscreenVideo.style.display = 'none'; fullscreenVideo = null; } }
});

// Animacao dos butoes de like, deslike e coracao
document.addEventListener('DOMContentLoaded', () => {
    // Função para obter o ID do vídeo
    function getVideoId(button) {
        const episodeCard = button.closest('.episode-card-content');
        const video = episodeCard.querySelector('video');
        return video ? video.id : 'default-video';
    }

    // Função para restaurar estados dos botões
    function restoreButtonStates(videoId, videoButtons) {
        const states = JSON.parse(localStorage.getItem(`button-states-${videoId}`)) || {
            like: false,
            dislike: false,
            heart: false
        };

        const likeButton = videoButtons.querySelector('.btn-like');
        const dislikeButton = videoButtons.querySelector('.btn-dislike');
        const heartButton = videoButtons.querySelector('.btn-heart');

        if (likeButton) {
            const icon = likeButton.querySelector('i');
            if (states.like) {
                icon.classList.remove('fa-regular');
                icon.classList.add('fa-solid');
                likeButton.classList.add('ativo');
            } else {
                icon.classList.remove('fa-solid');
                icon.classList.add('fa-regular');
                likeButton.classList.remove('ativo');
            }
        }

        if (dislikeButton) {
            const icon = dislikeButton.querySelector('i');
            if (states.dislike) {
                icon.classList.remove('fa-regular');
                icon.classList.add('fa-solid');
                dislikeButton.classList.add('ativo');
            } else {
                icon.classList.remove('fa-solid');
                icon.classList.add('fa-regular');
                dislikeButton.classList.remove('ativo');
            }
        }

        if (heartButton) {
            const icon = heartButton.querySelector('i');
            if (states.heart) {
                icon.classList.remove('fa-regular');
                icon.classList.add('fa-solid');
                heartButton.classList.add('ativo');
            } else {
                icon.classList.remove('fa-solid');
                icon.classList.add('fa-regular');
                heartButton.classList.remove('ativo');
            }
        }
    }

    // Função para salvar estados
    function saveButtonStates(videoId, likeActive, dislikeActive, heartActive) {
        const states = { like: likeActive, dislike: dislikeActive, heart: heartActive };
        localStorage.setItem(`button-states-${videoId}`, JSON.stringify(states));
    }

    // Inicializa todos os conjuntos de botões
    document.querySelectorAll('.video-buttons').forEach(videoButtons => {
        const videoId = getVideoId(videoButtons.querySelector('button'));
        restoreButtonStates(videoId, videoButtons);

        videoButtons.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', () => {
                const icon = button.querySelector('i');
                const isLikeButton = button.classList.contains('btn-like');
                const isDislikeButton = button.classList.contains('btn-dislike');
                const likeButton = videoButtons.querySelector('.btn-like');
                const dislikeButton = videoButtons.querySelector('.btn-dislike');
                const heartButton = videoButtons.querySelector('.btn-heart');

                // Obtém estados atuais
                let likeActive = likeButton.classList.contains('ativo');
                let dislikeActive = dislikeButton.classList.contains('ativo');
                let heartActive = heartButton.classList.contains('ativo');

                if (isLikeButton || isDislikeButton) {
                    const otherButton = isLikeButton ? dislikeButton : likeButton;
                    const otherIcon = otherButton.querySelector('i');

                    if (icon.classList.contains('fa-regular')) {
                        // Ativa o botão clicado
                        icon.classList.remove('fa-regular');
                        icon.classList.add('fa-solid');
                        button.classList.add('ativo');

                        // Aplica animação apenas para o like
                        if (isLikeButton) {
                            icon.classList.add('animate-pulse');
                            setTimeout(() => icon.classList.remove('animate-pulse'), 400); // Remove após animação
                        }

                        // Desativa o outro botão
                        otherIcon.classList.remove('fa-solid');
                        otherIcon.classList.add('fa-regular');
                        otherButton.classList.remove('ativo');

                        // Atualiza estados
                        if (isLikeButton) {
                            likeActive = true;
                            dislikeActive = false;
                        } else {
                            likeActive = false;
                            dislikeActive = true;
                        }
                    } else {
                        // Desativa o botão clicado
                        icon.classList.remove('fa-solid');
                        icon.classList.add('fa-regular');
                        button.classList.remove('ativo');

                        // Atualiza estados
                        if (isLikeButton) likeActive = false;
                        else dislikeActive = false;
                    }
                } else {
                    // Botão heart: toggle independente
                    if (icon.classList.contains('fa-regular')) {
                        icon.classList.remove('fa-regular');
                        icon.classList.add('fa-solid');
                        button.classList.add('ativo');
                        // Aplica animação para o heart
                        icon.classList.add('animate-pulse');
                        setTimeout(() => icon.classList.remove('animate-pulse'), 400); // Remove após animação
                        heartActive = true;
                    } else {
                        icon.classList.remove('fa-solid');
                        icon.classList.add('fa-regular');
                        button.classList.remove('ativo');
                        heartActive = false;
                    }
                }

                // Salva os estados
                saveButtonStates(videoId, likeActive, dislikeActive, heartActive);
            });
        });
    });
});

// Selecionar por fase
document.addEventListener('DOMContentLoaded', function () {
    const select = document.getElementById('rodada');
    const arrow = document.querySelector('.arrow_down');

    select.addEventListener('mousedown', function () {
        // Alterna a classe active para rotacionar o ícone
        arrow.classList.toggle('active');
        // Alterna o nome do ícone
        arrow.setAttribute('name', arrow.classList.contains('active') ? 'caret-up-outline' : 'caret-down-outline');
    });

    // Volta ao estado inicial quando o select perde o foco
    select.addEventListener('blur', function () {
        arrow.classList.remove('active');
        arrow.setAttribute('name', 'caret-down-outline');
    });

    // Função existente para filtragem
    function filtrarEpisodios() {
        const faseSelecionada = document.getElementById('rodada').value;
        const episodios = document.querySelectorAll('.episode-card');

        episodios.forEach(episodio => {
            const faseEpisodio = episodio.getAttribute('data-fase');
            if (faseSelecionada === '' || faseEpisodio === faseSelecionada) {
                episodio.style.display = 'block';
            } else {
                episodio.style.display = 'none';
            }
        });
    }
});

//Filtro rodada
document.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('rodada');
    if (!select) return; // Evita erros se o elemento não existir

    // Obtém todas as opções
    const options = Array.from(select.options);
    const uniqueOptions = [];
    const seenValues = new Set();

    // Preserva a primeira opção "- Todos -"
    if (options.length > 0) {
        uniqueOptions.push(options[0]);
        seenValues.add(options[0].value);
    }

    // Adiciona apenas opções com valores únicos
    options.slice(1).forEach(option => {
        if (!seenValues.has(option.value)) {
            seenValues.add(option.value);
            uniqueOptions.push(option);
        }
    });

    // Atualiza o select com as opções únicas
    select.innerHTML = '';
    uniqueOptions.forEach(option => select.appendChild(option));
});



