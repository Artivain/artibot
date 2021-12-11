# Artibot
Bot open-source fait par Artivain et les contributeurs.

## But du projet
Faire un bot modulaire, moderne, performant et bien documenté disponible pour tous. 

Contrairement aux autres bots populaires comme MEE6, Artibot n'a pas de tier payant et toutes les fonctionnalités sont disponibles pour tous. 

> Ce projet est encore en début de développement. Toutes les contributions sont bienvenues!

### Comment participer
Vous pouvez nous aider, peu importe votre niveau en programmation. Ouvrez un [rapport de bug](https://github.com/Artivain/artibot/issues/new?assignees=&labels=bug&template=rapport_bug.md&title=%5BBug+report%5D) lorsque vous trouvez un problème, ou une [demande de fonctionnalité](https://github.com/Artivain/artibot/issues/new?assignees=&labels=enhancement&template=demande_fonctionnalite.md&title=%5BFeature+request%5D) si vous avez une bonne idée de quelque chose à ajouter au projet.

Vous êtes à l'aise avec la programmation sur Node.js? Vous pouvez aider en corrigeant des bugs qui sont rapportés ou ajoutez des nouvelles fonctionnalités en ouvrant un [pull request](https://github.com/Artivain/artibot/compare).

N'oubliez pas de mettre une étoile sur ce repository, ça nous aide à avoir une meilleure visibilité et donc de trouver plus de contributeurs!

## Artivain
[En apprendre plus sur Artivain](https://artivain.com/)

Ce projet est géré par Artivain. Vous pouvez venir discuter avec nous et obtenir du support sur [notre serveur Discord](https://discord.artivain.com/).

## Contributeurs

### Développeurs
Voici la liste des gens (avec leur tag Discord) qui contribuent en développant Artibot.

Vous pouvez, vous aussi, apparaître ici. Commencez par ouvrir un pull request avec quelques modifications ou testez le bot pour trouver un bug et ouvrez un issue.

 - [Artivain](https://github.com/Artivain)
 - [Thomas Fournier](https://github.com/GoudronViande24) (GoudronViande24#7211)
 - [Alexis Trudeau](https://github.com/Zariaa27) (🆃🅷🅴 zariaa#0294)

### Donateurs
Voici la liste des gens qui aident à développer le projet avec des dons. Sans eux, il serait difficile d'avoir des serveurs de développements et donc on ne serait pas aussi loin!

 - [Artivain](https://github.com/Artivain)

## Installation
Ce bot est auto-hébergé. Vous devez donc avoir un serveur supportant Node.js.

### Infogéré
Besoin d'une solution toute-en-un? Contactez-nous sur notre serveur Discord, nous avons un service d'hébergement optimisé pour Artibot et sans gestion de votre part.

### Auto-hébergé
Vous devez avoir les prérequis installés:
 - Ubuntu 20.04 / 21.04, Debian 11, Windows 10 / 11, Raspberry Pi OS...
 - Node.js ([version exacte ici](.node-version))
 - NPM (à jour)
 - FNM [Optionnel]

Si vous avez tous les prérequis, vous pouvez suivre ces commandes pour faire l'installation:
 - [Télécharger la dernière version (Stable ou Beta)](https://github.com/Artivain/artibot/releases)
 - Renommer le fichier `private-example.json` en `private.json` et remplir les informations requises
 - Personnaliser la configuration du bot dans `config.json`
 - Certains modules ont aussi besoin de clées privées dans un `private.json` et de configurations dans un `config.json`.
 - Exécuter les commandes suivantes:
	 - `npm i` pour installer les dépendances
	 - `npm start` pour démarrer le bot
 - Et voilà, le bot devrait être connecté!

## Licence
Artibot est sous licence [GPL 3.0](LICENSE).