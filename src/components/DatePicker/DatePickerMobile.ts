/// <reference path="../../../typings/lib.d.ts" />

import {Component, View, OnInit, OnChanges, AfterViewInit} from "angular2/core";
import {Input, Output, EventEmitter, ElementRef, ViewChild, QueryList} from "angular2/core";
import {CORE_DIRECTIVES, FORM_DIRECTIVES} from "angular2/common";
import {DatePickerCalendar} from "./DatePickerCalendar";
import {INFINITE_SCROLLER_PROVIDERS, InfiniteScroller} from "../InfiniteScroller/InfiniteScroller";
import {ElementUtils} from "../../Utilities/ElementUtils";

@Component({
    selector: "date-picker-mobile"
})
@View({
    styleUrls: ["components/DatePicker/DatePickerMobile.css"],
    templateUrl: "components/DatePicker/DatePickerMobile.html",
    directives: [DatePickerCalendar, INFINITE_SCROLLER_PROVIDERS, CORE_DIRECTIVES, FORM_DIRECTIVES]
})
export class DatePickerMobile implements OnInit, AfterViewInit {
    _minDate: Date = new Date(1900,0,1);
	_maxDate: Date = new Date(2200,0,1);

    @Input()
    set minDate(value: Date|string) {
		this._minDate = this.handleDateInput(value);
	}
	get minDate(): Date|string { return this._minDate; };
	
    @Input()
    set maxDate(value: Date|string) {
		this._maxDate = this.handleDateInput(value);
	}
	get maxDate(): Date|string { return this._maxDate; }
    
    @Input() dateFilter: (d: Date) => boolean;
    
    @Output() valueChange = new EventEmitter();
	@Input()
	set value(value: string|Date) {
		this._selectedDate = this.handleDateInput(value);
	}
 
    @ViewChild(InfiniteScroller)
    calendarScroller: InfiniteScroller;
 
	private _selectedDate: Date;
	get selectedDate(): Date { return this._selectedDate; };
	set selectedDate(value: Date) {
		this._selectedDate = value;
		this._inputDate = value.toLocaleDateString();
		this.valueChange.next(this.selectedDate);
		this.hideCalendar();
	}

	private _inputDate: string = "";
	
	get inputDate(): string {return this._inputDate};
	set inputDate(value: string) {
		this._inputDate = value;
		this._selectedDate = new Date(value);
	}
    
	modal: HTMLElement;    
    calendarDisplayed: boolean = true;
    calendarX: number = 1;
	calendarY: number = 1;
    
    calendarMonths: Date[] = [];
    
    _preGenMonths = 2;
 
    constructor(modal: ElementRef) {
        this.modal = modal.nativeElement;
        this.selectedDate = new Date();
        if(this.selectedDate < this._minDate)
            this.selectedDate = this._minDate;
    }
    
    ngOnInit(): void {
        this.calendarMonths = [
            new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth()-1),
            new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth())
        ]
        
        for(let i = 0; i < this._preGenMonths; i++) {
            let earliestDate = this.calendarMonths[0];
            let latestDate = this.calendarMonths[this.calendarMonths.length-1];
            if(this.canPrevMonth)
                this.calendarMonths.unshift(new Date(earliestDate.getFullYear(), earliestDate.getMonth()-1));
            if(this.canNextMonth)
                this.calendarMonths.push(new Date(latestDate.getFullYear(), latestDate.getMonth()+1));
        }
    }
    
    ngAfterViewInit(): void {
        this.modal.addEventListener('click', (e) => {
			if(e.srcElement.className.indexOf('modal') != -1)
				this.hideCalendar();
		});
    }    
    
    handleDateInput(value: string|Date): Date {
		if(value instanceof Date && !isNaN(value.valueOf()))
			return value;
		else
			return new Date(<string>value);
	}
    
    showCalendar(event: MouseEvent): void {
		if(event != null) {
			var clickedRect = event.srcElement.parentElement.getBoundingClientRect();
			this.calendarX = clickedRect.left;
			if(screen.height - clickedRect.bottom <= 500) {
				this.calendarY = (clickedRect.top);
			} else {
				this.calendarY = (clickedRect.top);
			}
		}			
		
		this.ngOnInit();
		this.calendarDisplayed = true;
        
        setTimeout(() => {
            let scrollToMonth = this.calendarMonths.findIndex((m: Date) => {
                return m.getFullYear() == this.selectedDate.getFullYear()
                    && m.getMonth() == this.selectedDate.getMonth()
            });
            
            this.calendarScroller.container.scrollTop = 
                this.calendarScroller.itemQuery.toArray()[scrollToMonth].element.offsetTop - 20;
            
            this.calendarScroller.scrollToIndex(scrollToMonth);
        }, 1);
	}
    
    hideCalendar(): void {
		this.calendarDisplayed = false;
	}
    
    get canPrevMonth(): boolean {
        var currentDate = this.calendarMonths[0];
		var prevDate = 
			new Date(currentDate.getFullYear(), currentDate.getMonth()-1);
		var compareDate = 
			new Date(this._minDate.getFullYear(), this._minDate.getMonth());
		return prevDate >= compareDate;
	}
    
    get canNextMonth(): boolean {
        var currentDate = this.calendarMonths[this.calendarMonths.length-1];
		var nextDate = 
			new Date(currentDate.getFullYear(), currentDate.getMonth()+1); 
		var compareDate = 
			new Date(this._maxDate.getFullYear(), this._maxDate.getMonth());
		return nextDate <= compareDate;
	}
    
    scrollPrevMonth(): void {
        if(this.calendarScroller.topIndex == 0)
            this.addPrevMonth();
        
        setTimeout(() => {
            this.calendarScroller.scrollToIndex(this.calendarScroller.topIndex - 1);
        }, 10);
    }
    
    scrollNextMonth(): void {
        setTimeout(() => {
            this.calendarScroller.scrollToIndex(this.calendarScroller.topIndex + 1);
        }, 10);
    }
    
    addNextMonth(): void {
        if(!this.canNextMonth)
            return;
        
        var lastMonth = this.calendarMonths[this.calendarMonths.length-1];
        var nextMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth()+1);
        this.calendarMonths.push(nextMonth);
    }
    
    addPrevMonth(): void {
        if(!this.canPrevMonth)
            return;
        
        var firstMonth = this.calendarMonths[0];
        var prevMonth = new Date(firstMonth.getFullYear(), firstMonth.getMonth()-1);
        this.calendarMonths.unshift(prevMonth);
    }
}

