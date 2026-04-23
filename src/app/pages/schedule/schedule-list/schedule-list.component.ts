import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ScheduleService, Schedule } from '../../../services/schedule.service';
import { WeatherWidgetComponent } from '../weather-widget/weather-widget.component';

@Component({
  selector: 'app-schedule-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, WeatherWidgetComponent],
  templateUrl: './schedule-list.component.html'
})
export class ScheduleListComponent implements OnInit {
  schedules: Schedule[] = [];
  filteredSchedules: Schedule[] = []; // Add this for filtering
  loading = false;
  error: string | null = null;
  
  // Filter properties
  selectedDay: string = 'all';
  searchRoom: string = '';
  selectedClass: string = 'all';
  classes: string[] = [];
  
  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  timeSlots: string[] = [];

  // Computed properties for stats
  get totalSchedules(): number {
    return this.schedules.length;
  }

  get weekdayClasses(): number {
    return this.schedules.filter(s => s.dayOfWeek !== 'Saturday' && s.dayOfWeek !== 'Sunday').length;
  }

  get weekendClasses(): number {
    return this.schedules.filter(s => s.dayOfWeek === 'Saturday' || s.dayOfWeek === 'Sunday').length;
  }

  get activeRooms(): number {
    return new Set(this.schedules.map(s => s.room)).size;
  }

  constructor(private scheduleService: ScheduleService) {
    this.generateTimeSlots();
  }

  generateTimeSlots() {
    for (let hour = 8; hour < 18; hour++) {
      this.timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
      this.timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }

  ngOnInit(): void {
    this.loadSchedules();
  }

  loadSchedules(): void {
    this.loading = true;
    this.error = null;
    this.scheduleService.getAll().subscribe({
      next: (data) => {
        this.schedules = data;
        this.filteredSchedules = data;
        this.classes = [...new Set(data.map(s => s.className).filter(Boolean) as string[])];
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load schedules. Please try again.';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredSchedules = this.schedules.filter(s => {
      const matchesDay = this.selectedDay === 'all' || s.dayOfWeek === this.selectedDay;
      const matchesRoom = !this.searchRoom || s.room.toLowerCase().includes(this.searchRoom.toLowerCase());
      const matchesClass = this.selectedClass === 'all' || s.className === this.selectedClass;
      return matchesDay && matchesRoom && matchesClass;
    });
  }

  resetFilters(): void {
    this.selectedDay = 'all';
    this.searchRoom = '';
    this.selectedClass = 'all';
    this.loadSchedules();
  }

  deleteSchedule(id: number): void {
    if (confirm('Are you sure you want to delete this schedule?')) {
      this.scheduleService.delete(id).subscribe({
        next: () => {
          this.loadSchedules();
        },
        error: (error) => console.error('Error deleting:', error)
      });
    }
  }

  getDayColor(day: string): string {
    const colors: Record<string, string> = {
      'Monday': 'bg-blue-100 text-blue-800',
      'Tuesday': 'bg-green-100 text-green-800',
      'Wednesday': 'bg-purple-100 text-purple-800',
      'Thursday': 'bg-yellow-100 text-yellow-800',
      'Friday': 'bg-indigo-100 text-indigo-800',
      'Saturday': 'bg-pink-100 text-pink-800',
      'Sunday': 'bg-red-100 text-red-800'
    };
    return colors[day] || 'bg-gray-100 text-gray-800';
  }

  getSchedulesForDay(day: string): Schedule[] {
    return this.schedules.filter(s => s.dayOfWeek === day);
  }

  getTimePosition(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = (hours - 8) * 60 + minutes;
    return `${(totalMinutes / 30) * 40}px`;
  }

  getTimeHeight(startTime: string, endTime: string): string {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    const startTotal = startHours * 60 + startMinutes;
    const endTotal = endHours * 60 + endMinutes;
    const durationMinutes = endTotal - startTotal;
    
    return `${(durationMinutes / 30) * 40}px`;
  }

  formatTime(time: string): string {
    return time.substring(0, 5);
  }

  // Advanced features (keep these)
  getConflicts(): { schedule1: Schedule, schedule2: Schedule }[] {
    const conflicts: { schedule1: Schedule, schedule2: Schedule }[] = [];
    
    for (let i = 0; i < this.schedules.length; i++) {
      for (let j = i + 1; j < this.schedules.length; j++) {
        const s1 = this.schedules[i];
        const s2 = this.schedules[j];
        
        if (s1.dayOfWeek !== s2.dayOfWeek) continue;
        
        const s1Start = this.convertToMinutes(s1.startTime);
        const s1End = this.convertToMinutes(s1.endTime);
        const s2Start = this.convertToMinutes(s2.startTime);
        const s2End = this.convertToMinutes(s2.endTime);
        
        if (s1Start < s2End && s2Start < s1End) {
          conflicts.push({ schedule1: s1, schedule2: s2 });
        }
      }
    }
    
    return conflicts;
  }

  convertToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  getMostUsedRoom(): string {
    const roomCount: { [key: string]: number } = {};
    this.schedules.forEach(s => {
      roomCount[s.room] = (roomCount[s.room] || 0) + 1;
    });
    
    let mostUsed = '';
    let maxCount = 0;
    
    for (const [room, count] of Object.entries(roomCount)) {
      if (count > maxCount) {
        maxCount = count;
        mostUsed = room;
      }
    }
    
    return mostUsed || 'None';
  }

  getPeakDay(): string {
    const dayCount: { [key: string]: number } = {};
    this.schedules.forEach(s => {
      dayCount[s.dayOfWeek] = (dayCount[s.dayOfWeek] || 0) + 1;
    });
    
    let peakDay = '';
    let maxCount = 0;
    
    for (const [day, count] of Object.entries(dayCount)) {
      if (count > maxCount) {
        maxCount = count;
        peakDay = day;
      }
    }
    
    return peakDay || 'N/A';
  }
  getFilteredSchedulesForDay(day: string): Schedule[] {
  return this.filteredSchedules.filter(s => s.dayOfWeek === day);
}
 getNextDateForDay(day: string): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    const targetDay = days.indexOf(day);
    const currentDay = today.getDay();
    let daysToAdd = targetDay - currentDay;
    if (daysToAdd <= 0) daysToAdd += 7;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysToAdd);
    return targetDate.toISOString().split('T')[0];
  }
}