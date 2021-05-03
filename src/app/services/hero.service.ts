import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HeroService {

  URL = environment.api;

  constructor(private http: HttpClient) {}

  headers = new HttpHeaders()
  .set('content-type', 'application/json')
  .set('Access-Control-Allow-Origin', '*')

  list() {
    return this.http.get(`${this.URL}/Heroes`);
  }

  add(hero) {
    hero.Active = true;
    return this.http.post(`${this.URL}/Heroes`, hero, { headers: this.headers });
  }

  edit(hero) {
    return this.http.put(`${this.URL}/Heroes/${hero.Id}`, hero, { headers: this.headers });
  }

  delete(id) {
    return this.http.delete(`${this.URL}/Heroes/${id}`, { headers: this.headers });
  }
}
