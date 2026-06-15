export default {
  name: 'series',
  title: 'GalleryPage',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Series Title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: Rule => Rule.required()
    },
    {
      name: 'collection',
      title: 'Collection Group',
      type: 'reference',
      to: [{ type: 'collection' }],
      description: 'Optional. Group this series under a parent collection (e.g., The Pearl of Asia and Beyond).'
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      description: 'The editorial story or description of the series.'
    },
    {
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'e.g., Kampot, Cambodia'
    },
    {
      name: 'year',
      title: 'Year',
      type: 'string',
      description: 'e.g., 2023'
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
      name: 'coverImage',
      title: 'Cover / Preview Image',
      type: 'image',
      options: { hotspot: true },
      validation: Rule => Rule.required()
    },
    {
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Lower number appears first.'
    },
    {
      name: 'photos',
      title: 'Series Photographs (Editorial Flow)',
      type: 'array',
      description: 'Add, upload, and arrange the photographs belonging to this series. Drag-and-drop to reorder.',
      of: [
        {
          type: 'object',
          name: 'editorialPhoto',
          title: 'Editorial Photo Block',
          fields: [
            {
              name: 'image',
              title: 'Photograph',
              type: 'image',
              options: { hotspot: true },
              validation: Rule => Rule.required()
            },
            {
              name: 'title',
              title: 'Photo Title',
              type: 'string',
              description: 'e.g., First Light'
            },
            {
              name: 'location',
              title: 'Location / Subtitle',
              type: 'string',
              description: 'e.g., Angkor Wat · 5:15 AM'
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
              name: 'date',
              title: 'Date Taken',
              type: 'date'
            },
            {
              name: 'writeup',
              title: 'Write-up / Story Description',
              type: 'text',
              rows: 3,
              description: 'The narrative context or story description for this photograph.'
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
            }
          ],
          preview: {
            select: {
              title: 'title',
              subtitle: 'layout',
              media: 'image'
            },
            prepare({ title, subtitle, media }) {
              return {
                title: title || 'Untitled Photograph',
                subtitle: `Layout: ${subtitle ? subtitle.toUpperCase() : 'LEFT'}`,
                media
              }
            }
          }
        }
      ]
    }
  ]
}
