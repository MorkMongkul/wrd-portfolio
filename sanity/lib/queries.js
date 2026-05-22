import { groq } from 'next-sanity'

export const allSeriesQuery = groq`
  *[_type == "series"] | order(order asc, title asc) {
    _id, title, slug, description, location, year,
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
  *[_type == "featurePageCover"][0] {
    title,
    heroImage { asset->{ _id, url }, hotspot },
    headingTitle,
    subHeading,
    featuredSeries[]-> {
      _id, title, slug, description, location, year,
      "camera": coalesce(select(cameraSelect == "other" => cameraCustom, cameraSelect), camera),
      coverImage { asset->{ _id, url }, hotspot },
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
  }
`

