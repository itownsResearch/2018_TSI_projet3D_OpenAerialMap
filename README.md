# Projet Itowns
## Sujet 1
Ce projet consiste à remplacer le viewer 2D OAM-browser par le viewer 3D iTowns.

**1ère étape :** Récupérer les informations des orthophotos de openaerialmaps via une API rest.

**2ème étape :** Localiser les orthophotos sur le viewer d'iTowns à travers leurs coordonnées.

**3ème étape :** Ajouter un événement click sur les imagettes des *ortho*.

**4ème étape :** Affichage de l'ortho sur le viewer d'iTowns.


# Approche adoptée
* Récupération des données du catalogue :
  Dans cette partie nous avons récupéré à travers une requête à 100 (maximum autorisé) données.

* Affichage des images sur le globe :
  Dans un premier temps, toutes les images récupérées du catalogue seront affichées sur le globe.

* Clic sur les images :
  L'idée est d'afficher le wmts de chaque données sur le viewer d'iTowns au click.

# Ce qui marche
:heavy_check_mark: ***Étape 1***

:heavy_check_mark: ***Étape 2***

:heavy_check_mark: ***Étape 3***

:x: ***Étape 4*** Bug actuel sur l'ajout de l'orthophotos.


# Problèmes rencontrés

Dans un premier temps nous avons eu des problèmes sur les requêtes HTTP-DE type Cross-site pour le chargement des ressources localisées sur l'API. Nous avons pu régler ce dernier en lançons chrome sans les paramètres de sécurité. Dans un second temps une fois les données récupérées de l'api, nous avons eu des problèmes pour gérer les clicks sur les Orthos qui ont été superposé sur itowns.  malheursement une fois le problème réglé, nous nous sommes retrouvés face à un nouveau bug sur l'ajout des orthos dans la scene.

Le bug actuel concerne un conflit d'ID de layer comme indiqué sur la figure ci-dessous. 
![alt text](https://github.com/DiakhabySadou/projet3D_Itowns/raw/master/images/error.png)

