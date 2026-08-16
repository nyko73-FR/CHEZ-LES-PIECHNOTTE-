# Chez les PIECHNOTTE — V5.1

## Ce qui change

- Séparation visuelle **Invité / Gestion**.
- Accès gestion par code PIN côté client.
- Les invités ne peuvent plus modifier :
  - les invités ;
  - les boissons ;
  - les titres ;
  - les commandes servies/annulées.
- Commandes avec quantité.
- Une boisson à 0 est impossible à commander.
- Contrôle du stock au moment du service.
- Historique des commandes.
- Annulation d'une commande en attente.
- Identification de l'invité par prénom.
- Un invité ne peut voter qu'une fois par titre dans le stockage partagé.
- Réinitialisation des votes pour une nouvelle soirée.
- Affichage du stock côté invité sans possibilité de modification.
- Conservation du style visuel de la V5.

## Installation

Remplace ton composant actuel par `AperoManager.jsx`.

Le projet doit déjà disposer de :

- React
- lucide-react
- Tailwind CSS
- l'environnement qui fournit `window.storage`

## Code gestion

Le code actuel est :

`2026`

À modifier dans `AperoManager.jsx` :

`const ADMIN_PIN = "2026";`

### Important

Ce PIN est une barrière d'interface, pas une authentification serveur.
Un utilisateur techniquement avancé peut retrouver le code dans le JavaScript publié.

Pour un usage maison / soirée sur ton réseau, c'est pratique.
Pour une application publique, il faudra une vraie authentification côté serveur.

## Données conservées

Les mêmes clés de stockage sont conservées :

- `apero-guests`
- `apero-tracks`
- `apero-drinks`
- `apero-orders`

La V5.1 est donc conçue pour reprendre les données existantes sans migration complexe.

## QR code

Le QR code utilise encore `api.qrserver.com` dans cette version.
Une prochaine version peut générer le QR code entièrement côté navigateur afin de supprimer cette dépendance externe.
