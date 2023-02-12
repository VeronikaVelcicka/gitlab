import axios from "axios";

export class HttpClient {
  static URL = import.meta.env.VITE_APP_API_URL;

  /**
   * Send GET request.
   *
   * @param {string} url
   */
  static get(url) {
    return axios.get(this.URL + url, {
      headers: {
        Authorization: "Bearer " + import.meta.env.VITE_APP_ACCESS_TOKEN,
      },
    });
  }
}
