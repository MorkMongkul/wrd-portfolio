export default {
  name: 'featurePageCover',
  title: 'FeaturePage',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Document Title',
      type: 'string',
      initialValue: 'Feature Page Hero & Collection Settings'
    },
    {
      name: 'heroImage',
      title: 'Hero Photo',
      type: 'image',
      options: { hotspot: true },
      description: 'The main cover photo/hero background image of the Featured page.'
    },
    {
      name: 'headingTitle',
      title: 'Heading Title',
      type: 'string',
      description: 'The big main heading text overlaid on the cover hero image.'
    },
    {
      name: 'subHeading',
      title: 'Sub-heading',
      type: 'text',
      rows: 2,
      description: 'The smaller sub-heading text displayed below the main title.'
    },
    {
      name: 'featuredCollections',
      title: 'Featured Collections',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'collection' }] }],
      description: 'The collections to display as full-screen slides on the homepage.'
    }
  ],
  preview: {
    select: {
      title: 'headingTitle',
      media: 'heroImage'
    },
    prepare({ title, media }) {
      return {
        title: title || 'Feature Page Cover Settings',
        media
      }
    }
  }
}
