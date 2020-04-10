import { RESTDataSource } from "apollo-datasource-rest";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";

dotenv.config();

const date = moment(Date.now()).format("YYYY-MM-DD");

class NewsAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = `https://newsapi.org/v2/top-headlines?q=corona virus&from=${date}&apiKey=${process.env.NEWS_API}&sortBy=popular&pageSize=50`;
  }

  postsReducer(post: any) {
    const { author, title, url, publishedAt } = post;

    return {
      id: uuidv4(),
      publishedAt,
      title,
      link: url,
      author,
    };
  }

  async getNews() {
    const response = await this.get("/");

    const responsePosts = response.articles;

    return Array.isArray(responsePosts)
      ? responsePosts.map((posts: any) => this.postsReducer(posts))
      : [];
  }
}

export default NewsAPI;
