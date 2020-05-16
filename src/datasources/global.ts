import { RESTDataSource } from "apollo-datasource-rest";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import {getAPIData, getFromSource} from "./utils";
import {getData} from "../redis/cache";

dotenv.config();

const date = moment(Date.now()).format("YYYY-MM-DD");

class GlobalAPI extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = `https://api.covid19api.com`;
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

    async getGlobal() {
        try {
            const data: string = await getData('global');
            if (data) return JSON.parse(data);
            if (!data) {
               const result = await this.get('/summary');

                console.log(result.Global);
                return {newDeaths : result.Global.NewDeaths, newConfirmed: result.Global.NewConfirmed }
            }
        } catch (e) {
            console.log(e);
            throw new Error("Error fetching data, please try reloading the page.");
        }
    }
}

export default GlobalAPI;
