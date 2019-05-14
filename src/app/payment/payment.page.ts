import {
  Component, OnInit, AfterViewInit, OnDestroy, Input, Output, EventEmitter,
  ViewChild, ElementRef, ChangeDetectorRef
} from '@angular/core';
import { Charge, Source } from './models';
import { PaymentService } from '../services/payment.service';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SendGridService } from '../services/send-grid.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.page.html',
  styleUrls: ['./payment.page.scss'],
})
export class PaymentPage implements OnInit {

  //displayAmount: string;
  //chargeValue: 299;
  responseMessage: string;
  errorMessage: string = '';

  totalAmount: number = 299;
  buttonMessage: string = 'Purchase Premium';

  // Emit results of operation to other components
  @Output() stripeResult = new EventEmitter<Charge | Source>();

  // Result used locally to display status.
  result: Charge | Source;

  // The Stripe Elements Card
  @ViewChild('cardElement') cardElement: ElementRef;
  card: any;
  formError: string;
  formComplete = false;
  sendEmailForm: FormGroup;

  // State of async activity
  loading = false;

  constructor(private router: Router,
    private cd: ChangeDetectorRef,
    public pmt: PaymentService,
    public authService: AuthService,
    public sendGrid: SendGridService) { }

  ngOnInit() {
    this.authService.USER.subscribe((user) => {
      if (user.isPremiumUser) {
        this.buttonMessage = 'donate $2.99';
      }
    })
    this.sendEmailForm = new FormGroup({
      'email': new FormControl('', [Validators.required, Validators.email]),
    });
  }
  ngAfterViewInit() {
    try {
      this.card = this.pmt.elements.create('card');
      this.card.mount(this.cardElement.nativeElement)


      // Listens to change event on the card for validation errors
      this.card.on('change', (evt) => {
        this.formError = evt.error ? evt.error.message : null;
        this.formComplete = evt.complete;
        this.cd.detectChanges();
      })
    } catch (error) {
      this.authService.errorMessage = 'Something Went Wrong Error: ' + error;
    }
  }

  // Called when the user submits the form 
  submitPayment(): void {
    this.buttonMessage = 'Sending Payment';
    this.responseMessage = null;
    this.loading = true;
    let action;
    if (this.totalAmount) {
      console.log('create Charge for')
      console.log(this.totalAmount);
      action = this.pmt.createCharge(this.card, 299);
    }
    action.subscribe(
      data => {
        console.log('success');
        this.result = data;
        this.stripeResult.emit(data);
        this.loading = false;
        const editedUser = this.authService.localUser;
        editedUser.isPremiumUser = true;
        this.authService.updateUserData(editedUser);
      },
      err => {
        this.buttonMessage = 'Purchase Premium';
        console.log('error');
        console.log(err);
        this.result = err;
        this.loading = false;
        this.responseMessage = err;
      }
    )
  }

  backToApp() {
    this.router.navigate(['/']);
  }

  ngOnDestroy() {

  }

  onSendEmail(email: string) {
    if (email == this.authService.localUser.email) {
      console.error('can not email yourself');
      this.sendGrid.presentToast('You can not send an email to yourself', 5000);
    }
    else {
      const subject = 'Check out this cool app';
      const htmlBody = `<h5>Hey, check out this cool app from Teles Apps!</h5>
    <p>With this you can keep track of your grocery list across all your devices. You can also 
      share your list with anybody to simultaneously keep track of your shopping 
      progress on both ends.</p>
      <p>simply click on <a href="https://onelist.telesapps.com/login">here</a> to get started or go to:</p>
      <a href="https://onelist.telesapps.com/login">onelist.telesapps.com</a>`;
      this.sendGrid.sendEmail(email, this.authService.localUser.email, subject, htmlBody, true);
      this.sendEmailForm.get('email').setValue('');
    }
  }



}
