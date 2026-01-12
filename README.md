# 🎮 Runner Game — TypeScript + Canvas 2D

Petit runner game 2D développé en TypeScript avec Canvas 2D, inspiré du T-Rex Runner, dans un objectif pédagogique et d'entraînement.

---

## 🧱 Stack technique

- Vite
- TypeScript
- Canvas 2D
- Aucun framework de jeu
- Un seul fichier principal (`main.ts`) pour le moment

---

## 🔁 Game Loop

gameLoop
 ├─ update() → logique
 ├─ draw()   → affichage
 └─ requestAnimationFrame(gameLoop)
Règles clés
update() modifie l’état

draw() lit l’état

Le canvas ne se met jamais à jour tout seul

Le temps (frames) est la base des animations

## États du jeu

Le jeu fonctionne avec une machine à états :

type GameState = "WAITING" | "PLAYING" | "GAME_OVER";

**Comportement**

WAITING	-> Écran d’attente, rien ne bouge
PLAYING	-> Jeu actif
GAME_OVER -> Monde figé + animation

Player

-Rectangle (temporaire)
-Gravité appliquée frame par frame
-Saut uniquement si au sol
-Pas de double saut
-Détection du sol

Obstacles

-Interface Obstacle
-Tableau obstacles: Obstacle[]
-Déplacement horizontal
-Respawn à droite quand sorti de l’écran
-Plusieurs profils d’obstacles :
    obstacle au sol
    obstacle aérien (anti-saut)
    extensible (long, rapide, etc.)

Collisions

-Collision AABB (rectangle / rectangle)
-Fonction pure checkCollision(player, obstacle)
-La détection ne décide jamais
-update() interprète la collision

Score

-Score basé sur le temps (frames)
-Incrémenté uniquement en PLAYING
-Figé en GAME_OVER
-Réinitialisé au restart
-Affiché en haut de l’écran

Difficulté progressive

-Vitesse des obstacles augmente avec le score
-Progression linéaire et douce
-Vitesse plafonnée pour rester jouable

Restart

-Appui sur Space
-Fonction dédiée resetGame()
-Réinitialisation complète de l’état du jeu
-Pas de rechargement de page

## Fonctionnalités actuelles ##

Game loop propre

États du jeu

Game Over animé

Start / Restart

Score

Difficulté progressive

Obstacles variés (sol / air)

## À venir ##

-Sprites (images)
-Animation simple (frames)
-Nouveaux types d’obstacles
-Score en secondes / high score
-Difficulté plus fine (probabilités)
-Mobile / tactile
-Refactor léger

## Installation

npm install
npm run dev
http://localhost:5173/

Projet développé par [GERARD Jordan / Jordybou]