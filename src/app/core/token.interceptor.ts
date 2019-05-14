import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from "@angular/common/http";
import { Injector, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { switchMap } from "rxjs/operators";
import { AuthService } from "../services/auth.service";

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

    auth: AuthService

    constructor(private inj: Injector) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {


        if (request.url.indexOf('oauthCallback') > -1) {
            return next.handle(request);
        }

        this.auth = this.inj.get(AuthService) // inject the authservice manually (see https://github.com/angular/angular/issues/18224)

        if (this.auth.getUserIdToken() != null) {
            return this.auth.getUserIdToken().pipe(
                switchMap(token => {
                    //console.log('inside switchmap');
                    request = request.clone({
                        setHeaders: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    //console.log(request);
                    //console.log('request Intercepted');
                    return next.handle(request);
                })
            )
        } else { return next.handle(request); }
    }
}