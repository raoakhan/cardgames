import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

export interface NewsResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private apiKey = environment.newsApiKey;
  private apiUrl = 'https://newsapi.org/v2';
  
  constructor(private http: HttpClient) { }
  
  /**
   * Get top headlines
   * @param category News category (business, entertainment, general, health, science, sports, technology)
   * @param country Country code (us, gb, etc.)
   * @param pageSize Number of articles to return
   * @returns Observable of news articles
   */
  getTopHeadlines(category: string = 'general', country: string = 'us', pageSize: number = 10): Observable<NewsArticle[]> {
    const url = `${this.apiUrl}/top-headlines`;
    const params = {
      apiKey: this.apiKey,
      category,
      country,
      pageSize: pageSize.toString()
    };
    
    return this.http.get<NewsResponse>(url, { params }).pipe(
      map(response => response.articles),
      catchError(error => {
        console.error('Error fetching news:', error);
        return of([]);
      })
    );
  }
  
  /**
   * Search for news articles
   * @param query Search query
   * @param pageSize Number of articles to return
   * @param sortBy Sort method (relevancy, popularity, publishedAt)
   * @returns Observable of news articles
   */
  searchNews(query: string, pageSize: number = 10, sortBy: string = 'publishedAt'): Observable<NewsArticle[]> {
    const url = `${this.apiUrl}/everything`;
    const params = {
      apiKey: this.apiKey,
      q: query,
      pageSize: pageSize.toString(),
      sortBy
    };
    
    return this.http.get<NewsResponse>(url, { params }).pipe(
      map(response => response.articles),
      catchError(error => {
        console.error('Error searching news:', error);
        return of([]);
      })
    );
  }
  
  /**
   * Get news sources
   * @param category Category of news sources
   * @param language Language of news sources (en, fr, etc.)
   * @param country Country of news sources
   * @returns Observable of news sources
   */
  getSources(category?: string, language: string = 'en', country?: string): Observable<any> {
    const url = `${this.apiUrl}/sources`;
    const params: any = {
      apiKey: this.apiKey,
      language
    };
    
    if (category) params.category = category;
    if (country) params.country = country;
    
    return this.http.get(url, { params }).pipe(
      catchError(error => {
        console.error('Error fetching sources:', error);
        return of({ sources: [] });
      })
    );
  }
  
  /**
   * Get a formatted embed URL for a news site
   * @param source Source identifier (e.g., 'bbc-news', 'cnn', etc.)
   * @returns URL that can be embedded in an iframe
   */
  getEmbedUrl(source: string): string {
    // Different news sites have different embed formats
    // This is a simplified version that works for demo purposes
    switch(source) {
      case 'bbc-news':
        return 'https://www.bbc.com/news/av/embed/world';
      case 'cnn':
        return 'https://lite.cnn.com';
      case 'google-news':
        return 'https://news.google.com/embed';
      default:
        return 'https://news.google.com/embed';
    }
  }
}
