import { RESTDataSource }from "apollo-datasource-rest";
import dotenv from "dotenv";

dotenv.config();

class RedditAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL =
      `https://www.reddit.com/r/Coronavirus/top.json?limit=50`;
  }

  postsReducer(post: any) {

    const {id, title, permalink, created_utc, author_fullname, thumbnail} = post.data;


    return {
      id,
      publishedAt: created_utc,
      title,
      link: permalink,
      author: author_fullname,
      thumbnail
    };
  }

  async getRedits() {
    const response = await this.get("/");

    const responsePosts = response.data.children;


    return Array.isArray(responsePosts)
      ? responsePosts.map((posts: any) => this.postsReducer(posts))
      : [];
  }
}

export default RedditAPI;