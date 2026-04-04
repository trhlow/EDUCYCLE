/**
 * @typedef {Object} UnsplashImage
 * @property {string} id
 * @property {string} alt
 * @property {string} color
 * @property {{thumb?: string, small?: string, regular?: string}} urls
 * @property {number | null} width
 * @property {number | null} height
 * @property {{name?: string, profileUrl?: string}} author
 * @property {{html?: string, downloadLocation?: string}} links
 */

/**
 * @typedef {Object} UnsplashCuratedResponse
 * @property {UnsplashImage[]} items
 * @property {string} fetchedAt
 * @property {number} cacheTtlSeconds
 */

export {};
