import { RESTDataSource }from "apollo-datasource-rest";
import dotenv from "dotenv";

dotenv.config();

class YoutubeAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL =
      `https://www.googleapis.com/youtube/v3/search?part=snippet&key=${process.env.YOUTUBE_API}&q=covid`;
  }

  videosReducer(video: any) {
    console.log(video);

    const { publishedAt, title, description, thumbnail, thumbnails, channelTitle } = video.snippet;

    return {
      id: video.id.videoId || 0,
      publishedAt,
      title,
      description,
      thumbnails: thumbnails.high,
      channelTitle
    };
  }

  async getAllLaunches() {
    const response = await this.get("/");

    return Array.isArray(response.items)
      ? response.items.map((videos: any) => this.videosReducer(videos))
      : [];
  }
}

export default YoutubeAPI;
