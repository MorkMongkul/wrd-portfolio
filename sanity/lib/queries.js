import { groq } from 'next-sanity'

export const allSeriesQuery = groq`
  *[_type == "series"] | order(order asc, title asc) {
    _id, title, slug, description, location, year,
    collection-> { _id, title, description, order, coverImage { asset->{ _id, url }, hotspot } },
    "camera": coalesce(select(cameraSelect == "other" => cameraCustom, cameraSelect), camera),
    coverImage { asset->{ _id, url }, hotspot },
    order,
    photos[] {
      _key,
      title,
      location,
      "camera": coalesce(select(cameraSelect == "other" => cameraCustom, cameraSelect), camera),
      date,
      writeup,
      layout,
      image { asset->{ _id, url }, hotspot }
    }
  }
`


export const aboutPageQuery = groq`
  *[_type == "aboutPage"][0] {
    heroImage { asset->{ _id, url }, hotspot },
    heading,
    bio,
    ctaTitle,
    ctaDescription,
    email,
    phone,
    instagramUrl,
    facebookUrl,
    linkedinUrl,
    telegramUrl
  }
`

export const featurePageCoverQuery = groq`
  *[_type == "featurePageCover" && (_id == "featurePageCover" || _id == "drafts.featurePageCover")] | order(_updatedAt desc)[0] {
    title,
    featuredCollections[]-> {
      _id,
      title,
      description,
      coverImage { asset->{ _id, url }, hotspot },
      "firstSeriesId": *[_type == "series" && references(^._id)] | order(order asc, title asc)[0]._id
    }
  }
`

