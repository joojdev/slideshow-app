let interval

async function loadFiles() {
    const files = await eel.get_file_order()()
    if (!files || files.length === 0) {
        const msg = document.createElement("h1")
        msg.style.color = "white"
        msg.textContent = "No files found in content folder."
        document.body.appendChild(msg)
        return
    }

    let index = 0
    const container = document.getElementById("container")
    container.style.position = "relative"
    container.style.overflow = "hidden"

    async function showNext() {
        const file = files[index]
        const ext = file.split('.').pop().toLowerCase()

        let nextElement
        if (["mp4", "webm", "ogg"].includes(ext)) {
            nextElement = document.createElement("video")
            nextElement.src = `/content/${file}`
            nextElement.autoplay = true
            nextElement.muted = true
            nextElement.playsInline = true
            nextElement.loop = false
            nextElement.style.width = "100%"
            nextElement.style.height = "100%"
            nextElement.style.objectFit = "contain"
            nextElement.style.position = "absolute"
            nextElement.style.top = 0
            nextElement.style.left = 0
            nextElement.style.opacity = 0
            nextElement.style.transition = "opacity 0.5s ease-in-out"
            nextElement.onended = next
            nextElement.oncanplay = () => fadeIn(nextElement)
        } else if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext)) {
            nextElement = new Image()
            nextElement.src = `/content/${file}`
            nextElement.style.width = "100%"
            nextElement.style.height = "100%"
            nextElement.style.objectFit = "contain"
            nextElement.style.position = "absolute"
            nextElement.style.top = 0
            nextElement.style.left = 0
            nextElement.style.opacity = 0
            nextElement.style.transition = "opacity 0.5s ease-in-out"
            nextElement.onload = () => {
                fadeIn(nextElement)
                setTimeout(next, interval * 1000)
            }
        } else {
            next()
            return
        }

        container.appendChild(nextElement)
    }

    function fadeIn(nextElement) {
        const current = container.querySelector(".active")

        // Fade in new
        requestAnimationFrame(() => (nextElement.style.opacity = 1))
        nextElement.classList.add("active")

        // Once visible, remove old
        if (current) {
            current.classList.remove("active")
            current.style.opacity = 0
            setTimeout(() => {
                if (current.parentNode === container) container.removeChild(current)
            }, 500)
        }
    }

    function next() {
        index = (index + 1) % files.length
        showNext()
    }

    showNext()
}

document.addEventListener('DOMContentLoaded', async () => {
    interval = await eel.get_interval()()
    loadFiles()
})

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') window.location = '/'
})
