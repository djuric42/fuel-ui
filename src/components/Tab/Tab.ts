import {Directive, OnDestroy, Input, Output, HostBinding, EventEmitter} from 'angular2/core';
import {TabSet} from './TabSet';

@Directive({
    selector: 'tab, [tab]'
})
export class Tab implements OnDestroy {
  @Input() public heading:string;
  @Input() public disabled:boolean;
  @Input() public removable:boolean;

  /** tab active state toggle */
  @HostBinding('class.active')
  @Input()
  public get active():boolean {
    return this._active;
  }
  public set active(active:boolean) {
    if (this.disabled && active || !active) {
      
      //Only emit deselect event when changing
      if(this._active && this._active != active) {
        this.deselect.next(this);
      }
      
      if (!active) {
        this._active = active;
      }

      this.activeChange.next(this._active);
      return;
    }
    
    //Only emit select event when changing
    if(this._active != active){
      this.select.next(this);
    }

    this._active = active;
    this.activeChange.next(this._active);
    this.tabset.tabs.forEach((tab:Tab) => {
      if (tab !== this) {
        tab.active = false;
        tab.activeChange.next(false);
      }
    });
  }
  
  @Output() public activeChange:EventEmitter<Tab> = new EventEmitter(false);
  @Output() public select:EventEmitter<Tab> = new EventEmitter(false);
  @Output() public deselect:EventEmitter<Tab> = new EventEmitter(false);
  @Output() public remove:EventEmitter<Tab> = new EventEmitter(false);

  @HostBinding('class.tab-pane') public addClass:boolean = true;

  public tabset:TabSet;
  private _active:boolean;

  public constructor(tabset:TabSet) {
    this.tabset = tabset;
    this.tabset.addTab(this);
  }

  public ngOnDestroy():void {
    this.remove.next(this);
    this.tabset.removeTab(this);
  }
}

export var TAB_PROVIDERS = [
    Tab,
    TabSet
];