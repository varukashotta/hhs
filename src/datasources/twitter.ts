import { RESTDataSource, RequestOptions } from "apollo-datasource-rest";
import dotenv from "dotenv";

dotenv.config();

class TwitterAPI extends RESTDataSource {
  baseURL = `https://api.twitter.com/1.1/search/tweets.json?q=%23covid19&result_type=popular`;

  willSendRequest(request: RequestOptions) {
    request.headers.set(
      "Authorization",
      `Bearer ${process.env.TWITTER_BEARER_TOKEN}`
    );
  }

  postsReducer(post: any) {
    const { id, user, text, created_at } = post;

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

    return Array.isArray(responsePosts)
      ? responsePosts.map((posts: any) => this.postsReducer(posts))
      : [];
  }
}

export default TwitterAPI;
