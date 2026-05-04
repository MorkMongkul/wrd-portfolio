import { groq } from 'next-sanity'

export const featuredPhotosQuery = groq`
  *[_type == "photo" && featured == true] | order(order asc, date desc) {
    _id, title, location, series, date, writeup,
    image { asset->{ _id, url }, hotspot }
  }
`

export const allPhotosQuery = groq`
  *[_type == "photo"] | order(order asc, date desc) {
    _id, title, location, series, date, writeup,
    image { asset->{ _id, url }, hotspot }
  }
`

export const galleryHeroQuery = groq`
  *[_type == "galleryHeroPhoto"][0] {
    title,
    description,
    credit,
    location,
    galleryHeroImage { asset->{ _id, url }, hotspot }
  }
`

export const aboutPageQuery = groq`
  *[_type == "aboutPage"][0] {
    heroImage { asset->{ _id, url }, hotspot },
    collageImages[] { asset->{ _id, url }, hotspot }
  }
`
