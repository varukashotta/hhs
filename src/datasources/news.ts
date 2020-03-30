import { RESTDataSource }from "apollo-datasource-rest";
import dotenv from "dotenv";
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

class NewsAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL =
      `http://newsapi.org/v2/everything?q=covid-19&from=2020-03-29&apiKey=778cb20e2c264898b94672d849531a87&sortBy=popularity`;
  }

  postsReducer(post: any) {

    const {author, title, url, publishedAt} = post;

    console.log(author, title, url, publishedAt);

    return {
      id: uuidv4(),
      publishedAt,
      title,
      link: url,
      author
    };
  }

  async getAllPosts() {
    const response = await this.get("/");

    const responsePosts = response.articles;

    console.log(response);

    return Array.isArray(responsePosts)
      ? responsePosts.map((posts: any) => this.postsReducer(posts))
      : [];
  }
}

export default NewsAPI;