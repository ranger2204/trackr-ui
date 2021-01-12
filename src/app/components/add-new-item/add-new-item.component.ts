import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { SearchService } from 'src/app/services/search.service';
import { NotifierService } from 'angular-notifier';
import { environment } from 'src/environments/environment'

@Component({
  selector: 'app-add-new-item',
  templateUrl: './add-new-item.component.html',
  styleUrls: ['./add-new-item.component.css']
})
export class AddNewItemComponent implements OnInit {

  getForm: FormGroup;
  item_details: any;
  environment: any = environment;

  constructor(private searchService: SearchService, private notifierService: NotifierService) { 
    this.getForm = this.createGetForm()
    this.item_details = undefined
  }

  ngOnInit(): void {
    this.item_details = {
      'item_name': 'Apple iPad Air (10.5-inch, Wi-Fi, 256GB) - Space Grey',
      'item_url': 'https://www.amazon.in/Apple-iPad-Air-10-5-inch-Wi-Fi-64GB/dp/B07Q2FR5PP/ref=sr_1_1?dchild=1&keywords=Apple+iPad+Air&qid=1594466137&sr=8-1',
      'item_first_price': '58900',
      'item_rating': '21 ratings',
      'item_website': 'amazon',
      'item_img_url': 'https://www.amazon.in/images/I/51y5AX6aOCL._SL1024_.jpg" data-a-image-name="landingImage" class="a-dynamic-image  a-stretch-vertical" id="landingImage" data-a-dynamic-image="{&quot;https://www.amazon.in/images/I/51y5AX6aOCL._SY879_.jpg&quot;:[879,627],&quot;https://www.amazon.in/images/I/51y5AX6aOCL._SY679_.jpg&quot;:[679,484],&quot;https://www.amazon.in/images/I/51y5AX6aOCL._SY606_.jpg&quot;:[606,432],&quot;https://www.amazon.in/images/I/51y5AX6aOCL._SY550_.jpg&quot;:[550,392],&quot;https://www.amazon.in/images/I/51y5AX6aOCL._SY445_.jpg&quot;:[445,317],&quot;https://www.amazon.in/images/I/51y5AX6aOCL._SY500_.jpg&quot;:[500,356],&quot;https://www.amazon.in/images/I/51y5AX6aOCL._SY741_.jpg'
    }

    // this.item_details = {}
  }

  createGetForm(){
    return new FormGroup({
      itemURL: new FormControl()
    })
  }

  onSubmit(){
    let item_url = this.getForm.value.itemURL
    this.searchService.getItem(item_url).subscribe((response:any) => {
      if(response.status==1){
        this.item_details = response['data']
        this.notifierService.notify('success',response.message)
      }
      else{
        this.notifierService.notify('error', response.message)
      }
      
    },
    error => {
      this.notifierService.notify('error', error.name)
    })
  }

  close(){
    this.item_details = undefined
  }

  add(){
    let item_url = this.getForm.value.itemURL
    this.searchService.putItem(item_url).subscribe((response:any) => {
      if(response.status==1){
        console.log(response)
        this.notifierService.notify('success', response.message)
      }
      else{
        this.notifierService.notify('error', response.message)
      }
    },
    error => {
      this.notifierService.notify('error', error.name)
    })
  }

}
