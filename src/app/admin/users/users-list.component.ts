import { Component, Input } from '@angular/core';
import { User } from '../../model/user.model';
import { Centre } from '../../model/centre.model';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { catchError, map, Observable, of } from 'rxjs';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css']
})
export class UsersListComponent {
  @Input() users: User[] = [];
  centers: Centre[] = [];
  selectedCenter?: number;
  userToAssign: User | null = null;
  centerToAssign: number | null | undefined =null;

  constructor(private apiService: ApiService ,private authService: AuthService) {
    this.loadCenters();
  }

  loadCenters(): void {
    this.apiService.getCenters().subscribe({
      next: (centers) => this.centers = centers,
      error: (err) => console.error(err)
    });
  }

  filterByCenter(): void {
    if (this.selectedCenter) {
      this.apiService.getUsersByCenter(this.selectedCenter).subscribe({
        next: (users) => this.users = users,
        error: (err) => console.error(err)
      });
    }
  }

 prepareAssignment(selectedUser: User): void {
  this.userToAssign = selectedUser;
  this.centerToAssign = selectedUser.centres?.[0]?.id || null;
}

  assignUserToCenter(): void {
  if (!this.userToAssign?.id || !this.centerToAssign) {
    console.error('ID utilisateur ou centre manquant');
    return;
  }

  this.apiService.assignUserToCenter(
    this.userToAssign.id, // Garanti d'être un number
    this.centerToAssign   // Garanti d'être un number
  ).subscribe({
    next: () => {
      this.filterByCenter();
      this.userToAssign = null;
    },
    error: (err) => console.error(err)
  });
}
  isAdmin(): Observable<boolean> {
  return this.authService.getCurrentUserRole().pipe(
    map(role => role === 'ADMIN'),
    catchError(() => of(false)) // Gestion des erreurs
  );
}
  getCenterNames(user: User): string {
    // Implement your logic to get center names from the user object
    // For example:
    return user.centres?.map(center => center.name).join(', ') || '';
  }
}