export interface Neighborhood {
  name: string;
  jobCount: number;
  city: string;
  state: string;
  image: string;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  neighborhood: string;
  text: string;
  image: string;
}

export interface AffiliateLink {
  id: number;
  title: string;
  description: string;
  platform: string;
  discount: string;
  url: string;
  image: string;
}

export interface Stat {
  label: string;
  value: string;
}
