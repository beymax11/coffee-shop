export interface Testimonial {
  name: string;
  role: string;
  quote: string;
  rating: number;
}

export const testimonials: Testimonial[] = [
  {
    name: "Eleanor Vance",
    role: "Lifestyle Critic",
    quote: "L'OR NOIR isn't just a coffee shop; it's a sensory lounge. The Gold Leaf Latté is an absolute masterpiece of both taste and presentation.",
    rating: 5,
  },
  {
    name: "Kenji Sato",
    role: "Architect",
    quote: "The Japanese-minimalist design language combined with the rich chocolate notes of their single-origin Boquete beans creates a perfect morning ritual.",
    rating: 5,
  },
  {
    name: "Amélie Dubois",
    role: "Event Director",
    quote: "We booked their mobile coffee cart for our Paris fashion gala. Guests are still talking about the Black Truffle Espresso Mocktails. Utterly flawless service.",
    rating: 5,
  }
];
