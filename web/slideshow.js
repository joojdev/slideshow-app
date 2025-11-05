async function loadFiles() {
    // Get list of all files from Python
    const files = await eel.list_files()();

    if (!files || files.length === 0) {
    const msg = document.createElement("h1");
    msg.style.color = "white";
    msg.textContent = "No files found in content folder.";
    document.body.appendChild(msg);
    return;
    }

    let index = 0;
    const container = document.getElementById("container");

    async function showNext() {
    container.innerHTML = ""; // Clear previous element
    const file = files[index];
    const ext = file.split('.').pop().toLowerCase();

    let element;

    if (["mp4", "webm", "ogg"].includes(ext)) {
        element = document.createElement("video");
        element.src = `../content/${file}`;
        element.autoplay = true;
        element.muted = true;
        element.onended = next; // Move to next file when video ends
    } else if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext)) {
        element = document.createElement("img");
        element.src = `../content/${file}`;
        setTimeout(next, 3000); // Show images for 3 seconds
    } else {
        // Unsupported file type — skip
        next();
        return;
    }

    container.appendChild(element);
    }

    function next() {
    index = (index + 1) % files.length;
    showNext();
    }

    showNext();
}

document.addEventListener('DOMContentLoaded', loadFiles);