# Guide d'Import de QCM Personnalisés

Ce guide explique comment créer et importer vos propres banques de questions dans QCM Runner.

## Vue d'ensemble

QCM Runner est maintenant **générique** et vous permet d'importer vos propres questions-réponses pour créer des jeux éducatifs personnalisés. Le jeu s'adapte automatiquement à vos QCM.

## Formats supportés

Le système d'import supporte deux formats :
- **JSON** - Recommandé pour sa simplicité et sa flexibilité
- **CSV** - Pratique pour éditer avec Excel ou Google Sheets

## Contraintes importantes

⚠️ **RÈGLE CRITIQUE** : Le nombre de questions DOIT être égal à la longueur du mot cible.

**Exemple :**
- Mot cible : "EXEMPLE" (7 lettres)
- Nombre de questions requis : **7 questions**

Chaque question correspond à une lettre du mot que le joueur doit épeler.

## Format JSON

### Structure

```json
[
  {
    "id": "mon-chapitre-1",
    "titre": "Mon Chapitre",
    "description": "Description du chapitre",
    "motCible": "PESTEL",
    "questions": [
      {
        "notion": "Lettre P",
        "question": "Quelle est la première lettre ?",
        "reponses": ["P", "E", "S"],
        "reponseCorrecte": 0,
        "explication": "La réponse est P"
      },
      // ... 5 autres questions
    ]
  }
]
```

### Champs obligatoires

#### Niveau Chapitre
- `id` : Identifiant unique du chapitre (string)
- `titre` : Titre du chapitre (string)
- `description` : Description du chapitre (string, peut être vide)
- `motCible` : Mot à épeler en majuscules (string)
- `questions` : Tableau de questions (array)

#### Niveau Question
- `notion` : Concept ou thème de la question (string)
- `question` : Texte de la question (string)
- `reponses` : Tableau de **exactement 3 réponses** (array de strings)
- `reponseCorrecte` : Index de la bonne réponse (0, 1 ou 2) (number)
- `explication` : Explication affichée en cas d'erreur (string)

### Exemple complet

```json
[
  {
    "id": "chimie-101",
    "titre": "Les Éléments Chimiques",
    "description": "Quiz sur les symboles chimiques",
    "motCible": "OXYGENE",
    "questions": [
      {
        "notion": "Oxygène",
        "question": "Quel est le symbole chimique de l'oxygène ?",
        "reponses": ["O", "Ox", "Og"],
        "reponseCorrecte": 0,
        "explication": "L'oxygène a pour symbole O"
      },
      {
        "notion": "Élément X",
        "question": "Quel élément a pour symbole X dans cet exercice ?",
        "reponses": ["Xénon (Xe)", "Exemple (X)", "Aucun"],
        "reponseCorrecte": 2,
        "explication": "X n'est pas un symbole chimique réel"
      },
      // ... 5 autres questions pour les lettres Y, G, E, N, E
    ]
  }
]
```

## Format CSV

### Structure

Le fichier CSV doit contenir les colonnes suivantes :

```
ChapitreID,Titre,Description,MotCible,Notion,Question,Réponse1,Réponse2,Réponse3,IndexCorrect,Explication
```

### Exemple

```csv
ChapitreID,Titre,Description,MotCible,Notion,Question,Réponse1,Réponse2,Réponse3,IndexCorrect,Explication
geo-01,Géographie,Capitales du monde,PARIS,Lettre P,Quelle est la première lettre de la capitale française ?,P,A,R,0,La première lettre est P
geo-01,Géographie,Capitales du monde,PARIS,Lettre A,Quelle est la deuxième lettre de Paris ?,R,A,I,1,La deuxième lettre est A
geo-01,Géographie,Capitales du monde,PARIS,Lettre R,Quelle est la troisième lettre de Paris ?,R,P,A,0,La troisième lettre est R
geo-01,Géographie,Capitales du monde,PARIS,Lettre I,Quelle est la quatrième lettre de Paris ?,S,I,R,1,La quatrième lettre est I
geo-01,Géographie,Capitales du monde,PARIS,Lettre S,Quelle est la dernière lettre de Paris ?,S,I,P,0,La dernière lettre est S
```

**Notes importantes sur le CSV :**
- La première ligne (en-tête) est **obligatoire**
- Toutes les questions avec le même `ChapitreID` seront regroupées
- Utilisez des guillemets doubles si vos textes contiennent des virgules : `"Question avec, des virgules"`
- L'index de la réponse correcte est 0, 1 ou 2

## Utilisation dans l'application

### 1. Télécharger un template

1. Lancez QCM Runner
2. Cliquez sur **"GÉRER MES QCM"** dans le menu principal
3. Cliquez sur **"Importer un nouveau QCM"**
4. Téléchargez un template :
   - **Template JSON** : Fichier structuré avec exemple complet
   - **Template CSV** : Fichier pour Excel/Sheets

### 2. Remplir votre QCM

1. Ouvrez le template téléchargé
2. Remplacez les données d'exemple par vos propres questions
3. **Vérifiez que le nombre de questions = longueur du mot cible**
4. Sauvegardez le fichier

### 3. Importer votre QCM

1. Dans l'écran d'import, glissez-déposez votre fichier ou cliquez pour le sélectionner
2. Le système valide automatiquement votre fichier
3. Si des erreurs sont détectées, elles s'affichent en rouge avec des explications
4. Si tout est valide, cliquez sur **"Importer X chapitre(s)"**

### 4. Jouer avec votre QCM

1. Votre QCM est automatiquement sélectionné et sauvegardé
2. Retournez au menu principal
3. Choisissez un chapitre et jouez !

## Gestion des QCM

### Voir tous vos QCM

Dans l'écran **"GÉRER MES QCM"**, vous pouvez :
- Voir tous vos QCM importés
- Voir le QCM par défaut (CEJM)
- Consulter le nombre de chapitres et questions par QCM
- Voir la date d'import des QCM personnalisés

### Changer de QCM actif

1. Dans la liste des QCM, cliquez sur **"Sélectionner"** sur le QCM souhaité
2. Un badge **"✓ ACTIF"** apparaît sur le QCM sélectionné
3. Retournez au menu : les chapitres affichés sont maintenant ceux du QCM actif

### Supprimer un QCM

1. Cliquez sur **"Supprimer"** sur un QCM personnalisé
2. Confirmez la suppression
3. Le QCM est définitivement supprimé (le QCM par défaut ne peut pas être supprimé)

## Validation automatique

Le système vérifie automatiquement :

✅ **Vérifications :**
- Présence de tous les champs obligatoires
- Nombre de questions = longueur du mot cible
- Exactement 3 réponses par question
- Index de réponse correcte entre 0 et 2
- Pas de champs vides

⚠️ **Avertissements :**
- Explication manquante (non bloquant)

❌ **Erreurs bloquantes :**
- Champs obligatoires manquants
- Incohérence questions/mot cible
- Format de fichier incorrect
- Nombre de réponses invalide

## Conseils et bonnes pratiques

### Choisir un bon mot cible

- Utilisez des mots en rapport avec votre sujet
- Évitez les mots trop longs (> 10 lettres) = beaucoup de questions
- Évitez les mots trop courts (< 4 lettres) = jeu trop rapide

**Exemples :**
- Mathématiques : CALCUL (6 lettres)
- Histoire : NAPOLEON (8 lettres)
- Sciences : ATOMES (6 lettres)

### Rédiger de bonnes questions

- Soyez clair et concis
- Évitez les ambiguïtés
- Proposez 3 réponses plausibles
- Rédigez des explications pédagogiques

### Organiser vos chapitres

- Un chapitre = un thème cohérent
- Progression de difficulté recommandée
- Groupez les notions similaires

### Gérer plusieurs QCM

- Créez un QCM par matière ou thématique
- Nommez vos QCM de façon explicite
- Utilisez la description pour préciser le niveau ou le contexte

## Exemples de cas d'usage

### 1. QCM Éducatif - École Primaire

**Mot cible :** SOLEIL (6 lettres)
**Thème :** Le système solaire
**Questions :** Adaptées au niveau CE2-CM1

### 2. QCM Professionnel - Formation Entreprise

**Mot cible :** SECURITE (8 lettres)
**Thème :** Règles de sécurité au travail
**Questions :** Conformité HSE

### 3. QCM Révision - Lycée

**Mot cible :** HISTOIRE (8 lettres)
**Thème :** Première Guerre Mondiale
**Questions :** Révision pour le bac

### 4. QCM Ludique - Culture Générale

**Mot cible :** CINEMA (6 lettres)
**Thème :** Films classiques
**Questions :** Quiz familial

## Dépannage

### Mon import échoue

**Problème :** "Impossible de parser le fichier"
- **Solution :** Vérifiez que votre fichier JSON est valide (utilisez un validateur JSON en ligne)
- **Solution CSV :** Vérifiez que votre fichier utilise bien des virgules comme séparateurs

**Problème :** "Le nombre de questions doit égaler la longueur du mot cible"
- **Solution :** Comptez les lettres de votre mot cible et ajustez le nombre de questions

**Problème :** "Il doit y avoir exactement 3 réponses"
- **Solution :** Vérifiez que chaque question a 3 réponses, ni plus ni moins

### Mon QCM ne s'affiche pas

- Vérifiez que vous avez bien cliqué sur "Importer"
- Retournez dans "Gérer mes QCM" pour vérifier qu'il est dans la liste
- Sélectionnez-le comme QCM actif si nécessaire

### Je ne vois pas mes chapitres

- Vérifiez que le bon QCM est actif (badge "✓ ACTIF")
- Si besoin, changez de QCM actif dans la gestion

## Stockage des données

- Les QCM personnalisés sont stockés dans le **localStorage** de votre navigateur
- Les données persistent entre les sessions
- Si vous videz le cache du navigateur, vos QCM seront perdus
- **Conseil :** Conservez vos fichiers JSON/CSV source en sécurité

## Support et ressources

- Utilisez les templates fournis comme point de départ
- Testez avec un petit QCM avant de créer de grandes banques
- N'hésitez pas à créer plusieurs QCM pour différents usages

---

**Bon jeu et bonnes créations de QCM ! 🎮📚**
