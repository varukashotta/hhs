import { saveData, getData } from "../redis/cache";
import { logger } from "../log";

enum Response {
  twitter = "tweets",
  youtube = "videos",
  news = "news",
  redits = "post",
  global = "global"
}



export const getAPIData = async (
  api: any,
  apiName: keyof typeof Response,
  dataPath: string
) => {
  try {
    const data: string = await getData(apiName);
    if (data) return JSON.parse(data);
    if (!data)
      return await getFromSource({
        api,
        url: "/",
        dataArray: dataPath,
        apiName,
      });
  } catch (e) {
    console.log(e);
    throw new Error("Error fetching data, please try reloading the page.");
  }
};

export const getFromSource = async ({
  api,
  url = "/",
  dataArray,
  apiName,
}: {
  api: any;
  url?: string;
  dataArray: string;
  apiName: keyof typeof Response;
}) => {
  const response = await api.get(url);

  const urlPath = dataArray.split(".").map((word: string) => word.trim());

  const urlDataArray = urlPath.reduce(
    (value: any, entry: any) => value[entry],
    response
  );


  if (Array.isArray(urlDataArray)) {
    try {
      const data = urlDataArray.map((items: any) => api.dataReducer(items));

      const result = await saveData(apiName, JSON.stringify(data), 60);

      logger.info({ message: result });

      return data;
    } catch (e) {
      logger.error(e);
    }
  } else {
    throw new Error(`No ${Response[apiName]} found`);
  }
};


export const millisecondsToMinutesAndSeconds = (milliseconds:number) => {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds:any = ((milliseconds % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}
