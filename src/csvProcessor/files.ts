export const foldersQuery = `query{
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

export const lastUpdateQuery = `query($path: String!){
    repository(owner: "CSSEGISandData", name: "COVID-19") {
      object(expression: "master") {
        ... on Commit {
          history(path: $path, first:1) {
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
