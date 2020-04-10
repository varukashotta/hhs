import { RESTDataSource }from "apollo-datasource-rest";
import dotenv from "dotenv";
import { getAPIData } from "./utils";

dotenv.config();

class RedditAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL =
      `https://www.reddit.com/r/Coronavirus/top.json?limit=50`;
  }

  dataReducer(post: any) {

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
    return await getAPIData(this, "redits", "data.children");
  }
}

export default RedditAPI;