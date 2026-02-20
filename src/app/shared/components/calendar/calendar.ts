import { Component, computed, EventEmitter, Output, signal, Signal, WritableSignal } from '@angular/core';
import { DateTime, Info, Interval } from 'luxon';


@Component({
  selector: 'app-calendar',
  imports: [],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
})
export class Calendar {
  activeDay: WritableSignal<DateTime | null> = signal(null);
  @Output() daySelected = new EventEmitter<DateTime>();

  today: Signal<DateTime> = signal(DateTime.local());
  firstDayOfActiveMonth: WritableSignal<DateTime> = signal(this.today().startOf('month'));
  weekDays:Signal<string[]> = signal(Info.weekdays('short'));
  daysOfMonth:Signal<DateTime[]> = computed(() => {
    return Interval.fromDateTimes(this.firstDayOfActiveMonth().startOf('week'), this.firstDayOfActiveMonth().endOf('month').endOf('week'))
    .splitBy({ days: 1 }).map((d) =>{
      if(d.start === null){
        throw new Error("Wrong date");
      }
      return d.start;
    });
  });

  constructor() {
    
  }

  goToPreviousMonth(event: MouseEvent) {
    event.stopPropagation();
    this.firstDayOfActiveMonth.set(
      this.firstDayOfActiveMonth().minus({ month: 1 }),
    );
  }
  goToNextMonth(event: MouseEvent) {
    event.stopPropagation();
    this.firstDayOfActiveMonth.set(
      this.firstDayOfActiveMonth().plus({ month: 1 }),
    );
  }

  selectDay(day: DateTime) {
    this.activeDay.set(day);
    this.daySelected.emit(day);
  }
  
}
