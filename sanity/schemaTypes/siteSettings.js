export default {
  name: 'galleryHeroPhoto',
  title: 'GalleryHeroPhoto',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string'
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3
    },
    {
      name: 'credit',
      title: 'Photographer / Credit',
      type: 'string'
    },
    {
      name: 'location',
      title: 'Location',
      type: 'string'
    },
    {
      name: 'galleryHeroImage',
      title: 'Gallery Hero Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Optional. If empty, the Gallery will use the first photo.'
    }
  ],
  preview: {
    select: {
      title: 'title',
      media: 'galleryHeroImage'
    },
    prepare({ title, media }) {
      return {
        title: title || 'GalleryHeroPhoto',
        media
      }
    }
  }
}
