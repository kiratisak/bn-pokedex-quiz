import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PokemonAttack {
  name: string;
  damage: string;
}

export interface PokemonWeakness {
  type: string;
  value: string;
}

export interface PokemonCard {
  id: string;
  name: string;
  imageUrl: string;
  hp: string;
  attacks?: PokemonAttack[];
  weaknesses?: PokemonWeakness[];
  types?: string[];
}

export interface CardsResponse {
  cards: PokemonCard[];
}

@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  private apiUrl = 'http://localhost:3030/api/cards';

  constructor(private http: HttpClient) {}

  getCards(
    name: string = '',
    type: string = '',
    limit: number = 20
  ): Observable<CardsResponse> {
    let params = new HttpParams().set('limit', limit.toString());

    if (name) params = params.set('name', name);
    if (type) params = params.set('type', type);

    return this.http.get<CardsResponse>(this.apiUrl, { params });
  }
}
