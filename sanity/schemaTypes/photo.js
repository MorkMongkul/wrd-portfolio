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
      name: 'cameraSelect',
      title: 'Camera Model',
      type: 'string',
      options: {
        list: [
          { title: 'Fujifilm X-T4', value: 'Fujifilm X-T4' },
          { title: 'Fujifilm X-T5', value: 'Fujifilm X-T5' },
          { title: 'Fujifilm X100V', value: 'Fujifilm X100V' },
          { title: 'Fujifilm X100VI', value: 'Fujifilm X100VI' },
          { title: 'Leica M6', value: 'Leica M6' },
          { title: 'Leica M11', value: 'Leica M11' },
          { title: 'Sony A7R V', value: 'Sony A7R V' },
          { title: 'Sony A7 IV', value: 'Sony A7 IV' },
          { title: 'Canon EOS R5', value: 'Canon EOS R5' },
          { title: 'Nikon Z7 II', value: 'Nikon Z7 II' },
          { title: 'Other (Specify below)', value: 'other' }
        ]
      }
    },
    {
      name: 'cameraCustom',
      title: 'Camera Model (Specify)',
      type: 'string',
      description: 'Input custom camera model if not in the dropdown',
      hidden: ({ parent }) => parent?.cameraSelect !== 'other'
    },
    {
      name: 'series',
      title: 'Series / Project Link',
      type: 'reference',
      to: [{ type: 'series' }],
      validation: Rule => Rule.required()
    },
    {
      name: 'layout',
      title: 'Editorial Layout Style',
      type: 'string',
      initialValue: 'left',
      options: {
        list: [
          { title: 'Left (Photo Left, Text Right)', value: 'left' },
          { title: 'Right (Photo Right, Text Left)', value: 'right' },
          { title: 'Full (Large Center Photo)', value: 'full' },
          { title: 'Masonry (Grouped in a Row Grid)', value: 'masonry' }
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
      title:       'title',
      location:    'location',
      seriesTitle: 'series.title',
      featured:    'featured',
      media:       'image'
    },
    prepare({ title, location, seriesTitle, featured, media }) {
      return {
        title:    (featured ? '★ ' : '') + title,
        subtitle: `${seriesTitle ? seriesTitle.toUpperCase() : 'NO SERIES'} — ${location || 'no location'}`,
        media
      }
    }
  }
}
