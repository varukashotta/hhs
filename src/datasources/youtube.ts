import { RESTDataSource } from "apollo-datasource-rest";
import dotenv from "dotenv";
import { saveData, getData } from "../redis/cache";

dotenv.config();

class YoutubeAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = `https://www.googleapis.com/youtube/v3/search?part=snippet&key=${process.env.YOUTUBE_API}&maxResults=25&q=covid-19`;
  }

  videosReducer(video: any) {
    const {
      publishedAt,
      title,
      description,
      thumbnails,
      channelTitle,
    } = video.snippet;

    return {
      id: video.id.videoId || 0,
      publishedAt,
      title,
      description,
      thumbnail: thumbnails.high.url,
      channelTitle,
    };
  }

  async getAllLaunches() {
    try {
      const data:string = await getData("youtube");
      return JSON.parse(data);
    } catch (e) {
      throw new Error("No videos found");
    }

    // const response = await this.get("/");

    // if (Array.isArray(response.items)) {
    //   await saveData(
    //     "youtube",
    //     JSON.stringify(
    //       response.items.map((videos: any) => this.videosReducer(videos))
    //     ),
    //     3600
    //   );

    //   return response.items.map((videos: any) => this.videosReducer(videos));
    // } else {
    //   return [];
    // }

    // throw new Error("No videos found");
  }
}

export default YoutubeAPI;
