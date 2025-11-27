import { Component, OnInit } from '@angular/core';
import {
  PokemonService,
  PokemonCard,
} from './services/pokemon.service';

const COLORS: { [key: string]: string } = {
  Psychic: '#f8a5c2',
  Fighting: '#f0932b',
  Fairy: '#c44569',
  Normal: '#f6e58d',
  Grass: '#badc58',
  Metal: '#95afc0',
  Water: '#3dc1d3',
  Lightning: '#f9ca24',
  Darkness: '#574b90',
  Colorless: '#ffffff',
  Fire: '#eb4d4b',
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'bn-pokedex';

  myPokedex: PokemonCard[] = [];
  searchResults: PokemonCard[] = [];

  searchText: string = '';
  searchLimit: number = 20;

  isModalOpen: boolean = false;

  constructor(private pokemonService: PokemonService) {}

  ngOnInit(): void {
    // this.loadInitialCards();
  }

  loadInitialCards(): void {
    this.pokemonService.getCards('', '', 5).subscribe({
      next: (res) => (this.myPokedex = res.cards ?? []),
      error: (err) => console.error('Error load initial cards', err),
    });
  }

  openSearchModal(): void {
    this.isModalOpen = true;
    this.searchCards();
  }

  closeSearchModal(): void {
    this.isModalOpen = false;
  }

  onOverlayClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('modal-overlay')) {
      this.closeSearchModal();
    }
  }

    private readonly TYPE_LIST = [
    'PSYCHIC','FIGHTING','FAIRY','NORMAL','GRASS','METAL','WATER','LIGHTNING','DARKNESS','COLORLESS','FIRE','DRAGON',
  ];

  searchCards(): void {
    const text = this.searchText.trim();
    const limit = this.searchLimit;

    let name = '';
    let type = '';

    if (!text) {
      this.pokemonService.getCards('', '', limit).subscribe({
        next: (res) => {
          const cards = res.cards ?? [];
          const existingIds = new Set(this.myPokedex.map((c) => c.id));
          this.searchResults = cards.filter((c) => !existingIds.has(c.id));
        },
        error: (err) => console.error('Error search cards', err),
      });
      return;
    }

    const upper = text.toUpperCase();

    if (this.TYPE_LIST.includes(upper)) {
      type = text;
    } else {
      name = text;
    }

    this.pokemonService.getCards(name, type, limit).subscribe({
      next: (res) => {
        const cards = res.cards ?? [];
        const existingIds = new Set(this.myPokedex.map((c) => c.id));
        this.searchResults = cards.filter((c) => !existingIds.has(c.id));
      },
      error: (err) => console.error('Error search cards', err),
    });
  }


  addToPokedex(card: PokemonCard): void {
    if (!this.myPokedex.some((c) => c.id === card.id)) {
      this.myPokedex.push(card);
    }
    this.searchResults = this.searchResults.filter((c) => c.id !== card.id);
  }

  removeFromPokedex(card: PokemonCard): void {
    this.myPokedex = this.myPokedex.filter((c) => c.id !== card.id);
  }

  getHpValue(card: PokemonCard): number {
    const raw = Number(card.hp || 0);
    if (isNaN(raw) || raw <= 0) return 0;
    if (raw > 100) return 100;
    return raw;
  }

  getStrengthPercent(card: PokemonCard): number {
    const attacks = card.attacks?.length || 0;
    const val = attacks * 50;
    if (val > 100) return 100;
    if (val <= 0) return 0;
    return val;
  }

  getWeaknessPercent(card: PokemonCard): number {
    const weaknesses = card.weaknesses?.length || 0;
    const val = weaknesses * 100;
    if (val > 100) return 100;
    if (val <= 0) return 0;
    return val;
  }

  getDamage(card: PokemonCard): number {
    if (!card.attacks || card.attacks.length === 0) return 0;
    let sum = 0;
    card.attacks.forEach((atk) => {
      const match = (atk.damage || '').match(/\d+/);
      if (match) sum += Number(match[0]);
    });
    return sum;
  }

  getHappiness(card: PokemonCard): number {
    const hp = this.getHpValue(card);
    const damage = this.getDamage(card);
    const weaknesses = this.getWeaknessPercent(card) / 100;
    const raw = ((hp / 10) + (damage / 10) + 10 - weaknesses) / 5;
    if (raw < 0) return 0;
    if (raw > 5) return 5;
    return raw;
  }

  getHappinessArray(card: PokemonCard): any[] {
    const lvl = Math.round(this.getHappiness(card));
    return Array(lvl).fill(0);
  }

  getTypeString(card: PokemonCard): string {
    return (card.types || []).join(', ');
  }

  getTypeColor(card: PokemonCard): string {
    const type = card.types?.[0];
    if (!type) return '#ffffff';
    return COLORS[type] || '#ffffff';
  }
}
