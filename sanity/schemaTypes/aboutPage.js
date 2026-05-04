export default {
  name: 'aboutPage',
  title: 'About Page',
  type: 'document',
  fields: [
    {
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Right-side hero image on the About page.'
    },
    {
      name: 'collageImages',
      title: 'Collage Images',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      description: 'Up to 3 images for the collage section.'
    }
  ],
  preview: {
    prepare() {
      return { title: 'About Page' }
    }
  }
}
