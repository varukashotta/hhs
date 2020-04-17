import { GraphQLClient } from "graphql-request";
import { logger } from "../log/index";
import { lastUpdateQuery, foldersQuery } from "./files";
import moment from "moment";

const gitHubAPI: GraphQLClient = new GraphQLClient(
  "https://api.github.com/graphql",
  {
    headers: {
      Authorization: `bearer ${process.env.GITHUB_API_TOKEN}`,
    },
  }
);

export const gitHub = async ():Promise<string> => {
  return new Promise(async (resolve, reject) => {
    let connection: any;

    const connectToGitHub = async () => {
      try {
        connection = await gitHubAPI.request(foldersQuery);
      } catch (e) {
        console.log(e.response.message);
      }
    };

    try {
      await connectToGitHub();

      if (connection) {
        const contents =
          connection.repository.defaultBranchRef.target.history.nodes;
        const csvDates: any[] = [];

        contents.map((content: any) =>
          content.tree.entries.map(
            (file: any) =>
              file.name === "csse_covid_19_data" &&
              file.object.entries.map((folder: any) => {
                if (folder.name === "csse_covid_19_daily_reports") {
                  folder.object.entries.map((csv: any) => {
                    if (csv.name.includes(".csv")) {
                      //   const output =
                      //     csv.name.substr(0, csv.name.lastIndexOf(".")) || csv.name;
                      csvDates.push(csv);
                    }
                  });
                }
              })
          )
        );

        const fileDates: any = [];

        for (const csv of csvDates) {
          const file = csv.name.substr(0, csv.name.lastIndexOf("."));
          fileDates.push(Date.parse(file));
        }

        const sortedDates = fileDates.sort((a: any, b: any) => b - a);

        const commitTime: any = await getLastCommitTime(
          new Date(sortedDates[0])
        );

        const fileInfo = commitTime.repository.object.history.edges;

        if (fileInfo.length > 0) {
          resolve(fileInfo[0].node.committedDate);
        } else {
          reject(new Error("No file details found!"));
        }
      } else {
        reject("Connection Error!");
      }
    } catch (e) {
      logger.error(e);
      reject(e);
    }
  });
};

export const getLastCommitTime = async (date: Date) => {
  return new Promise(async (resolve, reject) => {
    if (date instanceof Date) {
      const formattedDate = moment(date).format("MM-DD-YYYY");

      const path: string = `csse_covid_19_data/csse_covid_19_daily_reports/${formattedDate}.csv`;

      try {
        const result = await gitHubAPI.request(lastUpdateQuery, { path });
        resolve(result);
      } catch (e) {
        reject(e);
      }
    } else {
      reject("We need a date parameter!");
    }
  });
};
