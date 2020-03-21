import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-standings-dialog',
  templateUrl: './standings-dialog.component.html',
  styleUrls: ['./standings-dialog.component.scss']
})
export class StandingsDialogComponent implements OnInit {
  loading: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<StandingsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) { }

  ngOnInit() {
    this.loading = false;
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
