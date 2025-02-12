const videoFragment = /* GraphQL */ `
   fragment video on Video {
      id
      sources {
         url
         format
         mimeType
      }
      alt
   }
`;
export default videoFragment;
