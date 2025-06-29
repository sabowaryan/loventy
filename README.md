Voici le **fichier `README.md` complet**, prêt à être utilisé pour ton dépôt GitHub avec le **badge Bolt.new** et **lien vers la démo YouTube** :

---

````markdown
# 💌 Loventy

**Modern Wedding Invitations & Guest Management – Powered by Love & Tech**

[![Built with Bolt.new](public/assets/badges/bolt-black-circle.svg)](https://bolt.new/)

## 🔮 Inspiration

Loventy est né du besoin de simplifier et moderniser la gestion des invitations de mariage, particulièrement dans les régions à forte utilisation mobile.  
Les méthodes traditionnelles sont coûteuses, lentes, et manquent de flexibilité. Loventy offre une solution élégante, connectée, et adaptée aux réalités culturelles et numériques.

## ✨ Fonctionnalités

Loventy permet aux couples de :

- Créer des invitations de mariage digitales élégantes  
- Générer des accès sécurisés avec identifiants temporaires  
- Suivre les présences et confirmations en temps réel  
- Vérifier les invités à l’aide de QR codes à l’entrée  
- Gérer l’événement à partir d’un espace hôte temporaire  
- Utiliser l’application en plusieurs langues  

## 🛠️ Stack Technique

- **Frontend :** React  
- **Backend :** Supabase (authentification, base de données, RLS)  
- **QR codes :** Générés par invitation avec durée de validité  
- **Design :** UI mobile-first, épurée, responsive  

```ts
// Exemple : récupération d’un invité avec un token sécurisé
const { data, error } = await supabase
  .from('guests')
  .select('*')
  .eq('token', guestToken);
````

## 🧩 Défis rencontrés

* Gestion des accès temporaires avec Supabase Auth + RLS
* Sécurisation des données par événement
* Check-in offline et rapide le jour du mariage
* Design intuitif pour les invités et les hôtes

## 🏆 Réalisations

* Prototype fonctionnel avec QR check-in
* Intégration Supabase complète (auth + données temps réel)
* UI/UX agréable même en zone de faible connexion
* Architecture scalable (multi-invitations, multi-événements)

## 📚 Ce que nous avons appris

* Supabase RLS avancé (politiques par utilisateur/événement)
* Pensée événementielle pour les accès temporaires
* Design mobile-first orienté invités
* MVP priorisant impact utilisateur réel

## 🚀 Prochaines étapes

* Suggestions automatiques (AI) pour organisation
* Suivi écologique (zéro impression)
* Templates culturels et multilingues
* SaaS pour wedding planners
* Lancement public via [Loventy.org](https://loventy.org)

---

## 🎖️ Hackathon Participation

Ce projet est réalisé dans le cadre du **World’s Largest Hackathon** organisé par [Bolt.new](https://bolt.new).

[![Built with Bolt.new](public/assets/badges/bolt-black-circle.svg)](https://bolt.new/)

✅ Badge visible sur la page d’accueil
✅ Badge cliquable redirigeant vers [https://bolt.new](https://bolt.new)
✅ Projet hébergé avec l’infrastructure Bolt

---

## 📽️ Démo vidéo

👉 **[Regarder la démo YouTube](https://youtu.be/SXrB_Xwc5RY)**

---

## 📫 Contact

* 🌐 Site : [https://loventy.org](https://loventy.org)
* 📧 Email : [contact@loventy.org](mailto:contact@loventy.org)
* 🐦 Twitter : [@sabowaryan](https://twitter.com/SabowaRyan)

---

© 2025 Loventy – Built with ❤️ in Kinshasa


