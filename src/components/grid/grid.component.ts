import {
  Component,
  OnInit,
  VERSION,
  ViewChild,
  Inject,
  Input,
} from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
// import { threadId } from 'worker_threads';
import data from '../../assets/mock-data.json';

export interface DialogData {
  type: string;
  farmId: number;
  rain: number;
  irrigation: number;
}

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.css'],
})
export class GridComponent implements OnInit {
  ngVersion: string = VERSION.full;
  matVersion: string = '5.1.0';
  breakpoint: number = 3;
  arrayData: any = [...data.data];
  processedData: any = [];

  constructor(public dialog: MatDialog) {}

  ngOnInit() {
    this.breakpoint = window.innerWidth <= 800 ? 1 : 3;
    this.getPercents();
  }

  onResize(event: any) {
    this.breakpoint = event.target.innerWidth <= 800 ? 1 : 3;
  }

  getPercents() {
    this.processedData = this.arrayData.map((lote: any) => {
      let totalRain = lote.rains.length
        ? lote.rains.reduce((pv: number, cv: number) => {
            return pv + cv;
          })
        : 0;
      let totalIrrigations = lote.irrigations.length
        ? lote.irrigations.reduce((pv: number, cv: number) => {
            return pv + cv;
          })
        : 0;
      return {
        ...lote,
        totalRain,
        totalIrrigations,
        percetRain:
          (totalRain * 100) / parseInt(lote.water_per_week.replace('.', '')),
        percentIrrigations:
          (totalIrrigations * 100) /
          parseInt(lote.water_per_week.replace('.', '')),
        water_left:
          parseInt(lote.water_per_week.replace('.', '')) -
          parseInt(totalIrrigations) -
          parseInt(totalRain),
      };
    });
  }

  rain: number = 0;
  irrigation: number = 0;
  type: string = '';

  openDialog(payload: any): void {
    this.type = payload.type;
    const dialogRef = this.dialog.open(DialogAddData, {
      width: '250px',
      data: {
        type: payload.type,
        farmId: payload.farmId,
        rain: this.rain,
        irrigation: this.irrigation,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.saveData(result);
    });
  }

  saveData(newData: any) {
    if (newData.type === 'rain') {
      this.arrayData = this.arrayData.map((lote: any) => {
        if (lote.id === newData.farmId) {
          lote.rains.push(newData.rain);
        }
        console.log(lote);
        return lote;
      });
    } else {
      this.arrayData = this.arrayData.map((lote: any) => {
        if (lote.id === newData.farmId) {
          lote.irrigations.push(newData.irrigation);
        }
        return lote;
      });
    }
    this.getPercents();
  }
}

@Component({
  selector: 'dialog-add-data',
  templateUrl: '../dialog/dialog.component.html',
})
export class DialogAddData {
  constructor(
    public dialogRef: MatDialogRef<GridComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  @Input() rain: number = 0;
  @Input() irrigation: number = 0;

  onNoClick(): void {
    this.dialogRef.close();
  }
}
