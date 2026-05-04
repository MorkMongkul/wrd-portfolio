export default {
  name: 'photo',
  title: 'Photo',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      validation: Rule => Rule.required()
    },
    {
      name: 'location',
      title: 'Location',
      type: 'string'
    },
    {
      name: 'series',
      title: 'Series / Category',
      type: 'string',
      validation: Rule => Rule.required(),
      options: {
        list: [
          { title: 'Street — Urban Phnom Penh', value: 'street' },
          { title: 'Rural — Countryside',       value: 'rural'  },
          { title: 'Landscape',                 value: 'landscape' },
          { title: 'Portraits — People',        value: 'portraits' },
        ]
      }
    },
    {
      name: 'featured',
      title: '★ Show on Featured Slideshow',
      type: 'boolean',
      initialValue: false,
      description: 'Toggle ON to show this photo on the homepage slideshow'
    },
    {
      name: 'date',
      title: 'Date Taken',
      type: 'date'
    },
    {
      name: 'writeup',
      title: 'Write-up',
      type: 'text',
      rows: 4,
      description: 'Short story or description about this image'
    },
    {
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Lower number appears first. Leave blank for automatic.'
    }
  ],
  orderings: [
    {
      title: 'Manual Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }]
    },
    {
      title: 'Newest First',
      name: 'dateDesc',
      by: [{ field: 'date', direction: 'desc' }]
    }
  ],
  preview: {
    select: {
      title:    'title',
      location: 'location',
      series:   'series',
      featured: 'featured',
      media:    'image'
    },
    prepare({ title, location, series, featured, media }) {
      return {
        title:    (featured ? '★ ' : '') + title,
        subtitle: `${series ? series.toUpperCase() : 'NO SERIES'} — ${location || 'no location'}`,
        media
      }
    }
  }
}
