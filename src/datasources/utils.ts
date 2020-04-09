import { saveData, getData } from "../redis/cache";
import { logger } from "../log";

export const getAPIData = async (api: any, apiName: string, dataPath: string) => {
  try {
    const data: string = await getData(apiName);
    if (data) return JSON.parse(data);
    if (!data) return await getFromSource(api, "/", dataPath);
  } catch (e) {
    throw new Error("Error fetching data, please try reloading the page.");
  }
};

export const getFromSource = async (api: any, url = "/", dataArray: any) => {
  const response = await api.get(url);

  const urlPath = dataArray.split(".").map((word: string) => word.trim());

  const urlDataArray = urlPath.reduce(
    (value: any, entry: any) => value[entry],
    response
  );

  if (Array.isArray(urlDataArray)) {
    try {
      const data = urlDataArray.map((items: any) => api.dataReducer(items));

      const result = await saveData("youtube", JSON.stringify(data), 600);

      logger.info({ message: result });

      return data;
    } catch (e) {
      logger.error(e);
    }
  } else {
    throw new Error("No videos found");
  }
};
