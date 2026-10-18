# Site Ludemis — GitHub Pages

Le site statique se trouve dans `docs/`. Aucun secret ni configuration OAuth ne doit y être ajouté. Il ne nécessite ni compilation, ni dépendance, ni service payant.

## Première activation

Dans le dépôt GitHub : **Settings → Pages → Build and deployment → Source → GitHub Actions**. Ensuite, dans **Actions → Publier le site Ludemis → Run workflow**, lancer le déploiement sur `main` si nécessaire.

Adresse prévue : https://ksidernide.github.io/Ludemis-releases/

Politique : https://ksidernide.github.io/Ludemis-releases/confidentialite.html

## Modifications

Modifier directement les fichiers HTML/CSS dans `docs/`. Chaque commit sur `main` touchant ces fichiers déclenche le workflow `.github/workflows/pages.yml`. Les liens internes sont relatifs pour fonctionner sous le chemin du dépôt. Le site ne publie que `docs/`, pas les fichiers du launcher.

Le bouton de téléchargement dirige vers les releases réellement publiées sur GitHub. Une page en ligne ne garantit pas la validation OAuth de Google ; les exigences de vérification du domaine restent à traiter séparément.
