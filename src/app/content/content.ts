import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [MatIconModule, RouterLink],
  templateUrl: './content.html',
  styleUrl: './content.css'
})
export class Content {
  scrollToCourses() {
    document.getElementById('featured-courses')?.scrollIntoView({ behavior: 'smooth' });
  }
}
