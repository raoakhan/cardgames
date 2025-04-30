import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class YouTubeService {
  private apiLoaded = false;
  
  constructor() { }
  
  /**
   * Load the YouTube IFrame API script
   * @returns Promise that resolves when the API is loaded
   */
  loadYouTubeApi(): Promise<void> {
    return new Promise((resolve, reject) => {
      // If already loaded, resolve immediately
      if (this.apiLoaded) {
        resolve();
        return;
      }
      
      // Create script element
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      
      // Set global callback for when API is ready
      (window as any).onYouTubeIframeAPIReady = () => {
        this.apiLoaded = true;
        resolve();
      };
      
      // Handle errors
      tag.onerror = (error) => {
        reject('YouTube API failed to load: ' + error);
      };
    });
  }
  
  /**
   * Create a YouTube player instance
   * @param elementId ID of the HTML element to contain the player
   * @param videoId YouTube video ID or playlist ID
   * @param isPlaylist Whether the ID is for a playlist
   * @returns Promise that resolves to the YouTube player instance
   */
  createPlayer(elementId: string, videoId: string, isPlaylist: boolean = false): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        // Ensure API is loaded
        await this.loadYouTubeApi();
        
        // Create player with specified options
        const playerOptions: any = {
          height: '100%',
          width: '100%',
          playerVars: {
            autoplay: 0,
            controls: 1,
            modestbranding: 1,
            rel: 0
          },
          events: {
            onReady: (event: any) => resolve(event.target),
            onError: (error: any) => reject(error)
          }
        };
        
        if (isPlaylist) {
          playerOptions.playerVars.listType = 'playlist';
          playerOptions.playerVars.list = videoId;
        } else {
          playerOptions.videoId = videoId;
        }
        
        // Create the player
        const player = new (window as any).YT.Player(elementId, playerOptions);
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Extract video ID from a YouTube URL
   * @param url YouTube URL
   * @returns Video ID
   */
  getVideoIdFromUrl(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }
  
  /**
   * Extract playlist ID from a YouTube URL
   * @param url YouTube URL
   * @returns Playlist ID
   */
  getPlaylistIdFromUrl(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=).*[?&]list=([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2] ? match[2] : null;
  }
}
