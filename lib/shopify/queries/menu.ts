// export const getMenuQuery = /* GraphQL */ `
//   query getMenu($handle: String!) {
//     menu(handle: $handle) {
//       items {
//         title
//         url
//       }
//     }
//   }
// `;


export const getMenuQuery = /* GraphQL */ `
  query getMenu($handle: String!) {
    menu(handle: $handle) {
      id
      title
      items {
        title
        url
        items {
          title
          url
          items {
            title
            url
          }
        }
      }
    }
  }
`;