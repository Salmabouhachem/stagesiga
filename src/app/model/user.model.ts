import { Centre } from "./centre.model";

// src/app/model/user.model.ts
export interface User {
  id?: number; // Optionnel pour les nouveaux utilisateurs
  nom: string;
  prenom: string;
  email: string;
  role: string;
  active?: boolean;
  centres?: Centre[];
  // Alias pour compatibilité
  name?: string; // alias pour 'nom'
}
