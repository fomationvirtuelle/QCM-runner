# QCM Runner - Jeu Éducatif Générique 🎮📚

Un jeu de type "runner" 3D où les joueurs collectent des lettres en répondant à des questions de QCM. Le jeu est **100% générique** et permet d'importer vos propres questions personnalisées.

## 🚀 Déploiement Instantané

Cliquez sur le bouton ci-dessous pour déployer et tester immédiatement (gratuit) :

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/fomationvirtuelle/QCM-runner)

Ou sur Netlify :

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/fomationvirtuelle/QCM-runner)

## ✨ Fonctionnalités

### Jeu Générique
- ✅ **Import de questions personnalisées** (JSON ou CSV)
- ✅ **Templates téléchargeables** avec exemples
- ✅ **Validation automatique** des données
- ✅ **Gestion multi-QCM** avec stockage local
- ✅ **QCM par défaut** (CEJM) inclus

### Gameplay
- 🏃 Runner 3D avec personnage animé
- 💰 Collecte de pièces (+100€)
- ⚠️ Évitement d'obstacles (-500€)
- ❓ Questions-réponses pour épeler un mot cible
- ⚡ Power-ups : Double saut, Parachute, Aimant, Multiplicateur
- 📈 Difficulté progressive

## 📋 Format d'Import

### JSON (Recommandé)
```json
[
  {
    "id": "mon-chapitre",
    "titre": "Mon Chapitre",
    "description": "Description",
    "motCible": "EXEMPLE",
    "questions": [
      {
        "notion": "Lettre E",
        "question": "Quelle est la première lettre ?",
        "reponses": ["E", "X", "M"],
        "reponseCorrecte": 0,
        "explication": "C'est la lettre E"
      }
      // ... 6 autres questions (7 lettres = 7 questions)
    ]
  }
]
```

⚠️ **Contrainte** : Nombre de questions = Longueur du mot cible

## 🎮 Comment Utiliser

1. **Téléchargez un template** : Dans le jeu → "GÉRER MES QCM" → "Importer"
2. **Remplissez vos questions** : Modifiez le fichier téléchargé
3. **Importez** : Glissez-déposez dans l'interface
4. **Jouez** : Sélectionnez votre QCM et un chapitre

## 💻 Installation Locale

```bash
# Cloner le repo
git clone https://github.com/fomationvirtuelle/QCM-runner.git
cd QCM-runner

# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build pour production
npm run build
```

L'application sera accessible sur http://localhost:3000

## 📚 Documentation

Consultez le [Guide d'Import de QCM](./GUIDE_IMPORT_QCM.md) pour une documentation complète.

## 🛠️ Technologies

- React 19 + TypeScript
- Three.js (rendu 3D)
- Zustand (état)
- Vite (build)
- Tailwind CSS

## 📝 License

Apache-2.0
