import { Component } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { bootstrapCheck } from '@ng-icons/bootstrap-icons';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [NgIconComponent, RouterLink],
  providers: [provideIcons({ bootstrapCheck })],
  templateUrl: './content.html',
  styleUrl: './content.css'
})
export class Content {
  scrollToCourses() {
    document.getElementById('featured-courses')?.scrollIntoView({ behavior: 'smooth' });
  }
}
