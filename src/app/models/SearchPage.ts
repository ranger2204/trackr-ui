export interface SearchResultItem {
  item_add_datetime: string;
  item_email_flag: number;
  item_first_price: number;
  item_id: string;
  item_img_url: string;
  item_latest_price: number;
  item_min_price: number;
  item_name: string;
  item_rating: string;
  item_update_datetime: string;
  item_url: string;
  item_website: string;
}

export interface ItemPriceHistory {
  date: string[];
  prices_min: number[];
  prices_max: number[];
}

export interface ItemTag {
  tag_id: string;
  tag_text: string;
}

export interface FilterConfig {
  keyword: string;
  tags: string;
  price: string;
}
