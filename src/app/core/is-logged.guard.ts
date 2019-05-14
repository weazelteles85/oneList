import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { take, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class IsLoggedGuard implements CanActivate {

  constructor(private authService:AuthService, private router:Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      return this.authService.USER.pipe(
        take(1),
        map(user => user ? true : false),
        tap(IsAdmin => {
          if(!IsAdmin) {
            console.error('Access Denied - Must Be Logged In');
            this.router.navigate(['/login'])
          }
        })
      );
  }
}
