import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class JwtHelper {
  decodeToken(token: string) {
    throw new Error('Method not implemented.');
  }
  decodePayload(token: string): any | null {
    // 1. Vérification basique du token
    if (!token || typeof token !== 'string') {
      console.error('Token non valide');
      return null;
    }

    // 2. Découpage et vérification de la structure JWT
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Structure JWT invalide');
      return null;
    }

    try {
      // 3. Décodage Base64 sécurisé
      const base64Url = parts[1];
      const base64 = base64Url
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      
      // 4. Padding pour Base64
      const padLength = 4 - (base64.length % 4);
      const paddedBase64 = padLength < 4 
        ? base64 + '='.repeat(padLength)
        : base64;

      // 5. Décodage et parsing
      const decoded = atob(paddedBase64);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Erreur de décodage JWT:', error);
      return null;
    }
  }

  isTokenExpired(token: string): boolean {
    const payload = this.decodePayload(token);
    if (!payload || !payload.exp) return true;
    
    const now = Date.now() / 1000; // Timestamp en secondes
    return payload.exp < now;
  }
}