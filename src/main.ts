async function loadFileList() {
  try {
    const response = await fetch('list.json')
    if (!response.ok) {
      throw new Error('Failed to load file list')
    }
    const files: string[] = await response.json()
    displayFiles(files)
  } catch (error) {
    console.error('Error:', error)
    document.body.innerHTML = '<p>Error loading file list</p>'
  }
}

function displayFiles(files: string[]) {
  const container = document.querySelector('.container')
  if (container) {
    if (files.length === 0) {
      const empty = document.createElement('p')
      empty.textContent = 'No files found in public directory'
      container.appendChild(empty)
    } else {
      const list = document.createElement('ul')
      files.forEach((file) => {
        const item = document.createElement('li')
        const link = document.createElement('a')
        link.href = file
        link.textContent = file
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
        item.appendChild(link)
        list.appendChild(item)
      })
      container.appendChild(list)
    }
  }
}

document.addEventListener('DOMContentLoaded', loadFileList)
