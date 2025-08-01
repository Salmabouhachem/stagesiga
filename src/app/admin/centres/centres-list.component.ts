// src/app/admin/centres/centres-list.component.ts
import { Component, Input } from '@angular/core';
import { CentreService } from '../../services/center.service';
import { Centre } from '../../model/centre.model';

@Component({
  selector: 'app-centres-list',
  templateUrl: './centres-list.component.html'

})
export class CentresListComponent {
  @Input() centres: Centre[] = [];
  newCentre: Centre = {
      code: '', name: '', ville: '',
  };

  constructor(private centerService: CentreService) {
    this.loadCentres();
  }

  loadCentres(): void {
    this.centerService.getCentres().subscribe(centres => {
      this.centres = centres;
    });
  }

  addCentre(): void {
    if (this.newCentre.code && this.newCentre.name) {
      this.centerService.createCentre(this.newCentre).subscribe(() => {
        this.loadCentres();
        this.newCentre = { code: '', name: '', ville: '' };
      });
    }
  }
}