import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { Customer, Charge, StripeObject, Source } from '../payment/models';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { switchMap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
@Injectable()
export class PaymentService {

  private stripe = Stripe(environment.stripePublishable);
  elements: any;

  readonly api = `${environment.functionsURL}/app`;

  constructor(private http: HttpClient) {
    this.elements = this.stripe.elements();
   }

  getCustomer(): Observable<Customer> {
    const url = `${this.api}/customer/`;
    return this.http.get<Customer>(url);
  }

  // Get List of charges
  getCharges(): Observable<Charge[]> {
    const url = `${this.api}/charges/`;
    return this.http.get<StripeObject>(url).pipe(map(res => res.data));
  }


  ///// PAYMENT ACTIONS ////

  createCharge(card: any, amount: number): Observable<Charge> {
    const url = `${this.api}/charges/`;
    return from<Source>( this.stripe.createSource(card) ).pipe(
      switchMap(data => {
        return this.http.post<Charge>(url, { amount, sourceId: data.source.id })
      })
    )
  }

  // Saves a payment source to the user account that can be charged later
  attachSource(card: any): Observable<Source> {
    const url = `${this.api}/sources/`;
    
    return from<Source>( this.stripe.createSource(card) ).pipe(
      switchMap(data => {
        return this.http.post<Source>(url, { sourceId: data.source.id })
      })
    )
  }

}



