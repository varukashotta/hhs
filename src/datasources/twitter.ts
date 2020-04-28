import { RESTDataSource, RequestOptions } from "apollo-datasource-rest";
import dotenv from "dotenv";
import { getAPIData } from "./utils";

dotenv.config();

class TwitterAPI extends RESTDataSource {
  baseURL = `https://api.twitter.com/1.1/search/tweets.json?q=%23covid19&result_type=popular&count=50`;

  willSendRequest(request: RequestOptions) {
    request.headers.set(
      "Authorization",
      `Bearer ${process.env.TWITTER_BEARER_TOKEN}`
    );
  }

  dataReducer(post: any) {
    const { id_str, user, text, created_at } = post;

    // console.log(post);

    return {
      id:id_str,
      publishedAt: created_at,
      title: text,
      author: user.screen_name,
    };
  }

  async getTweets() {
    return await getAPIData(this, "twitter", "statuses");
  }
}

export default TwitterAPI;
