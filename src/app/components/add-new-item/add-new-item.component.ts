import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-add-new-item',
  templateUrl: './add-new-item.component.html',
  styleUrls: ['./add-new-item.component.css'],
})
export class AddNewItemComponent implements OnInit {
  getForm: FormGroup;

  constructor(
    private searchService: SearchService,
    private notifierService: ToastrService,
    private router: Router
  ) {
    this.getForm = this.createGetForm();
  }

  ngOnInit(): void {}

  createGetForm() {
    return new FormGroup({
      itemURL: new FormControl(),
    });
  }

  onSubmit() {
    let itemURL = this.getForm.value.itemURL;
    this.searchService.putItem(itemURL).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.notifierService.success(response.message);
          this.router.navigate(['/search']);
        } else {
          this.notifierService.error(response.message);
        }
      },
      error: (error) => {
        this.notifierService.error(error.name);
      },
    });
  }
}
