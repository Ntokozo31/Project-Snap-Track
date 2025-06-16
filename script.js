// Mapbox configuration
const MAPBOX_TOKEN = TOKEN
// mapboxgl is defined in the HTML file
mapboxgl.accessToken = MAPBOX_TOKEN

// Global variables
let map, marker

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
})

function initializeApp() {
  initMap()
  setupEventListeners()
  setupNavigation()
  setupFAQ()
  setupAnimations()
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
  map.addControl(new mapboxgl.NavigationControl(), "top-right")

  // Add fullscreen control
  map.addControl(new mapboxgl.FullscreenControl(), "top-right")
}

// Event listeners setup
function setupEventListeners() {
  // Locate button
  const locateBtn = document.getElementById("locate-btn")
  if (locateBtn) {
    locateBtn.addEventListener("click", handleLocationRequest)
  }

  // Contact form
  const contactForm = document.querySelector(".contact-form form")
  if (contactForm) {
    contactForm.addEventListener("submit", handleContactForm)
  }

  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute("href"))
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  })
}

// Navigation setup
function setupNavigation() {
  const hamburger = document.querySelector(".hamburger")
  const navMenu = document.querySelector(".nav-menu")

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active")
      navMenu.classList.toggle("active")
    })

    // Close menu when clicking on a link
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active")
        navMenu.classList.remove("active")
      })
    })
  }

  // Navbar scroll effect
  window.addEventListener("scroll", () => {
    const navbar = document.querySelector(".navbar")
    if (window.scrollY > 100) {
      navbar.style.background = "rgba(255, 255, 255, 0.98)"
      navbar.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.1)"
    } else {
      navbar.style.background = "rgba(255, 255, 255, 0.95)"
      navbar.style.boxShadow = "none"
    }
  })
}

// FAQ functionality
function setupFAQ() {
  const faqItems = document.querySelectorAll(".faq-item")

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question")

    question.addEventListener("click", () => {
      const isActive = item.classList.contains("active")

      // Close all FAQ items
      faqItems.forEach((faqItem) => {
        faqItem.classList.remove("active")
      })

      // Open clicked item if it wasn't active
      if (!isActive) {
        item.classList.add("active")
      }
    })
  })
}

// Location handling
function handleLocationRequest() {
  const locateBtn = document.getElementById("locate-btn")
  const mapContainer = document.getElementById("map")
  const coordinatesDisplay = document.getElementById("location-coordinates")

  // Update button state
  locateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Locating...</span>'
  locateBtn.disabled = true

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => showPosition(position, locateBtn, mapContainer, coordinatesDisplay),
      (error) => showError(error, locateBtn),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    )
  } else {
    showError({ code: 0, message: "Geolocation is not supported by this browser" }, locateBtn)
  }
}

function showPosition(position, locateBtn, mapContainer, coordinatesDisplay) {
  const latitude = position.coords.latitude
  const longitude = position.coords.longitude
  const accuracy = position.coords.accuracy

  // Update coordinates display
  coordinatesDisplay.innerHTML = `
        <strong>Latitude:</strong> ${latitude.toFixed(6)} | 
        <strong>Longitude:</strong> ${longitude.toFixed(6)} | 
        <strong>Accuracy:</strong> ±${Math.round(accuracy)}m
    `

  // Update map
  const userLocation = [longitude, latitude]
  map.flyTo({
    center: userLocation,
    zoom: 16,
    duration: 2000,
  })

  marker.setLngLat(userLocation)

  // Add accuracy circle
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
        coordinates: userLocation,
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
          [20, accuracy / 2],
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

  // Show map with animation
  mapContainer.classList.add("active")
  mapContainer.scrollIntoView({ behavior: "smooth" })

  // Reset button
  locateBtn.innerHTML = '<i class="fas fa-check"></i><span>Location Found!</span>'
  setTimeout(() => {
    locateBtn.innerHTML = '<i class="fas fa-crosshairs"></i><span>Locate Me Now</span>'
    locateBtn.disabled = false
  }, 3000)

  // Show success notification
  showNotification("Location found successfully!", "success")
}

function showError(error, locateBtn) {
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

  // Reset button
  locateBtn.innerHTML = '<i class="fas fa-crosshairs"></i><span>Locate Me Now</span>'
  locateBtn.disabled = false
}

// Contact form handling
function handleContactForm(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const name = formData.get("name") || e.target.querySelector('input[type="text"]').value
  const email = formData.get("email") || e.target.querySelector('input[type="email"]').value
  const message = formData.get("message") || e.target.querySelector("textarea").value

  // Simulate form submission
  const submitBtn = e.target.querySelector('button[type="submit"]')
  const originalContent = submitBtn.innerHTML

  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Sending...</span>'
  submitBtn.disabled = true

  setTimeout(() => {
    showNotification("Message sent successfully! We'll get back to you soon.", "success")
    e.target.reset()
    submitBtn.innerHTML = originalContent
    submitBtn.disabled = false
  }, 2000)
}

// Notification system
function showNotification(message, type = "info") {
  // Remove existing notifications
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

  // Add styles
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

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove()
    }
  }, 5000)

  // Close button functionality
  const closeBtn = notification.querySelector(".notification-close")
  closeBtn.addEventListener("click", () => notification.remove())
}

// Animation setup
function setupAnimations() {
  // Intersection Observer for scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1"
        entry.target.style.transform = "translateY(0)"
      }
    })
  }, observerOptions)

  // Observe elements for animation
  const animatedElements = document.querySelectorAll(".feature-card, .step, .faq-item")
  animatedElements.forEach((el) => {
    el.style.opacity = "0"
    el.style.transform = "translateY(30px)"
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease"
    observer.observe(el)
  })
}

// Utility functions
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Performance optimization
window.addEventListener("load", () => {
  // Preload critical images
  const criticalImages = ["/placeholder.svg?height=600&width=300"]

  criticalImages.forEach((src) => {
    const img = new Image()
    img.src = src
  })
})
