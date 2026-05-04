// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('GalleryHeroPhoto')
        .child(
          S.document()
            .schemaType('galleryHeroPhoto')
            .documentId('galleryHeroPhoto')
        ),
      S.listItem()
        .title('About Page')
        .child(
          S.document()
            .schemaType('aboutPage')
            .documentId('aboutPage')
        ),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => item.getId() !== 'galleryHeroPhoto' && item.getId() !== 'aboutPage'
      )
    ])
