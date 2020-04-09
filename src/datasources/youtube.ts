import { RESTDataSource } from "apollo-datasource-rest";
import dotenv from "dotenv";
import { saveData, getData } from "../redis/cache";
import { logger } from "../log";

dotenv.config();

class YoutubeAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = `https://www.googleapis.com/youtube/v3/search?part=snippet&key=${process.env.YOUTUBE_API}&maxResults=25&q=covid-19`;
  }

  dataReducer(video: any) {
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

  async getItems() {
    try {
      const data: string = await getData("youtube");
      if (data) JSON.parse(data);
      if (!data) await getFromSource(this);
    } catch (e) {
      throw new Error("Error fetching data, please try reloading the page.");
    }
  }
}

const getFromSource = async (api: any) => {
  const response = await api.get("/");

  if (Array.isArray(response.items)) {
    const data = response.items.map((videos: any) => api.dataReducer(videos));

    try {
      const result = await saveData("youtube", JSON.stringify(data), 600);

      logger.info({ message: result });
    } catch (e) {
      logger.error(e);
    }

    return data;
  } else {
    throw new Error("No videos found");
  }
};

export default YoutubeAPI;
