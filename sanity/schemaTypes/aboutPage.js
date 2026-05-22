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
      name: 'heading',
      title: 'Heading Lines',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Heading lines displayed on the left side of the About page (e.g., "Street.", "Light.", "Story.").'
    },
    {
      name: 'bio',
      title: 'Biography Description',
      type: 'text',
      rows: 4,
      description: 'Main biography description text.'
    },
    {
      name: 'ctaTitle',
      title: 'CTA Title',
      type: 'string',
      description: 'Call to action section title (e.g., "Let\'s Work Together").'
    },
    {
      name: 'ctaDescription',
      title: 'CTA Description',
      type: 'text',
      rows: 3,
      description: 'Call to action section description text.'
    },
    {
      name: 'email',
      title: 'Contact Email',
      type: 'string',
      description: 'Owner email address.'
    },
    {
      name: 'phone',
      title: 'Contact Phone',
      type: 'string',
      description: 'Owner phone number.'
    },
    {
      name: 'instagramUrl',
      title: 'Instagram URL',
      type: 'url',
      description: 'Full Instagram profile link.'
    },
    {
      name: 'facebookUrl',
      title: 'Facebook URL',
      type: 'url',
      description: 'Full Facebook page link.'
    },
    {
      name: 'linkedinUrl',
      title: 'LinkedIn URL',
      type: 'url',
      description: 'Full LinkedIn profile link.'
    },
    {
      name: 'telegramUrl',
      title: 'Telegram URL',
      type: 'url',
      description: 'Full Telegram link.'
    }
  ],
  preview: {
    prepare() {
      return { title: 'About Page' }
    }
  }
}
