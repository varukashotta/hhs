import { RESTDataSource } from "apollo-datasource-rest";
import dotenv from "dotenv";
import { getAPIData } from "./utils";

dotenv.config();

class YoutubeAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = `https://www.googleapis.com/youtube/v3/search?part=snippet&key=${process.env.YOUTUBE_API}&maxResults=25&q=coronavirus&lr=en`;
  }

  dataReducer(video: any) {
    const {
      publishedAt,
      title,
      description,
      thumbnails,
      channelTitle,
    } = video.snippet;

    console.log(video);

    return {
      id: video.id.videoId || 0,
      publishedAt,
      title,
      description,
      thumbnail: thumbnails.high.url,
      author: channelTitle,
    };
  }

  async getVideos() {
    return await getAPIData(this, "youtube", "items");
  }
}

export default YoutubeAPI;
