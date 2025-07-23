import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  // Add any home page logic here
  welcomeMessage = 'Bienvenue sur notre application';
  
  // Example function
  navigateTo(destination: string) {
    console.log(`Navigating to ${destination}`);
  }
}