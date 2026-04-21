// Booking.com API Wrapper - Vacation/Hotel bookings
// Uses official Booking.com API instead of scraping

const axios = require('axios')

module.exports = {
  name: 'booking.com',
  category: 'diensten',
  subcategory: 'vakanties',
  useAPI: true,

  async parse(html, jobData) {
    // This parser uses API instead of HTML parsing
    const { destination, checkIn, checkOut, guests } = jobData.metadata || {}

    return this.searchHotels(destination, checkIn, checkOut, guests)
  },

  async searchHotels(destination, checkIn, checkOut, guests = 2) {
    const apiKey = process.env.BOOKING_API_KEY
    
    if (!apiKey) {
      throw new Error('Booking.com API key not configured')
    }

    try {
      // Booking.com API endpoint
      const response = await axios.get('https://distribution-xml.booking.com/2.7/json/hotelAvailability', {
        params: {
          hotel_ids: await this.searchDestination(destination),
          checkin: checkIn,
          checkout: checkOut,
          guest_qty: guests,
          room_qty: 1
        },
        headers: {
          'Authorization': `Basic ${Buffer.from(apiKey).toString('base64')}`
        },
        timeout: 30000
      })

      const hotels = this.parseAPIResponse(response.data)

      return {
        category: 'diensten',
        subcategory: 'vakanties',
        source: 'booking.com',
        destination,
        checkIn,
        checkOut,
        guests,
        hotels: hotels.slice(0, 20),
        scrapedAt: Date.now()
      }

    } catch (error) {
      // Fallback to scraping if API fails
      console.warn('Booking.com API failed, falling back to scraping')
      return this.fallbackScraping(destination, checkIn, checkOut, guests)
    }
  },

  async searchDestination(destination) {
    // Search for destination and get hotel IDs
    // This is a simplified version - real implementation would use Booking.com location API
    return [] // Return array of hotel IDs
  },

  parseAPIResponse(data) {
    const hotels = []

    // Parse Booking.com API response
    if (data.result && Array.isArray(data.result)) {
      data.result.forEach(hotel => {
        hotels.push({
          name: hotel.hotel_name,
          price: parseFloat(hotel.min_price?.price || 0),
          rating: parseFloat(hotel.review_score || 0),
          reviews: parseInt(hotel.review_nr || 0),
          stars: parseInt(hotel.class || 0),
          location: hotel.address,
          url: hotel.url,
          image: hotel.main_photo_url
        })
      })
    }

    // Sort by price
    hotels.sort((a, b) => a.price - b.price)

    return hotels
  },

  async fallbackScraping(destination, checkIn, checkOut, guests) {
    // Fallback to HTML scraping if API fails
    // This would use cheerio to parse Booking.com search results
    return {
      category: 'diensten',
      subcategory: 'vakanties',
      source: 'booking.com',
      hotels: [],
      error: 'API unavailable, scraping not implemented yet',
      scrapedAt: Date.now()
    }
  }
}
