const filePicker = document.querySelector('#filePicker')
const fileListElement = document.querySelector('#fileList')
const startButton = document.querySelector('#start')
let fileList;

filePicker.addEventListener('change', () => {
    for (const file of filePicker.files) {
        const reader = new FileReader()

        reader.onload = async (event) => {
            const base64Data = event.target.result
            await eel.upload_file(file.name, base64Data)()
        }

        reader.readAsDataURL(file)
    }
})

async function refreshFileList() {
    fileList = await eel.list_files()()

    fileListElement.innerHTML = ''
    for (const file of fileList) {
        const fileElement = document.createElement('li')
        const deleteButtonElement = document.createElement('span')

        deleteButtonElement.innerHTML = '&times;'
        deleteButtonElement.addEventListener('click', () => {
            eel.delete_file(file)
            refreshFileList()
        })

        fileElement.textContent = file

        fileElement.append(deleteButtonElement)
        fileListElement.append(fileElement)
    }
}

startButton.addEventListener('click', async () => {
    if (!fileList.length) return

    window.location.href = 'slideshow.html'
})

setInterval(refreshFileList, 500)