# Itowns
Ce projet consiste à remplacer le viewer 2D OAM-browser par le viewer 3D iTowns.

**1ère étape :** Récupérer les informations des orthophotos de openaerialmaps via une API rest.

**2ème étape :** Localiser les orthophotos sur le viewer d'iTowns à travers leurs coordonnées.

**3ème étape :** Ajouter un événement click sur les imagettes des *ortho*. Cet événement permettra l'affichage de l'ortho sur le viewer d'iTowns.


# Approche adoptée
* Récupération des données du catalogue :
  Dans cette partie nous avons récupéré à travers une requête à 100 (maximum autorisé) données.

* Affichage des images sur le globe :
  Dans un premier temps, toutes les images récupérées du catalogue seront affichées sur le globe.

* Clic sur les images :
  L'idée est d'afficher le wms de chaque données sur le viewer d'iTowns au click.

# Etat d'avancement
:green_check_mark: ***Étape 1***
:green_check_mark: ***Étape 2***


# Problèmes rencontrés
Blocage sur le requête avec *CROSS-ORIGIN*
