from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator

# Create your models here.


ANO_MINIMO = 2000
ANO_ATUAL = timezone.now().year

# Gera os anos como lista de tuplas para o choices
LISTA_ANOS = [(ano, str(ano)) for ano in range(ANO_MINIMO, ANO_ATUAL + 1)]

LISTA_CATEGORIAS = (
    ("Copa do Brasil", "Copa do Brasil"),
    ("Libertadores", "Libertadores"),
    ("Campeonato Estadual", "Campeonato Estadual"),
    ("Copa do Mundo de Clubes", "Copa do Mundo de Clubes"),
)

LISTA_FASES = (
    ("Fase de Grupos", "Fase de Grupos"),
    ("Oitavas de Final", "Oitavas de Final"),
    ("Quartas de Final", "Quartas de Final"),
    ("Semifinal", "Semifinal"),
    ("Final", "Final"),
)


class Filme(models.Model):
        ANO_MINIMO = 2000
        ANO_ATUAL = timezone.now().year


        titulo = models.CharField(max_length=100)
        thumb = models.ImageField(upload_to='thumb_filmes')
        descricao = models.TextField(max_length=1000)
        ano = models.IntegerField(choices=LISTA_ANOS,validators=[MinValueValidator(ANO_MINIMO),MaxValueValidator(ANO_ATUAL)])
        categoria = models.CharField(max_length=50,choices=LISTA_CATEGORIAS,default="Outros")
        visualizacoes = models.IntegerField(default=0)
        data_criacao = models.DateTimeField(default=timezone.now)
        campeao = models.BooleanField(default=False)

        def __str__(self):
            return self.titulo

class Episodio(models.Model):
    filme = models.ForeignKey("Filme",related_name="episodios",on_delete=models.CASCADE)
    titulo = models.CharField(max_length=100)
    thumb = models.ImageField(upload_to='thumb_episodios',null=True, blank=True)
    video = models.FileField(upload_to='videos/',null=True, blank=True)
    link = models.URLField()
    descricao = models.TextField(max_length=1000)
    fases = models.CharField(max_length=50, choices=LISTA_FASES, default="Outros")
    visualizacoes = models.IntegerField(default=0)
    #like = models.IntegerField(default=0)
    #curtidas = models.IntegerField(default=0)


    def __str__(self):
        return self.filme.titulo + " - " + self.titulo

class Usuario(AbstractUser):
    filmes_vistos = models.ManyToManyField("Filme")
    #filmes_favoritos = models.ManyToManyField("Filme")