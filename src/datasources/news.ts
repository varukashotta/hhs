import { RESTDataSource } from "apollo-datasource-rest";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import { getAPIData } from "./utils";

dotenv.config();

const date = moment(Date.now()).format("YYYY-MM-DD");

class NewsAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = `https://newsapi.org/v2/top-headlines?q=corona virus&from=${date}&apiKey=${process.env.NEWS_API}&sortBy=popular&pageSize=50`;
  }

  dataReducer(post: any) {
    const { source, author, title, url, publishedAt, urlToImage } = post;

    console.log(post);

    return {
      id: uuidv4(),
      publishedAt,
      title,
      link: url,
      author: source.name || author,
      thumbnail: urlToImage
    };
  }

  async getNews() {
    return await getAPIData(this, "news", "articles");
  }
}

export default NewsAPI;
