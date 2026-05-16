#  Application de Quiz IA — Programme Seconde

##  Objectif
Créer une application mobile de révision basée sur des quiz générés par IA, alignée avec le programme scolaire de Seconde, permettant aux élèves de progresser efficacement.

---

#  V0 — MVP (Minimum Viable Product)

##  Navigation de base
- Page d’accueil avec liste des matières :
  - Mathématiques
  - Français
  - Histoire
  - Géographie
  - SES
  - SVT
  - Physique-chimie
  - Sciences numériques et technologie
  - Enseignement moral et civique
  - Anglais
  - Espagnol
  - Allemand

- Navigation :
  - Matière → Chapitre → Quiz

---

##  Structure pédagogique
- Organisation en 3 niveaux :
  - Matière
  - Chapitre
  - Compétence

---

##  Génération de quiz (IA)
- Types de questions :
  - QCM
  - Vrai / Faux
  - Réponse courte

- Paramètres :
  - Sélection du chapitre
  - Génération dynamique des questions

---

##  Correction
- Correction immédiate après chaque question
- Explication simple (1 à 3 phrases)

---

##  Score
- Score final affiché
- Pourcentage de réussite

---

#  V1 — Version améliorée (produit utile)

##  Personnalisation
- Adaptation de la difficulté selon les performances (attention c est stocké sur le local storage donc si cache vidé, donnés perdus)
- Révision ciblée sur les erreurs

---

## Timer
- Timer par question adapté a la question
- Le score en pourcentage est faits en fonction du temps passé

---

##  Suivi de progression
- Statistiques par matière
- Graphique par matière
- Historique des quiz
- Indicateur de maîtrise des chapitres

---

##  Explications avancées
- Détail des étapes (notamment en mathématiques)
- Méthodes de résolution
- Liste des erreurs fréquentes

---

##  Engagement utilisateur
- Notifications de rappel pour réviser
- Objectifs quotidiens simples

---

##  Score partiel (réponses texte)
- Plusieurs niveaux de résultat :
  - ✅ Correct
  - ⚠️ Partiellement correct (idée juste, formulation incomplète)
  - ❌ Incorrect
- Pondération du score selon le niveau de correction
- Affichage visuel distinct pour chaque niveau

---

##  Feedback utilisateur détaillé
- Indiquer ce qui est correct dans la réponse
- Indiquer ce qui manque ou est inexact
- Expliquer pourquoi la réponse est fausse (lié à la réponse de l'élève, pas seulement l'explication générique)
- Relier l'explication à l'erreur spécifique commise

---

##  Structure enrichie
- Liaison claire :
  - Matière → Chapitre → Compétence → Quiz

---

#  V2 — Version avancée (différenciation forte)

##  Mode contrôle
- Simulation d’un contrôle réel :
  - Temps limité
  - Notation finale
  - Conditions réalistes

---

##  Coach IA
- Chat interactif avec l’IA
- Explications personnalisées
- Reformulation selon le niveau de l’élève

---

##  Gamification
- Système d’XP
- Niveaux utilisateur
- Badges de progression

---

##  Social
- Défis entre amis
- Classement
- Jeu de vitesse contre-la-montre

---

##  Scan & correction
- Prise de photo d’un exercice
- Analyse et correction par IA
- Explication détaillée

---

##  Révision intelligente
- Système de répétition espacée
- Réapparition des questions selon les erreurs

---

##  Langues (fonctionnalités avancées)
- Reconnaissance vocale
- Correction de prononciation
- Dialogue avec IA

---

##  Analyse avancée
- Prédiction de note
- Analyse des points faibles

---

##  Système de streak (engagement quotidien)

###  Fonctionnement
- +1 jour de streak si :
  - un quiz normal est complété
- Pas de validation si :
  - quiz rapide
  - quiz abandonné

---

###  Système de gel
- 3 gels disponibles par mois
- Utilisation automatique si jour manqué
- Recharge mensuelle

---

###  Interface
- Affichage du streak (ex: 10 jours)
- Calendrier mensuel
- Indication des gels restants

---

###  Récompenses
- 3 jours → badge
- 7 jours → bonus XP
- 30 jours → récompense spéciale
- 100 jours → badge rare

---

###  Notifications
- Rappel quotidien
- Alerte perte de streak
- Notification utilisation gel

---

### Landing page
- à mettre a jour suivant ubdates style abonnement payant
- infos importantes en générale 
- ne pas oublier aprobation des cookies

---

##  Bonus (V2)

###  Mode “Je n’ai pas compris”
- Explication simplifiée (niveau débutant)

---

###  Quiz rapide
- Format court (5 questions)
- Durée rapide (~1 minutes)

---

###  Objectifs personnalisés
- Objectifs définis par l’utilisateur
- Exemple :
  - “Avoir 15/20 en mathématiques”

---
 
  - ne pas oublier de faire du contenu sur les résaux sociaux, 
  - systeme d abonnements payants suivant usage, 
  - système de bêta testeurs (canneaux Discorde)

---

#  Contraintes importantes

- Les contenus doivent être :
  - Alignés avec le programme scolaire officiel
  - Pédagogiquement corrects
  - Vérifiés (éviter erreurs IA)

---

#  Hors champ (à compléter)

##  Fonctionnalités à exclure
- Accès parental et proffesseur

##  Contraintes techniques
- 

##  Choix produits à éviter
- 
