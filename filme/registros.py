from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_POST
from .models import Episodio, Usuario # Importe os modelos que a view utiliza

@require_POST
def registrar_visualizacao(request, pk):
    try:
        # Encontra o episódio no banco de dados pelo ID (pk)
        episodio = Episodio.objects.get(pk=pk)

        episodio.visualizacoes += 1
        episodio.save()

        # 4. Retorna uma resposta JSON de sucesso (útil para depuração)
        return JsonResponse({'status': 'ok', 'visualizacoes_episodio': episodio.visualizacoes})

    except Episodio.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Episódio não encontrado'}, status=404)

@require_POST
def toggle_like_episodio(request, pk):
    # Garante que o usuário esteja logado
    if not request.user.is_authenticated:
        return JsonResponse({'status': 'error', 'message': 'Usuário não autenticado'}, status=401)

    # Pega o usuário logado e o episódio pelo ID
    usuario = request.user
    episodio = get_object_or_404(Episodio, pk=pk)

    # A LÓGICA DO TOGGLE (ALTERNAR)
    if usuario in episodio.usuarios_que_curtiram.all():
        episodio.usuarios_que_curtiram.remove(usuario)
        liked = False
    else:
        episodio.usuarios_que_curtiram.add(usuario)
        liked = True

    # Prepara a resposta JSON para o front-end
    data = {
        'status': 'ok',
        'liked': liked,  # Informa ao front-end se o like está ativo
        'total_likes': episodio.total_likes,  # Envia a nova contagem total de likes
    }
    return JsonResponse(data)

@require_POST
def toggle_deslike_episodio(request, pk):
    # Garante que o usuário esteja logado
    if not request.user.is_authenticated:
        return JsonResponse({'status': 'error', 'message': 'Usuário não autenticado'}, status=401)

    # Pega o usuário logado e o episódio pelo ID
    usuario = request.user
    episodio = get_object_or_404(Episodio, pk=pk)

    # A LÓGICA DO TOGGLE (ALTERNAR)
    if usuario in episodio.usuarios_que_amaram.all():
        episodio.usuarios_que_amaram.remove(usuario)
        liked = False
        deslike = False
    else:
        episodio.usuarios_que_amaram.add(usuario)
        deslike = True

    # Prepara a resposta JSON para o front-end
    data = {
        'status': 'ok',
        'deslike': deslike,  # Informa ao front-end se o like está ativo
        'total_deslike': episodio.total_deslikes,  # Envia a nova contagem total de likes
    }
    return JsonResponse(data)

@require_POST
def toggle_coracao_episodio(request, pk):
    # Garante que o usuário esteja logado
    if not request.user.is_authenticated:
        return JsonResponse({'status': 'error', 'message': 'Usuário não autenticado'}, status=401)

    # Pega o usuário logado e o episódio pelo ID
    usuario = request.user
    episodio = get_object_or_404(Episodio, pk=pk)

    # A LÓGICA DO TOGGLE (ALTERNAR)
    if usuario in episodio.usuarios_que_amaram.all():
        episodio.usuarios_que_amaram.remove(usuario)
        heart = False
    else:
        episodio.usuarios_que_amaram.add(usuario)
        heart = True

    # Prepara a resposta JSON para o front-end
    data = {
        'status': 'ok',
        'heart': heart,  # Informa ao front-end se o like está ativo
        'total_heart': episodio.total_curtidas,  # Envia a nova contagem total de likes
    }
    return JsonResponse(data)


