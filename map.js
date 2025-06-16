// Mapbox configuration
const MAPBOX_TOKEN = TOKEN
mapboxgl.accessToken = MAPBOX_TOKEN

// Global variables
let map,
  marker,
  userLocation = null
let watchId = null
let isSatelliteView = false

// Initialize the map page
document.addEventListener("DOMContentLoaded", () => {
  initializeMapPage()
})

function initializeMapPage() {
  initMap()
  setupEventListeners()
  setupNavigation()
  hideMapLoading()
}

// Map initialization
function initMap() {
  const defaultLocation = [28.0337, -26.2056] // Johannesburg coordinates

  map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v12",
    center: defaultLocation,
    zoom: 10,
    attributionControl: false,
  })

  // Add custom marker
  marker = new mapboxgl.Marker({
    color: "#6366f1",
    scale: 1.2,
  })
    .setLngLat(defaultLocation)
    .addTo(map)

  // Add navigation controls
  map.addControl(new mapboxgl.NavigationControl(), "top-left")

  // Add fullscreen control
  map.addControl(new mapboxgl.FullscreenControl(), "top-left")

  // Map load event
  map.on("load", () => {
    hideMapLoading()
    updateLocationStatus("Map loaded - Ready to locate", "ready")
  })
}

function hideMapLoading() {
  const loadingElement = document.getElementById("map-loading")
  if (loadingElement) {
    setTimeout(() => {
      loadingElement.style.opacity = "0"
      setTimeout(() => {
        loadingElement.style.display = "none"
      }, 300)
    }, 1000)
  }
}

// Event listeners setup
function setupEventListeners() {
  // Locate button
  const locateBtn = document.getElementById("locate-btn")
  if (locateBtn) {
    locateBtn.addEventListener("click", handleLocationRequest)
  }

  // Map controls
  const recenterBtn = document.getElementById("recenter-btn")
  if (recenterBtn) {
    recenterBtn.addEventListener("click", recenterMap)
  }

  const refreshBtn = document.getElementById("refresh-location")
  if (refreshBtn) {
    refreshBtn.addEventListener("click", refreshLocation)
  }

  const satelliteBtn = document.getElementById("toggle-satellite")
  if (satelliteBtn) {
    satelliteBtn.addEventListener("click", toggleSatelliteView)
  }

  const shareBtn = document.getElementById("share-btn")
  if (shareBtn) {
    shareBtn.addEventListener("click", shareCurrentLocation)
  }
}

// Navigation setup (simplified for map page)
function setupNavigation() {
  const hamburger = document.querySelector(".hamburger")
  const navMenu = document.querySelector(".nav-menu")

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active")
      navMenu.classList.toggle("active")
    })

    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active")
        navMenu.classList.remove("active")
      })
    })
  }
}

// Location handling
function handleLocationRequest() {
  const locateBtn = document.getElementById("locate-btn")

  // Update button state
  locateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Locating...</span>'
  locateBtn.disabled = true

  updateLocationStatus("Getting your location...", "locating")

  if (navigator.geolocation) {
    // Get current position with high accuracy
    navigator.geolocation.getCurrentPosition(
      (position) => showPosition(position),
      (error) => showError(error),
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      },
    )

    // Start watching position for continuous updates
    watchId = navigator.geolocation.watchPosition(
      (position) => updatePosition(position),
      (error) => console.warn("Watch position error:", error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      },
    )
  } else {
    showError({ code: 0, message: "Geolocation is not supported by this browser" })
  }
}

function showPosition(position) {
  const latitude = position.coords.latitude
  const longitude = position.coords.longitude
  const accuracy = position.coords.accuracy
  const timestamp = new Date(position.timestamp)

  userLocation = [longitude, latitude]

  // Update displays
  updateLocationInfo(latitude, longitude, accuracy, timestamp)
  updateMapLocation(userLocation, accuracy)

  // Update button state
  const locateBtn = document.getElementById("locate-btn")
  locateBtn.innerHTML = '<i class="fas fa-check"></i><span>Location Found!</span>'

  setTimeout(() => {
    locateBtn.innerHTML = '<i class="fas fa-sync-alt"></i><span>Update Location</span>'
    locateBtn.disabled = false
  }, 3000)

  // Show additional controls
  document.getElementById("recenter-btn").style.display = "flex"
  document.getElementById("share-btn").style.display = "inline-flex"

  updateLocationStatus("Location found successfully", "success")
  showNotification("Location found successfully!", "success")
}

function updatePosition(position) {
  if (userLocation) {
    const latitude = position.coords.latitude
    const longitude = position.coords.longitude
    const accuracy = position.coords.accuracy
    const timestamp = new Date(position.timestamp)

    userLocation = [longitude, latitude]

    updateLocationInfo(latitude, longitude, accuracy, timestamp)
    updateMapLocation(userLocation, accuracy, false) // Don't fly to location on updates
  }
}

function showError(error) {
  let errorMessage = ""

  switch (error.code) {
    case error.PERMISSION_DENIED:
      errorMessage = "Location access denied. Please allow location access and try again."
      break
    case error.POSITION_UNAVAILABLE:
      errorMessage = "Location information is unavailable. Please check your GPS settings."
      break
    case error.TIMEOUT:
      errorMessage = "Location request timed out. Please try again."
      break
    default:
      errorMessage = "An unknown error occurred while getting your location."
      break
  }

  showNotification(errorMessage, "error")
  updateLocationStatus("Location error - " + errorMessage, "error")

  // Reset button
  const locateBtn = document.getElementById("locate-btn")
  locateBtn.innerHTML = '<i class="fas fa-crosshairs"></i><span>Get My Location</span>'
  locateBtn.disabled = false
}

// Update location information display
function updateLocationInfo(lat, lng, accuracy, timestamp) {
  document.getElementById("coordinates-display").textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`

  document.getElementById("accuracy-display").textContent = `±${Math.round(accuracy)}m`

  document.getElementById("time-display").textContent = timestamp.toLocaleTimeString()

  // Show location info
  const locationInfo = document.getElementById("location-info")
  if (locationInfo.style.display === "none") {
    locationInfo.style.display = "block"
    locationInfo.classList.add("fade-in-up")
  }
}

// Update map with user location
function updateMapLocation(location, accuracy, shouldFly = true) {
  if (shouldFly) {
    map.flyTo({
      center: location,
      zoom: 16,
      duration: 2000,
    })
  } else {
    map.setCenter(location)
  }

  marker.setLngLat(location)

  // Add/update accuracy circle
  if (map.getSource("accuracy-circle")) {
    map.removeLayer("accuracy-circle")
    map.removeSource("accuracy-circle")
  }

  map.addSource("accuracy-circle", {
    type: "geojson",
    data: {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: location,
      },
    },
  })

  map.addLayer({
    id: "accuracy-circle",
    type: "circle",
    source: "accuracy-circle",
    paint: {
      "circle-radius": {
        stops: [
          [0, 0],
          [20, Math.max(accuracy / 4, 10)],
        ],
        base: 2,
      },
      "circle-color": "#6366f1",
      "circle-opacity": 0.2,
      "circle-stroke-color": "#6366f1",
      "circle-stroke-width": 2,
      "circle-stroke-opacity": 0.5,
    },
  })
}

// Map control functions
function recenterMap() {
  if (userLocation) {
    map.flyTo({
      center: userLocation,
      zoom: 16,
      duration: 1500,
    })
    showNotification("Map recentered to your location", "info")
  }
}

function refreshLocation() {
  if (navigator.geolocation) {
    updateLocationStatus("Refreshing location...", "locating")

    navigator.geolocation.getCurrentPosition(
      (position) => {
        showPosition(position)
        showNotification("Location refreshed successfully!", "success")
      },
      (error) => showError(error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0, // Force fresh location
      },
    )
  }
}

function toggleSatelliteView() {
  const satelliteBtn = document.getElementById("toggle-satellite")

  if (isSatelliteView) {
    map.setStyle("mapbox://styles/mapbox/streets-v12")
    satelliteBtn.innerHTML = '<i class="fas fa-satellite"></i>'
    satelliteBtn.title = "Switch to Satellite View"
    isSatelliteView = false
  } else {
    map.setStyle("mapbox://styles/mapbox/satellite-streets-v12")
    satelliteBtn.innerHTML = '<i class="fas fa-map"></i>'
    satelliteBtn.title = "Switch to Street View"
    isSatelliteView = true
  }

  // Re-add marker and accuracy circle after style change
  map.on("styledata", () => {
    if (userLocation) {
      marker.setLngLat(userLocation).addTo(map)
      // Re-add accuracy circle if it exists
      setTimeout(() => {
        const coords = document.getElementById("coordinates-display").textContent
        if (coords && coords !== "--") {
          const [lat, lng] = coords.split(", ").map(Number)
          const accuracy = Number.parseInt(document.getElementById("accuracy-display").textContent)
          updateMapLocation([lng, lat], accuracy, false)
        }
      }, 100)
    }
  })
}

function shareCurrentLocation() {
  if (userLocation && navigator.share) {
    const [lng, lat] = userLocation
    navigator
      .share({
        title: "My Current Location - SnapTrack",
        text: `I'm currently at: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        url: `https://www.google.com/maps?q=${lat},${lng}`,
      })
      .catch(console.error)
  } else if (userLocation) {
    // Fallback: copy to clipboard
    const [lng, lat] = userLocation
    const locationText = `My location: ${lat.toFixed(6)}, ${lng.toFixed(6)} - https://www.google.com/maps?q=${lat},${lng}`

    navigator.clipboard
      .writeText(locationText)
      .then(() => {
        showNotification("Location copied to clipboard!", "success")
      })
      .catch(() => {
        showNotification("Unable to share location", "error")
      })
  } else {
    showNotification("No location to share. Please get your location first.", "error")
  }
}

// Quick action functions
function getDirections() {
  if (userLocation) {
    const [lng, lat] = userLocation
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    window.open(url, "_blank")
  } else {
    showNotification("Please get your location first", "error")
  }
}

function saveLocation() {
  if (userLocation) {
    const [lng, lat] = userLocation
    const locationData = {
      latitude: lat,
      longitude: lng,
      timestamp: new Date().toISOString(),
      name: `Location saved on ${new Date().toLocaleDateString()}`,
    }

    // Save to localStorage
    const savedLocations = JSON.parse(localStorage.getItem("snaptrack-locations") || "[]")
    savedLocations.push(locationData)
    localStorage.setItem("snaptrack-locations", JSON.stringify(savedLocations))

    showNotification("Location saved successfully!", "success")
  } else {
    showNotification("Please get your location first", "error")
  }
}

function shareLocation() {
  shareCurrentLocation()
}

// Update location status indicator
function updateLocationStatus(message, type) {
  const statusElement = document.getElementById("location-status")
  const indicator = statusElement.querySelector(".status-indicator")

  indicator.innerHTML = `<i class="fas fa-circle"></i><span>${message}</span>`
  indicator.className = `status-indicator ${type}`
}

// Notification system (same as main page)
function showNotification(message, type = "info") {
  const existingNotifications = document.querySelectorAll(".notification")
  existingNotifications.forEach((notification) => notification.remove())

  const notification = document.createElement("div")
  notification.className = `notification notification-${type}`
  notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : "info-circle"}"></i>
            <span>${message}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `

  notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#6366f1"};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `

  const style = document.createElement("style")
  style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        .notification-content {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        .notification-close {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 0.25rem;
            margin-left: auto;
        }
    `
  document.head.appendChild(style)

  document.body.appendChild(notification)

  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove()
    }
  }, 5000)

  const closeBtn = notification.querySelector(".notification-close")
  closeBtn.addEventListener("click", () => notification.remove())
}

// Cleanup on page unload
window.addEventListener("beforeunload", () => {
  if (watchId) {
    navigator.geolocation.clearWatch(watchId)
  }
})
