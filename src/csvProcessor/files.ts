const foldersQuery = `query{
    repository(owner:"CSSEGISandData", name:"COVID-19") {
      defaultBranchRef {
        target {
          ... on Commit {
            history(first: 1 ) {
              nodes {
                tree {
                  entries {
                    name
                    object {
                      ... on Tree {
                        entries {
                          name
                          object{
                            ...on Tree{
                              entries{
                                name
                                object{
                                  ...on Tree{
                                    entries{
                                      name
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }`;

const lastUpdateQuery = `query{
    repository(owner: "CSSEGISandData", name: "COVID-19") {
      object(expression: "master") {
        ... on Commit {
          history(path: "csse_covid_19_data/csse_covid_19_daily_reports/04-09-2020.csv", first:1) {
            edges {
              node {
                commitUrl
                committedDate
              }
            }
          }
        }
      }
    }
}`;
