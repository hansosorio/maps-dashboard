/**
 * @typedef {Object} PersonDemographics
 * @property {number} '0-17'
 * @property {number} '18-35'
 * @property {number} '36-55'
 * @property {number} '56+'
 */

/**
 * @typedef {Object} SocioeconomicLevels
 * @property {number} A
 * @property {number} B
 * @property {number} C
 * @property {number} D
 * @property {number} E
 */

/**
 * @typedef {Object} PointOfInterestCount
 * @property {string} type - e.g., 'Restaurants', 'Shops', 'Parks'
 * @property {number} count
 * @property {string} icon - Optional: a simple text-based icon or emoji
 */

/**
 * @typedef {Object} MapPoint
 * @property {string} id - Unique identifier for the point
 * @property {number} lat - Latitude
 * @property {number} lng - Longitude
 * @property {number} kilometer - Kilometer mark
 * @property {string} estimatedFlow - e.g., '150 people/hour'
 * @property {number} radius - Influence radius in meters
 * @property {string} streetViewPanoramaId - Google Street View Panorama ID (simulated or real if you find one)
 * @property {string} description - Brief description for the popup
 * @property {PersonDemographics} demographics - Demographic data for this specific point's influence area
 * @property {SocioeconomicLevels} socioeconomic - Socioeconomic data for this specific point's influence area
 * @property {PointOfInterestCount[]} interestPoints - Points of interest within this influence area
 */

/**
 * @typedef {Object} MockDashboardData
 * @property {Object} path - The main path/highway
 * @property {Array<{lat: number, lng: number}>} path.coordinates - Coordinates defining the path
 * @property {MapPoint[]} mapPoints - Interactive points along the path
 * @property {PersonDemographics} totalDemographics - Aggregated demographics for the whole path
 * @property {SocioeconomicLevels} totalSocioeconomic - Aggregated socioeconomic levels for the whole path
 * @property {PointOfInterestCount[]} totalInterestPoints - Aggregated points of interest for the whole path
 */

const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3 // metres
  const φ1 = (lat1 * Math.PI) / 180 // φ, λ in radians
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  const d = R * c
  return d
}

const interpolatePoint = (start, end, fraction) => {
  return {
    lat: start.lat + (end.lat - start.lat) * fraction,
    lng: start.lng + (end.lng - start.lng) * fraction,
  }
}

const generateMockData = () => {
  const pathCoordinates = [
    { lat: 4.711, lng: -74.0721 },
    { lat: 4.715, lng: -74.07 },
    { lat: 4.72, lng: -74.068 },
    { lat: 4.725, lng: -74.066 },
    { lat: 4.73, lng: -74.064 },
    { lat: 4.735, lng: -74.062 },
    { lat: 4.74, lng: -74.06 },
    { lat: 4.745, lng: -74.058 },
    { lat: 4.75, lng: -74.056 },
  ]

  const mapPoints = []
  let currentKilometer = 0
  let accumulatedDistance = 0

  const kmIntervalMeters = 500

  for (let i = 0; i < pathCoordinates.length - 1; i++) {
    const startSegment = pathCoordinates[i]
    const endSegment = pathCoordinates[i + 1]
    const segmentLengthMeters = getDistanceFromLatLonInMeters(
      startSegment.lat,
      startSegment.lng,
      endSegment.lat,
      endSegment.lng,
    )

    let nextKmTarget = (Math.floor(accumulatedDistance / kmIntervalMeters) + 1) * kmIntervalMeters

    while (nextKmTarget <= accumulatedDistance + segmentLengthMeters) {
      const distanceIntoSegment = nextKmTarget - accumulatedDistance
      const fractionAlongSegment = distanceIntoSegment / segmentLengthMeters

      const pointCoord = interpolatePoint(
        startSegment,
        endSegment,
        Math.min(1, Math.max(0, fractionAlongSegment)),
      )

      currentKilometer++
      const pointId = `km-${currentKilometer}`

      const demographics = {
        '0-17': getRandomInt(50, 200),
        '18-35': getRandomInt(200, 500),
        '36-55': getRandomInt(150, 400),
        '56+': getRandomInt(30, 100),
      }
      const socioeconomic = {
        A: getRandomInt(10, 50),
        B: getRandomInt(50, 150),
        C: getRandomInt(100, 300),
        D: getRandomInt(50, 200),
        E: getRandomInt(20, 100),
      }
      const interestPointsTypes = [
        'Restaurants',
        'Shops',
        'Parks',
        'Schools',
        'Hospitals',
        'Gas Stations',
      ]
      const interestPoints = interestPointsTypes
        .map((type) => ({
          type,
          count: getRandomInt(0, 15),
          icon: type.startsWith('Rest')
            ? '🍔'
            : type.startsWith('Shop')
              ? '🛍️'
              : type.startsWith('Park')
                ? '🌳'
                : type.startsWith('Scho')
                  ? '🏫'
                  : type.startsWith('Hosp')
                    ? '🏥'
                    : '⛽',
        }))
        .filter((p) => p.count > 0)

      mapPoints.push({
        id: pointId,
        lat: pointCoord.lat,
        lng: pointCoord.lng,
        kilometer: currentKilometer,
        estimatedFlow: `${getRandomInt(100, 300)} people/hour`,
        radius: getRandomInt(500, 1500),
        streetViewPanoramaId: `mock_pano_${pointId}`,
        description: `This is kilometer ${currentKilometer} on the path, a key observation point.`,
        demographics: demographics,
        socioeconomic: socioeconomic,
        interestPoints: interestPoints,
      })

      nextKmTarget += kmIntervalMeters
    }
    accumulatedDistance += segmentLengthMeters
  }

  const totalDemographics = { '0-17': 0, '18-35': 0, '36-55': 0, '56+': 0 }
  const totalSocioeconomic = { A: 0, B: 0, C: 0, D: 0, E: 0 }
  const totalInterestPointsMap = {}

  mapPoints.forEach((point) => {
    for (const ageGroup in point.demographics) {
      totalDemographics[ageGroup] += point.demographics[ageGroup]
    }
    for (const ecoClass in point.socioeconomic) {
      totalSocioeconomic[ecoClass] += point.socioeconomic[ecoClass]
    }
    point.interestPoints.forEach((poi) => {
      if (totalInterestPointsMap[poi.type]) {
        totalInterestPointsMap[poi.type].count += poi.count
      } else {
        totalInterestPointsMap[poi.type] = { type: poi.type, count: poi.count, icon: poi.icon }
      }
    })
  })

  const totalInterestPoints = Object.values(totalInterestPointsMap)

  return {
    path: {
      coordinates: pathCoordinates,
    },
    mapPoints: mapPoints,
    totalDemographics: totalDemographics,
    totalSocioeconomic: totalSocioeconomic,
    totalInterestPoints: totalInterestPoints,
  }
}

export const mockDashboardData = generateMockData()

const simulateNetworkDelay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export async function fetchDashboardData() {
  await simulateNetworkDelay(500)
  return mockDashboardData
}

export async function fetchMapPointDetails(pointId) {
  await simulateNetworkDelay(300)
  const point = mockDashboardData.mapPoints.find((p) => p.id === pointId)
  if (!point) throw new Error(`Point with ID ${pointId} not found in mock data.`)
  return point
}

export async function searchGooglePlaces(query) {
  await simulateNetworkDelay(200)

  const mockResults = [
    { description: `Café ${query}`, place_id: `place_caf_${query}` },
    { description: `Parque Central ${query}`, place_id: `place_par_${query}` },
    { description: `Tienda ${query} Market`, place_id: `place_tie_${query}` },
    { description: `Restaurante ${query}`, place_id: `place_res_${query}` },
    { description: `Gym ${query} Fitness`, place_id: `place_gym_${query}` },
  ]

  const filteredResults = mockResults.filter(
    (r) =>
      r.description.toLowerCase().includes(query.toLowerCase()) ||
      query.toLowerCase().includes(r.description.toLowerCase().substring(0, query.length)),
  )

  return filteredResults.slice(0, 3)
}
