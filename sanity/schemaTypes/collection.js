export default {
  name: 'collection',
  title: 'Collection',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Collection Title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      description: 'The editorial introduction or narrative story of this collection.'
    },
    {
      name: 'coverImage',
      title: 'Cover / Preview Image',
      type: 'image',
      options: { hotspot: true }
    },
    {
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Lower number appears first.',
      initialValue: 10
    }
  ],
  preview: {
    select: {
      title: 'title',
      media: 'coverImage'
    },
    prepare({ title, media }) {
      return {
        title: title || 'Untitled Collection',
        media
      }
    }
  }
}
