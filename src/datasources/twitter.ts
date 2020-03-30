import { RESTDataSource }from "apollo-datasource-rest";
import dotenv from "dotenv";
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

class TwitterAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL =
      `https://api.twitter.com/1.1/search/tweets.json?q=%23covid19&result_type=popular`;
  }

  willSendRequest(request: { headers: { set: (arg0: string, arg1: any) => void; }; }) {
    request.headers.set('Authorization', 'Bearer AAAAAAAAAAAAAAAAAAAAAJPE0AAAAAAAl2%2BUgMIsU%2BjaJsD3RkkMuUdy%2FHg%3DV4aoK5xegk11ey36gScWEd4YYEQoV3dsDJfpYVLgNHV6q5HboF');
  }

  postsReducer(post: any) {

    const {id, user, text, created_at} = post;

    console.log(user);

    return {
      id,
      publishedAt: created_at,
      title: text,
      author: user.screen_name
    };
  }

  async getAllPosts() {
    const response = await this.get("/");

    const responsePosts = response.statuses;

    console.log(response);

    return Array.isArray(responsePosts)
      ? responsePosts.map((posts: any) => this.postsReducer(posts))
      : [];
  }
}

export default TwitterAPI;