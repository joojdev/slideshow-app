document.addEventListener('DOMContentLoaded', async () => {
    const filePicker = document.querySelector('#filePicker')
    const fileListElement = document.querySelector('#fileList')
    const startButton = document.querySelector('#start')
    const intervalElement = document.querySelector('#interval')
    const intervalValueElement = document.querySelector('#intervalValue')

    // === Interval setup ===
    let interval = await eel.get_interval()()
    refreshInterval()

    function refreshInterval() {
        intervalValueElement.textContent = interval
        intervalElement.value = interval
    }

    intervalElement.addEventListener('change', async (event) => {
        interval = parseInt(event.target.value)
        refreshInterval()
        eel.set_interval(interval)()
    })

    filePicker.addEventListener('change', () => {
        const files = Array.from(filePicker.files)
        if (!files.length) return

        // Create placeholders with spinners
        for (const file of files) {
            // Skip duplicates (already uploading or listed)
            if (document.querySelector(`.file-item[data-filename="${CSS.escape(file.name)}"]`))
                continue

            const li = document.createElement('li')
            li.className = 'file-item uploading'
            li.dataset.filename = file.name

            const nameSpan = document.createElement('span')
            nameSpan.textContent = file.name

            const loader = document.createElement('div')
            loader.className = 'loader'

            li.appendChild(nameSpan)
            li.appendChild(loader)
            fileListElement.appendChild(li)
        }

        // Upload sequentially to keep UI responsive
        async function uploadNext(index = 0) {
            if (index >= files.length) {
                // All done: final refresh to ensure full sync
                await refreshFileList()
                return
            }

            const file = files[index]
            const reader = new FileReader()

            reader.onload = async (event) => {
                const base64Data = event.target.result
                try {
                    await eel.upload_file(file.name, base64Data)()

                    // Replace only this one’s spinner
                    const item = document.querySelector(
                        `.file-item.uploading[data-filename="${CSS.escape(file.name)}"]`
                    )
                    if (item) {
                        item.remove()
                        // Create its real entry (same as refreshFileList builds)
                        const li = document.createElement('li')
                        li.className = 'file-item'
                        li.draggable = true
                        li.dataset.filename = file.name

                        const nameSpan = document.createElement('span')
                        nameSpan.textContent = file.name

                        const deleteBtn = document.createElement('button')
                        deleteBtn.className = 'delete-btn'
                        deleteBtn.textContent = '×'
                        deleteBtn.title = 'Remover'
                        deleteBtn.addEventListener('click', async () => {
                            await eel.delete_file(file.name)()
                            refreshFileList()
                        })

                        li.appendChild(nameSpan)
                        li.appendChild(deleteBtn)
                        fileListElement.appendChild(li)
                    }
                } catch (err) {
                    console.error('Upload failed for', file.name, err)
                }
                uploadNext(index + 1)
            }

            reader.readAsDataURL(file)
        }

        uploadNext()
    })

    // === File list display ===
    async function refreshFileList() {
        const fileList = await eel.get_file_order()()
        fileListElement.innerHTML = ''

        for (const file of fileList) {
            const li = document.createElement('li')
            li.className = 'file-item'
            li.draggable = true
            li.dataset.filename = file

            const nameSpan = document.createElement('span')
            nameSpan.textContent = file

            const deleteBtn = document.createElement('button')
            deleteBtn.className = 'delete-btn'
            deleteBtn.textContent = '×'
            deleteBtn.title = 'Remover'
            deleteBtn.addEventListener('click', async () => {
                await eel.delete_file(file)()
                refreshFileList()
            })

            li.appendChild(nameSpan)
            li.appendChild(deleteBtn)
            fileListElement.appendChild(li)
        }

        enableDragAndDrop()
        saveCurrentOrder()
    }

    // === Drag and drop reorder ===
    function enableDragAndDrop() {
        const list = document.getElementById('fileList')
        let dragEl = null

        list.querySelectorAll('.file-item').forEach(item => {
            item.addEventListener('dragstart', () => {
                dragEl = item
                item.classList.add('dragging')
            })
            item.addEventListener('dragend', () => {
                item.classList.remove('dragging')
                dragEl = null
                saveCurrentOrder()
            })
            item.addEventListener('dragover', (e) => {
                e.preventDefault()
                const draggingOver = e.target.closest('.file-item')
                if (!draggingOver || draggingOver === dragEl) return
                const rect = draggingOver.getBoundingClientRect()
                const next = (e.clientY - rect.top) / rect.height > 0.5
                list.insertBefore(dragEl, next ? draggingOver.nextSibling : draggingOver)
            })
        })
    }

    async function saveCurrentOrder() {
        const files = Array.from(document.querySelectorAll('.file-item'))
            .map(li => li.dataset.filename)
        await eel.set_file_order(files)()
    }

    startButton.addEventListener('click', async () => {
        const files = await eel.list_files()()
        if (!files.length) return
        window.location.href = 'slideshow.html'
    })

    // Initial render
    refreshFileList()
})
