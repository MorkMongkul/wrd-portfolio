// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('About Page Settings')
        .child(
          S.document()
            .schemaType('aboutPage')
            .documentId('aboutPage')
        ),
      S.listItem()
        .title('Home Featured Settings')
        .child(
          S.document()
            .schemaType('featurePageCover')
            .documentId('featurePageCover')
        ),
      S.divider(),
      S.documentTypeListItem('collection').title('Collections'),
      S.documentTypeListItem('series').title('Gallery Series'),
    ])