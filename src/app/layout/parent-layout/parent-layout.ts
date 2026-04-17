import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-parent-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './parent-layout.html',
  styleUrls: ['./parent-layout.css']
})
export class ParentLayout {}
