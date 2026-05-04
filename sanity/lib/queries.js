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
